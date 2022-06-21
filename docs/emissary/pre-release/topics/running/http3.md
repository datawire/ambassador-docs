# HTTP/3 Overview in $productName$

HTTP/3 is the third version of the Hypertext Transfer Protocol (HTTP). It is built on the [QUIC](https://www.chromium.org/quic/) network protocol rather than Transmission Control Protocol (TCP) like previous versions.

## The changes and challenges of HTTP/3

Since the QUIC network protocol is built on UDP, most clients will require $productName$ to advertise its support for HTTP/3 using the `alt-svc` response header. This header is added to the response of the HTTP/2 and HTTP/1.1 connections. When the client sees the `alt-svc` it can choose to upgrade to HTTP/3 and connect to $productName$ using the QUIC protocol.


Because HTTP/3 adoption is still growing and and changing, the $productName$ team will continue update this documentation as features change and mature.

## Setting up HTTP/3 with $productName$


2. Configure a `Host`.
3. Have a valid certificate.
4. Setup an external load balancer.


To make $productName$ listen for HTTP/3 connections over the QUIC network protocol, you need to configure a `Listener` with `TLS`, `HTTP`, and `UDP` configured within `protocolStack`.

<Alert severity="info">
</Alert>


<Alert severity="info">
</Alert>

```yaml
# This is a standard Listener that leverages TCP to serve HTTP/2 and HTTP/1.1 traffic.
# It is bound to the same address and port (0.0.0.0:8443) as the UDP listener.
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: $productDeploymentName$-https-listener
  namespace: $productNamespace$
spec:
  port: 8443
  protocol: HTTPS
  securityModel: XFP
  hostBinding:
    namespace:
      from: ALL
---
# This is a Listener that leverages UDP and HTTP to serve HTTP/3 traffic.
# NOTE: Raw UDP traffic is not supported. UDP and HTTP must be used together.
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: $productDeploymentName$-https-listener-udp
  namespace: $productNamespace$
spec:
  port: 8443
  protocolStack:
    - TLS
    - HTTP
    - UDP
  securityModel: XFP
  hostBinding:
    namespace:
      from: ALL
```



### Certificate verification

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: my-domain-host
spec:
  hostname: your-hostname
  # acme isn't required but just shown as an example of how to manage a valid TLS cert
  acmeProvider:
    email: your-email@example.com
    authority: https://acme-v02.api.letsencrypt.org/directory
  tls:
    min_tls_version: v1.3
    alpn_protocols: h2,http/1.1
```

The two most common service types to expose traffic outside of a Kubernetes cluster are:

- `LoadBalancer`: A load balancer controller generates and manages the cloud provider-specific external load balancer.
- `NodePort`: The platform administrator has to manually set up things like the external load balancer, firewall rules, and health checks.

#### LoadBalancer setup



```yaml

# note: extra fields such as labels and selectors removed for clarity
apiVersion: v1
kind: Service
metadata:
  name: $productDeploymentName$
  namespace: $productNamespace$
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



