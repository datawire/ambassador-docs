# Get started with Envoy Proxy

Using microservices to solve real-world problems always involves more than simply writing the code. You need to test your services. You need to figure out how to do continuous deployment. You need to work out clean, elegant, resilient ways for them to talk to each other.

A really interesting tool that can help with the “talk to each other” bit is the [Envoy Proxy](https://www.envoyproxy.io/) from Lyft.

Envoy Proxy Overview
Envoy Proxy is a modern, high performance, small footprint edge and service proxy. Envoy adds resilience and observability to your services, and it does so in a way that’s transparent to your service implementation. It might feel odd to see us call out something that identifies itself as a proxy – after all, there are a ton of proxies out there, and the 800-pound gorillas are NGINX and HAProxy, right? Here’s some of what’s interesting about Envoy:

* It can proxy any TCP protocol.
* It can do SSL. Either direction.
* It makes HTTP/2 a first class citizen, and can translate between HTTP/2 and HTTP/1.1 (either direction).
* It has good flexibility around discovery and load balancing.
* It’s meant to increase visibility into your system.
    * In particular, Envoy can generate a lot of traffic statistics and such that can otherwise be hard to get.
    * In some cases (like MongoDB and Amazon RDS) Envoy actually knows how to look into the wire protocol and do transparent monitoring.
* It’s less of a nightmare to set up than some others.
* It’s a sidecar process, so it’s completely agnostic to your services’ implementation language(s).
* Envoy is also extensible in some fairly sophisticated — and complex — ways, but we’ll dig into that later — possibly much later. For now we’re going to keep it simple. 

Being able to proxy any TCP protocol, including using SSL, is a pretty big deal. Want to proxy Websockets? Postgres? Raw TCP? Go for it. Also note that Envoy can both accept and originate SSL connections, which can be handy at times: you can let Envoy do client certificate validation, but still have an SSL connection to your service from Envoy.

Of course, HAProxy can do arbitrary TCP and SSL too — but all it can do with HTTP/2 is forward the whole stream to a single backend server that supports it. NGINX can’t do arbitrary protocols (although to be fair, Envoy can’t do e.g. FastCGI, because Envoy isn’t a web server). Neither open-source NGINX nor HAProxy handle service discovery very well (though NGINX Plus has some options here). And neither has quite the same stats support that a properly-configured Envoy does.

Overall, what we’re finding is that Envoy is looking promising for being able to support many of our needs with just a single piece of software, rather than needing to mix and match things. One final note: Envoy Proxy is an official, graduated CNCF project, with a huge community. So unlike HAProxy and NGINX, which are controlled by a vendor, Envoy has vendor-neutral governance which is an [important consideration for many projects](https://blog.getambassador.io/envoy-vs-nginx-vs-haproxy-why-the-open-source-ambassador-api-gateway-chose-envoy-23826aed79ef).

##Envoy Architecture

While I said that Envoy is less of a nightmare to set up than some other things I worked with, you’ll note that I didn’t say it was necessarily easy. Envoy’s learning curve is a bit steep at first, and it’s instructive to look at why.

## Envoy and the Network Stack
Let’s say you want to write an HTTP network proxy. There are two obvious ways to approach this: work at the level of HTTP, or work at the level of TCP.

At the HTTP level, you’d read an entire HTTP request off the wire, parse it, look at the headers and the URL, and decide what to do. Then you’d read the entire response from the back end, and send it to the client. This is an OSI Layer 7 (Application) proxy: the proxy has full knowledge of what exactly the user is trying to accomplish, and it gets to use that knowledge to do very clever things.

The downside is that it’s complex and slow – think of the latency it’s introducing reading and parsing the entire request before making any decisions! Worse, sometimes the highest-level protocol simply doesn’t have the information that you need for your decisions. A good example of this is SSL: before the SRI extension was added, the SSL client would never state which host it was trying to connect to — so although HTTP servers handled virtual hosts just fine (with the HTTP/1.1 Host header), as soon as SSL was involved you had to dedicate an IP address to your server, because a layer 7 proxy simply didn’t have the information needed to proxy SSL correctly.

So maybe a better choice is operating down at the TCP level: just read and write bytes, and use IP addresses, TCP port numbers, etc., to make your decisions about how to handle things. This is an OSI Layer 3 (Network) or Layer 4 (Transport) proxy, depending on who you talk to. We’ll borrow from Envoy’s terminology and call it a Layer 3/4 proxy.

Things can be very fast in this model, and certain things become very elegant and simple (see our SSL example above). On the other hand, suppose you want to proxy different URLs to different back ends? That’s not possible with the typical L3/4 proxy: higher-level application information isn’t accessible down at these layers.

Envoy deals with the fact that both of these approaches have real limitations by operating at layers 3, 4, and 7 simultaneously. This is extremely powerful, and can be very performant… but you generally pay for it with configuration complexity.

The challenge is to keep simple things simple while allowing complex things to be possible, and Envoy does a tolerably good job of that for things like HTTP proxying.

## The Envoy Mesh

The next bit that’s a little surprising about Envoy is that most applications involve two layers of Envoys, not one:

* First, there’s an “edge Envoy” running all by itself somewhere. The job of the edge Envoy is to give the rest of the world a single point of ingress. Incoming connections from outside come here, and the edge Envoy decides where they go internally.
* Second, each instance of a service has its own Envoy running alongside it, a separate process next to the service itself. These “service Envoys” keep an eye on their services, and remember what’s running and what’s not.
* All of the Envoys form a mesh, and share routing information amongst themselves.
* If desired (as it typically will be), interservice calls can go through the Envoy mesh as well. We’ll get into this later.

Note that you could, of course, only use the edge Envoy, and dispense with the service Envoys. However, with the full mesh, the service Envoys can do health monitoring and such, and let the mesh know if it’s pointless to try to contact a down service. Also, Envoy’s statistics gathering works best with the full mesh (more on that in a separate article, though).

All the Envoys in the mesh run the same code, but they are of course configured differently… which brings us to the Envoy configuration file.

## Envoy Configuration Overview

Envoy’s configuration starts out looking simple: it consists primarily of listeners and clusters.

A *listener* tells Envoy a TCP port on which it should listen, and a set of *filters* with which Envoy should process what it hears. A *cluster* tells Envoy about one or more backend *hosts* to which Envoy can proxy incoming requests. So far so good. There are two big ways that things get much less simple, though:

* Filters can – and usually must – have their own configuration, which is often more complex than the listener’s configuration!
* Clusters get tangled up with load balancing, and with external things like DNS.

Since we’ve been talking about HTTP proxying, let’s continue with a look at the `http_connection_manager` filter. This filter operates at layer 3/4, so it has access to information from IP and TCP (like the host and port numbers for both ends of the connection), but it also understands the HTTP protocol well enough to have access to the HTTP URL, headers, etc., both for HTTP/1.1 and HTTP/2. Whenever a new connection arrives, the `http_connection_manager` uses all this information to decide which Envoy cluster is best suited to handle the connection. The Envoy cluster then uses its load balancing algorithm to pick a single member to handle the HTTP connection.

The filter configuration for `http_connection_manager` is a dictionary with quite a few options, but the most critical one for our purposes at the moment is the `virtual_hosts` array, which defines how exactly the filter will make routing decisions. Each element in the array is a dictionary containing the following attributes:

* `name`: a human-readable name for the service
* `domains`: an array of DNS-style domain names, one of which must match the domain name in the URL for this virtual_host to match
* `routes`: an array of route dictionaries.

Each route dictionary needs to include, at minimum:

* `prefix`: URL path prefix for this route
* `cluster`: Envoy cluster to handle this request
* `timeout_ms`: timeout for giving up if something goes wrong

All of this means that the simplest case of HTTP proxying — listening on a specified port for HTTP, then routing to different hosts depending on the URL — is actually pretty simple to configure in Envoy.

An example: to proxy URLs starting with `/service1` to a cluster named `service1`, and URLs starting with `/service2` to a cluster named `service2`, you could use:

```
“virtual_hosts”: [
                  {
                    “name”: “service”,
                    “domains”: [“*”],
                    “routes”: [
                      {
                        “timeout_ms”: 0,
                        “prefix”: “/service1”,
                        “cluster”: “service1”
                      },
                      {
                        “timeout_ms”: 0,
                        “prefix”: “/service2”,
                        “cluster”: “service2”
                      }
                    ]
                  }
                ]
```

That’s it. Note that we use `domains [“*”]` to indicate that we don’t much care which host is being requested, and also note that we can add more routes as needed. Finally, this listener configuration is basically the same between the edge Envoy and service Envoy(s): the main difference is that a service Envoy will likely have only one route, and it will proxy only to the service on localhost rather than a cluster containing multiple hosts.

Of course, we would still need to define the `service1` and `service2` clusters referenced in the `virtual_hosts` section above. We do this is in the `cluster_manager` configuration section, which is also a dictionary and also has one critical component, called `clusters`. Its value is, again, an array of dictionaries:

* `name`: a human-readable name for the cluster
* `type`: how will this cluster know which hosts are up?
* `lb_type`: how will this cluster handle load balancing?
* `hosts`: an array of URLs defining the hosts in the cluster (usually these are `tcp://` URLs, in fact).

The possible values for `type` are:

* `static`: every possible host is listed in the cluster
* `strict_dns`: Envoy will monitor DNS, and every matching A record will be assumed valid
* `logical_dns`: Envoy will basically use the DNS to add hosts, but will not discard them if they’re no longer returned by DNS (think round-robin DNS with hundreds of hosts — we’ll get more into this in subsequent articles)
* `sds`: Envoy will query an external REST service to find cluster members

And the possible values for `lb_type` are:

* `round_robin`: cycle over all healthy hosts in order
* `weighted_least_request`: select two random healthy hosts and pick the one with the fewest requests (this is O(1), where scanning all healthy hosts would be O(n). Lyft claims that research indicates that the O(1) algorithm “is nearly as good” as the full scan.)
* `random`: pick a random host

One interesting note about load balancing: a cluster can also define a *panic threshold* where, if the number of healthy hosts in the cluster falls below the panic threshold, the cluster will decide that the health-check algorithm is broken, and assume all the hosts in the cluster are healthy. This could lead to surprises, so it’s good to be aware of it!

A simple case for an edge Envoy might be something like

```
“clusters”: [
                  {
                    “name”: “service1”,
                    “type”: “strict_dns”,
                    “lb_type”: “round_robin”,
                    “hosts”: [
                      {
                        “url”: “tcp://service1:80”
                      }
                    ]
                  },
                  {
                    “name”: “service2”,
                    “type”: “strict_dns”,
                    “lb_type”: “round_robin”,
                    “hosts”: [
                      {
                        “url”: “tcp://service2:80”
                      }
                    ]
                  }
                ]
```

Since we’ve marked this cluster with type `strict_dns`, we’ll rely on finding `service1` and `service2` in the DNS, and we’ll assume that any new service instances coming up will be added to the DNS — this is probably appropriate for something like a setup using `docker-compose`, for example. For a service Envoy (say for `service1`), we might go a more direct route:

```
“clusters”: [
                  {
                    “name”: “service1”,
                    “type”: “static”,
                    “lb_type”: “round_robin”,
                    “hosts”: [
                      {
                        “url”: “tcp://127.0.0.1:5000”
                      }
                    ]
                  }
                ]
```

Same idea, just a different target: rather than redirecting to some other host, we always go to our service on the local host.

## Up Next
So that’s the ten-thousand-foot view of Envoy, plus a bit of a dive down into Envoy’s background and configuration. Next up, we’ll tackle actually deploying a simple application using Kubernetes, Postgres, Flask, and Envoy, and watch how things go as we scale it up and down. Stay tuned.