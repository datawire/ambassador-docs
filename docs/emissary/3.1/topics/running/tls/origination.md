import Alert from '@material-ui/lab/Alert';

# TLS origination

Sometimes you may want traffic from $productName$ to your services to be encrypted. For the cases where terminating TLS at the ingress is not enough, $productName$ can be configured to originate TLS connections to your upstream services.

## Basic configuration

Telling $productName$ to talk to your services over HTTPS is easily configured in the `Mapping` definition by setting `https://` in the `service` field.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: basic-tls
spec:
  hostname: "*"
  prefix: /
  service: https://example-service
```

## Advanced configuration using a `TLSContext`

If your upstream services require more than basic HTTPS support (for example, providing a client certificate or
setting the minimum TLS version support) you must create a `TLSContext` for $productName$ to use when
originating TLS. For example:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: TLSContext
metadata:
  name: tls-context
spec:
  secret: self-signed-cert
  min_tls_version: v1.3
  sni: some-sni-hostname
```

<Alert severity="warning">

  The Kubernetes Secret named by `secret` must contain a valid TLS certificate. If the
  environment variable `AMBASSADOR_FORCE_SECRET_VALIDATION` is set and the Secret contains
  an invalid certificate, $productName$ will reject the `TLSContext` and prevent its use;
  see [**Certificates and Secrets**](../#certificates-and-secrets) in the TLS overview.

</Alert>

Configure $productName$ to use this `TLSContext` for connections to upstream services by setting the `tls` attribute of a `Mapping`:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: mapping-with-tls-context
spec:
  hostname: "*"
  prefix: /
  service: https://example-service
  tls: tls-context
```

The `example-service` service must now support TLS v1.3 for $productName$ to connect.

<Alert severity="warning">

  The Kubernetes Secret named by `secret` must contain a valid TLS certificate. If the
  environment variable `AMBASSADOR_FORCE_SECRET_VALIDATION` is set and the Secret contains
  an invalid certificate, $productName$ will reject the `TLSContext` and prevent its use;
  see [**Certificates and Secrets**](../#certificates-and-secrets) in the TLS overview.

</Alert>

<Alert severity="warning">

  A `TLSContext` requires a certificate be provided, even in cases where the upstream
  service does not require it (for origination) and the `TLSContext` is not being used
  to terminate TLS. In this case, simply generate and provide a self-signed certificate.

</Alert>
