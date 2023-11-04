# Telepresence with Docker Golden Path

## Why?

It can be tedious to adopt Telepresence across your organization, since in its handiest form, it requires admin access, and needs to get along with any exotic
networking setup that your company may have.

If Docker is already approved in your organization, this Golden path should be considered.

## How?

When using Telepresence in Docker mode, users can eliminate the need for admin access on their machines, address several networking challenges, and forego the need for third-party applications to enable volume mounts.

You can simply add the docker flag to any Telepresence command, and it will start your daemon in a container. 
Thus removing the need for root access, making it easier to adopt as an organization

Let's illustrate with a quick demo, assuming a default Kubernetes context named default, and a simple HTTP service:

```cli
$ telepresence connect --docker
Connected to context default (https://default.cluster.bakerstreet.io)

$ docker ps
CONTAINER ID   IMAGE                          COMMAND                  CREATED          STATUS          PORTS                        NAMES
7a0e01cab325   datawire/telepresence:2.12.1   "telepresence connec…"   18 seconds ago   Up 16 seconds   127.0.0.1:58802->58802/tcp   tp-default
```

This method limits the scope of the potential networking issues since everything stays inside Docker. The Telepresence daemon can be found under the name `tp-<your-context>` when listing your containers.

Start an intercept:

```cli
$ telepresence intercept echo-easy --port 8080:80 -n default
Using Deployment echo-easy
   Intercept name         : echo-easy-default
   State                  : ACTIVE
   Workload kind          : Deployment
   Destination            : 127.0.0.1:8080
   Service Port Identifier: proxied
   Volume Mount Point     : /var/folders/x_/4x_4pfvx2j3_94f36x551g140000gp/T/telfs-505935483
   Intercepting           : HTTP requests with headers
         'x-telepresence-intercept-id: e20f0764-7fd8-45c1-b911-b2adeee1af45:echo-easy-default'
   Preview URL            : https://gracious-ishizaka-5365.preview.edgestack.me
   Layer 5 Hostname       : echo-easy.default.svc.cluster.local
```

Start your intercept handler (interceptor) by targeting the daemon container `--network=container:tp-<your-context>`, and open the preview URL to see the traffic routed to your machine.

```cli
$ docker run \
  --network=container:tp-default \
  -e PORT=8080 jmalloc/echo-server
Echo server listening on port 8080.
127.0.0.1:41500 | GET /
127.0.0.1:41512 | GET /favicon.ico
127.0.0.1:41500 | GET /
127.0.0.1:41512 | GET /favicon.ico
```

It's essential to ensure that users also open the debugging port on their container to allow them to attach their local debugger from their IDE. 

## Key learnings

* Using the Docker mode of telepresence **do not require root access**, and make it **easier** to adopt it across your organization.
* It **limits the potential networking issues** you can encounter.
* It leverages **Docker** for your interceptor.
