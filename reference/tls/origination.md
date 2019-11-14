# TLS Origination

Sometimes you may want traffic from Ambassador to your services to be encrypted. For the cases where terminating TLS at the ingress is not enough, Ambassador can be configured to originate TLS connections to your upstream services.

## Basic Configuration

Telling Ambassador to talk to your services over HTTPS is easily configured in the `Mapping` definition by setting `https://` in the `service` field.

```yaml
---
apiVersion: getambassador.io/v1
kind: Mapping
metadata:
  name: basic-tls
spec:
  prefix: /
  service: https://example-service
```

## Advanced Configuration Using a `TLSContext`

If your upstream services require more than basic HTTPS support (e.g. minimum TLS version support) you can create a `TLSContext` for Ambassador to use when originating TLS.

```yaml
---
apiVersion: getambassador.io/v1
kind: TLSContext
metadata:
  name: tls
spec:
  secret: self-signed-cert
  min_tls_version: v1.3
```

Configure Ambassador to use this `TLSContext` for connections to upstream services by setting the `tls` attribute of a `Mapping`

```yaml
---
apiVersion: getambassador.io/v1
kind: Mapping
metadata:
  name: basic-tls
spec:
  prefix: /
  service: https://example-service
  tls: tls
```

The `example-service` service must now support tls v1.3 for Ambassador to connect.

**Note**: 

A `TLSContext` requires a certificate be provided even if not using it to terminate TLS. For origination purposes, this certificate can simply be self-signed unless mTLS is required.
