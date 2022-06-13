# HTTP/3

HTTP/3 is the third version of the Hypertext Transfer Protocol (HTTP). It is built on the [QUIC](https://www.chromium.org/quic/) network protocol rather than Transmission Control Protocol (TCP) like previous versions.

## The changes and challenges of HTTP/3

Since QUIC network protocol is built on UDP it requires $productName$ to advertise its support for HTTP/3 using the `alt-svc` response header. This header is returned on the initial HTTP/2 and HTTP/1.1 responses. When a client sees the `alt-svc` it can choose to upgrade to HTTP/3 and connect to $productName$ using the QUIC protocol.

QUIC requires Transport Layer Security (TLS) version 1.3 to communicate. Otherwise, the client will fall back to HTTP/2 or HTTP/1.1, which support other TLS versions. Due to this restriction, some clients will also require valid certificates, which causes problems when you use self-signed certs. For example, in Chrome it will not upgrade to http/3 traffic unless a valid certificate is present.
## Setting up HTTP/3 with $productName$

To configure $productName$ for HTTP/3 you will need to do the following:

1. Configure `Listener`s.
2. Configure a `Host`.
3. Have a valid certificate.
4. Setup an external load balancer.

### Configure `Listener`s

To make $productName$ listen for HTTP/3 connections over the QUIC network protocol, you need to configure a `Listener` with `TLS`, `HTTP`, and `UDP` configured within `protocolStack`.

<Alert severity="info">
The order of the elements within the `protocolStack` is important and should be configured as <code>["TLS", "HTTP", "UDP"]</code>.
<Alert>

The `Listener` configured for HTTP/3 can be bound to the same address and port (<code>0.0.0.0:8443</code>) as the `Listener` that supports HTTP/2 and HTTP/1.1. This is not required but it allows $productName$ to inject the default `alt-svc: h3=":443"; ma=86400, h3-29=":443"; ma=86400` header into the responses returned over the TCP connection with no additional configuration needed.

```yaml
# This is a standard Listener that leverages TCP to serve HTTP/2 and HTTP/1.1 traffic.
# It is bound to the same address and port (0.0.0.0:8443) as the UDP listener.
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
# This is a Listener that leverages UDP and HTTP to serve QUIC and HTTP/3 traffic.
# NOTE: Raw UDP traffic is not supported. UDP and HTTP must be used together.
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: emissary-ingress-listener-udp-8443
  namespace: emissary
spec:
  port: 8443
  # Order is important here. UDP must be the last item, and HTTP is required.
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

Because the QUIC network requires TLS, the certificate needs to be valid so that the client can upgrade a connection to HTTP/3. See the [Host documentation](./host-crd.md) for more information on how to configure TLS for a `Host`.

### Certificate verification
​
Clients can only upgrade to a HTTP/3 connection with a valid TLS 1.3 certificate. If the client won’t upgrade to HTTP/3, verify that you have a valid TLS certificate and not a self-signed certificate. For example:

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
    # QUIC requires a minimum TLS version. 
    min_tls_version: v1.3
    # Either protocol can be upgraded, but it's best to leverage http/2 when possible.
    alpn_protocols: h2,http/1.1
```

### External Load Balancers
​
The two most common service types to expose traffic outside of a Kubernetes cluster are:

- `LoadBalancer` service type: The load balancer controller generates and manages the cloud provider-specific external load balancer.
- `NodePort` service type: The platform administrator has to manually set up things like the load balancers, firewall rules, and health checks. When you use `NodePort`, is is also best practice to use a LoadBalancer as well.

#### LoadBalancer setup

The desired setup would be to configure a single service of type `LoadBalancer`, but this comes with some current restrictions.

First, you need a recent version of Kubernetes with the [`MixedProtocolLBService` feature enabled](https://kubernetes.io/docs/concepts/services-networking/service/#load-balancers-with-mixed-protocol-types).
​
Second, your cloud service provider needs to support the creation of an external load balancer with mixed protocol types (TCP/UDP) and port reuse. Support for Kubernetes feature flags may vary between cloud service providers. Refer to your provider’s documentation to see if they support this scenario.

A typical `LoadBalancer` configuration is:

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

<Alert severity="info"> The $productName$ team will continue to track and document Kubernetes and Cloud Provider support for these features as they mature.</Alert>

### Configuring an External Load Balancer for GKE

Currently, Google Kubernetes Engine (GKE) only supports adding feature flags to `alpha` clusters and doesn't support creating mixed protocol service's of type `LoadBalancer`. To configure an External Load Balancer for GKE, one can use the following setup:

1. Reserve a public static IP address.
2. Create two LoadBalancer services, one for TCP and one for UDP.
3. Assign the `loadBalancer` IP to the public static IP Address.

An example of the two load balancer services described above:

```yaml
# selectors and labels removed for clarity
apiVersion: v1
kind: Service
metadata:
  name: emissary-ingress
  namespace: emissary
spec:
  type: LoadBalancer
  loadBalancerIP: xx.xx.xx.xx # Enter your public static IP address here.
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
    - name: https
      port: 443
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
  loadBalancerIP: xx.xx.xx.xx # Enter your public static IP address here.
  ports:
    - name: http3
      port: 443  # Default support for HTTP/3 requires you to use 443 for the external client-facing port.
      targetPort: 8443
      protocol: UDP

```

Based on the above example, GKE generates two `LoadBalancer`s, one for UDP and the other for TCP.

GKE will generate two `LoadBalancers` for each service. One LoadBalancer for UDP and one that for TCP traffic.

#### Alternate external load balancer setup

​
Another option that doesn’t require you to pay for additional `LoadBalancer`s is to use a `NodePort` service as follows:
​

```yaml
# Selectors and labels removed for clarity.
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

This exposes the traffic on a static port for each node in the cluster.
​
Next, you need to perform the following steps to finalize your setup:
​

1. Create an external load balancer that sends UDP and TCP traffic to the nodes. (External load balancer configurations vary between cloud service providers. Refer to your provider’s documentation for more information.)
2. Port forward client Port to NodePort (`80:30080` and `443:30443`)
3. Configure Firewall/SecurityGroup rules to allow traffic between load balancer and cluster nodes.
4. Configure health checks between the `LoadBalancer` and Nodes in the `NodePort`.
