# HTTP/3

HTTP/3 is the next evolution of the HTTP Protocol. It is built on top of the QUIC network protocol. QUIC is a new network protocol built on top of the UDP protocol which solves head-of-line blocking, improves connection startup and has security built-in. You can read more about [QUIC](https://www.chromium.org/quic/) here.

Most clients such as browsers, curl and language libraries all speak **TCP** by default. With QUIC being built on top of **UDP**, this doesn't match up with the expectation of these clients. To support HTTP/3 most clients will first connect to a server over `HTTP/2` or `HTTP/1.1` and then will upgrade the connection to HTTP/3. The way that the server notifies the client of HTTP/3 support is through the `alt-svc` http header. The `alt-svc` header is returned on the TCP connection using the HTTP/2 or HTTP/1.1 response (e.g. `alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400`). More information on the [Alt-Svc Header]("https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Alt-Svc").

Another consideration for clients is that the QUIC protocol requires **TLS 1.3** and is built into the protocol which means it doesn't support non-tls. This means that the client must support TLS 1.3 or it will not be able to communicate with the server using HTTP/3 and will instead need to fall-back to HTTP/2 or HTTP/1.1 which support other TLS versions. Due to this requirement, some clients will also require the certificates to be valid which can cause challenges when developing and testing with self-signed certs. For example, in Chrome it will not serve http/3 traffic unless a valid certificate is present.

## Setting up HTTP/3 with $productName$

To configure $productName$ for HTTP/3 you will need to do the following:

1. Configure `Listener`'s
2. Configure a `Host`
3. Setup External Load Balancer

### Configure Listener's

For $productName$ to start listening for HTTP/3 connections via the QUIC network protocol, a Listener with `UDP` and `HTTP` must be configured. Typically, a Listener that supports TCP can be configured using the familiar `protocol` field which provides pre-defined `protocolStack`'s . However, to setup a Listener that supports QUIC, a Listener must be configured with `protocolStack: ["TLS", "HTTP", "UDP"]`.

> Note: as we becoming more familiar with the nuances of HTTP/3 we hope to improve the developer experience (DX) of configuring and setting up HTTP/3 so that it feels more like setting up the typical Listener that supports HTTP/s.

It is recommened that the Listener configured for HTTP/3 have a companion `HTTP/HTTP's` Listener that is bound to the same address and port. This allows $productName$ to inject the `alt-svc` header to the response that is returned over the `TCP` connection.

> Currently, the `alt-svc` header is not configurable. First, it requires a companion Listener (*TCP and UDP Listener bound to same address and port*). Second, it requires the client to access the endpoints via port `443` per `alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400`.


```yaml
# A standard Listener that leverages TCP to serve HTTP/2 and HTTP/1.1 traffic
# it is bound to the same address and port (0.0.0.0:8443) as the UDP listener 
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: emissary-ingress-listener-8443
  namespace: emissary
spec:
  port: 8443
  protocol: HTTPS
  securityModel: XFP
  hostBinding:
    namespace:
      from: ALL
---
# Listener that leverages UDP, and HTTP to leverage QUIC and server HTTP/3 traffic
# NOTE: support for raw UDP traffic is not supported and UDP and HTTP are required to be used together
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: emissary-ingress-listener-udp-8443
  namespace: emissary
spec:
  port: 8443
  # order matters here, UDP must be the last item and HTTP is required
  protocolStack:
    - TLS
    - HTTP
    - UDP
  securityModel: XFP
  hostBinding:
    namespace:
      from: ALL
```

### Configure a `Host`

The QUIC network protcol has TLS 1.3 built-in and does not allow serving traffic without TLS. Therefore, it is important to ensure the certificate is valid so that the client can upgrade a connection to HTTP/3. See the [Host](./host-crd.md) docs for more information on ways to configure TLS for a Host.

> **Self-signed certificates** that are not valid can prevent a client such as a browser from upgrading a connection to HTTP/3. For example, we have observed that Chrome is fairly strict about this where as Firefox seems more lenient on the self-signed certificate (*assuming you click through ignoring their warnings*). If the client is having trouble upgrading to HTTP/3 ensure you have configured a valid TLS certificate.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: my-domain-host
spec:
  hostname: "emissary-ingress.isawesome.com"
  # acme isn't required but just shown as an example of how to manage a valid TLS cert
  acmeProvider:
    email: emissary@emissary.io
    authority: https://acme-v02.api.letsencrypt.org/directory
  tls:
    # QUIC will require it and recommended if client supports it to ensure you are staying up-to-date on the latest security
    min_tls_version: v1.3
    # either protocol can be upgraded but usually good to leverage http/2 when possible
    alpn_protocols: h2,http/1.1
```

### Setup External Load Balancer

Up to this point the steps should feel familiar to how you are use to working with $productName$ but setting up the External Load Balancer takes a little more thought. The two main ways of exposing traffic outside of a Kubernetes cluster is via either a Service of type `LoadBalancer` or of type `NodePort`. The `LoadBalancer` type will allow Kubernetes or a Load Balancer Controller to generate and manage the Cloud Provider specific external load balancer. When using a service of type `NodePort` it is up to the platform adminstrator to do all the work of setting up load balancers, firewall rules, health checks, etc...so it is recommended to leverage the service type `LoadBalancer` when possible. However, due to the fact that now we will be serving traffic over TCP and UDP, it brings with it some challenges.

Here we will focus on the `LoadBalancer` type and here are some things you will need to consider:

- The version of Kubernetes and enabled Features Flags
- The Load Balancer Controller you are using (k8s in-tree vs cloud provider controller)
- External Load Balancer features supported by the Cloud Provider such as Mixed Protocol support (UDP and TCP)

Normally a platform administrator would apply the following service of type `LoadBalancer`:

```yaml

# note: extra fields such as labels and selectors removed for clarity
apiVersion: v1
kind: Service
metadata:
  name: emissary-ingress
  namespace: emissary
spec:
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
    - name: https
      port: 443
      targetPort: 8443
      protocol: TCP
    - name: http3
      port: 443
      targetPort: 8443
      protocol: UDP
  type: LoadBalancer
```

First, for this to work Kubernetes has to support having mixed protocol types (UDP & TCP) in a single Service. The support for this has been under a Feature Flag and as of Kubernetes `v1.24` it has graduated to `beta` and will be turned on by default. More info can be found here: [Kubernetes - MixedProtocolLBService] ("https://kubernetes.io/docs/concepts/services-networking/service/#load-balancers-with-mixed-protocol-types"). Support for enabling Feature Flags within a Kubernetes cluster depends on the Cloud Providers and you will have to check thier documentation.

Second, assuming you have enabled this feature flag, the Contorller and Cloud Provider have to support the creation of an External Load Balancer with mixed protocol (TCP/UDP), port reuse (e.g 443). Kubernetes ships with an in-tree controller that listens for `LoadBalancer` services and will handle the managing (creation/deletion) of the load balancer for the major cloud providers. However, over the last few years cloud providers have shifted to providing their own controllers. By providing their own controller they can decouple the release cycle from the Kubernetes release cycle allowing for faster iteration. So, we hope that support for this will quickly come up to speed!

Unfortunately, the maturity for these two things isn't at the same level as the current TCP load balancing and at this time will require additional considerations.

> Note: the $productName$ maintainers will continue to track and document Kubernetes and Cloud Provider support for these features. Hopefully, overtime the story for this improves.

### Configuring an External Load Balancer for GKE

>The controller used by GKE (*at the initial release of HTTP/3 support*), does not support mixed protocol when creating a service of type `LoadBalancer`.

To configure an External Load Balancer for GKE one can use the following setup:

1. Reserve a Public Static IP Address
2. Create **two** service's of type `LoadBalancer` for each network protocol
   1. Assign `loadBalancer` IP to the static IP Address

```yaml
# selectors and labels removed for clarity
apiVersion: v1
kind: Service
metadata:
  name: emissary-ingress
  namespace: emissary
spec:
  type: LoadBalancer
  loadBalancerIP: xx.xx.xx.xx # replace with the public static IP address reserved
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
    - name: https
      port: 443 # support for HTTP/3, requires serving on 443 for the external client facing port.
      targetPort: 8443
      protocol: TCP
  ---
  apiVersion: v1
kind: Service
metadata:
  name: emissary-ingress-udp
  namespace: emissary
spec:
  type: LoadBalancer
  loadBalancerIP: xx.xx.xx.xx # replace with the public static IP address reserved
  ports:
    - name: http3
      port: 443  # support for HTTP/3, requires serving on 443 for the external client facing port.
      targetPort: 8443
      protocol: UDP

```

GKE will generate two `LoadBalancers` for each service. One LoadBalancer for UDP and one that for TCP traffic.

> Important - You will be charged for each LoadBalancer per your Cloud Provider agreements.

### Alternative External Load Balancer Setup

Paying for two External Load Balancers and a Static IP address is not the ideal setup so an alternative to using the Service of type `LoadBalancer` is to use a service of type `NodePort`.

```yaml
# selectors and labels removed for clarity
apiVersion: v1
kind: Service
metadata:
  name: emissary-ingress
  namespace: emissary
spec:
  type: NodePort
  ports:
    - name: http
      port: 80
      targetPort: 8080
      nodePort: 30080
      protocol: TCP
    - name: https
      port: 443
      targetPort: 8443
      nodePort: 30443
      protocol: TCP
    - name: http3
      port: 443
      targetPort: 8443
      nodePort: 30443
      protocol: UDP

```

This exposes the traffic on a static port for each node in the cluster but an External Load Balancer still needs to be configured. The configuration of the External Load Balancer is Cloud Provider specific but the general steps a Platform Administrator needs to perform are the following:

1. An External Load Balancer to send UDP and TCP traffic to the nodes
2. Port forward client Port to NodePort (`80:30080` and `443:30443`)
3. Configure Firewall/SecurityGroup rules for allowing traffice between Load Balancer and Cluster Nodes
4. Configure health checks between LoadBalancer and Nodes using the NodePort
