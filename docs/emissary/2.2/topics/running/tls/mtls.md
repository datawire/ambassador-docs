---
description: Emissary-ingress and Mutual TLS (mTLS). Many organizations have security concerns that require all network traffic throughout their cluster be encrypted
---

import Alert from '@material-ui/lab/Alert';

# Mutual TLS (mTLS)

Many organizations have security concerns that require all network traffic
throughout their cluster be encrypted. With traditional architectures,
this was not that complicated of a requirement since internal network traffic
was fairly minimal. With microservices, we are making many more requests over
the network that must all be authenticated and secured.

In order for services to authenticate with each other, they will each need to
provide a certificate and key that the other trusts before establishing a
connection. This action of both the client and server providing and validating
certificates is referred to as mutual TLS.

## mTLS with $productName$

Since $productName$ is a reverse proxy acting as the entry point to your cluster,
$productName$ is acting as the client as it proxies requests to services upstream.

It is trivial to configure $productName$ to simply originate TLS connections as
the client to upstream services by setting
`service: https://{{UPSTREAM_SERVICE}}` in the `Mapping` configuration.
However, in order to do mTLS with services upstream, $productName$ must also
have certificates to authenticate itself with the service.

To do this, we can use the `TLSContext` object to get certificates from a
Kubernetes `Secret` and use those to authenticate with the upstream service.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: TLSContext
metadata:
  name: upstream-context
spec:
  hosts: []
  secret: upstream-certs
```

We use `hosts: []` for this `TLSContext` since we do not want to use it to terminate
TLS connections from the client. We are just using this to load certificates for
requests upstream.

<Alert severity="warning">

  The Kubernetes Secret must contain a valid TLS certificate. If the environment
  variable `AMBASSADOR_FORCE_SECRET_VALIDATION` is set and the Secret contains an invalid
  certificate, $productName$ will reject the Secret and completely disable the `Host`;
  see [**Certificates and Secrets**](../#certificates-and-secrets) in the TLS overview.

</Alert>

After loading the certificates, we can tell $productName$ when to use them by
setting the `tls` parameter in a `Mapping`:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: upstream-mapping
spec:
  hostname: "*"
  prefix: /upstream/
  service: upstream-service
  tls: upstream-context
```

Now, when $productName$ proxies a request to `upstream-service`, it will provide
the certificates in the `upstream-certs` secret for authentication when
encrypting traffic.

## Service mesh

As you can imagine, when you have many services in your cluster all
authenticating with each other, managing all of those certificates can become a
very big challenge.

For this reason, many organizations rely on a service mesh for their
service-to-service authentication and encryption.

$productName$ integrates with multiple service meshes and makes it easy to
configure mTLS to upstream services for all of them. Click the links below to
see how to configure $productName$ to do mTLS with any of these service meshes:

- [Consul Connect](../../../../howtos/consul/)

- [Istio](../../../../howtos/istio/)
