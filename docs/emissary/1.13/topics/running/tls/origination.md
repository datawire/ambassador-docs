# TLS origination

Sometimes you may want traffic from $productName$ to your services to be encrypted. For the cases where terminating TLS at the ingress is not enough, $productName$ can be configured to originate TLS connections to your upstream services.

## Basic configuration

Telling $productName$ to talk to your services over HTTPS is easily configured in the `Mapping` definition by setting `https://` in the `service` field.

```yaml
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: basic-tls
spec:
  prefix: /
  service: https://example-service
```

## Advanced configuration using a `TLSContext`

If your upstream services require more than basic HTTPS support (e.g. minimum TLS version support or SNI support) you can create a `TLSContext` for $productName$ to use when originating TLS.

```yaml
---
apiVersion: getambassador.io/v2
kind: TLSContext
metadata:
  name: tls-context
spec:
  secret: self-signed-cert
  min_tls_version: v1.3
  sni: some-sni-hostname
```

Configure $productName$ to use this `TLSContext` for connections to upstream services by setting the `tls` attribute of a `Mapping`

```yaml
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: mapping-with-tls-context
spec:
  prefix: /
  service: https://example-service
  tls: tls-context
```

The `example-service` service must now support TLS v1.3 for $productName$ to connect.

**Note**:

A `TLSContext` requires a certificate be provided even if not using it to terminate TLS. For origination purposes, this certificate can simply be self-signed unless mTLS is required.
