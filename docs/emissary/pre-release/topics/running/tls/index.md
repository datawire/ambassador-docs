import Alert from '@material-ui/lab/Alert';

# Transport Layer Security (TLS)

$productName$'s robust TLS support exposes configuration options
for many different TLS use cases, using the [`Host`](#host) and
[`TLSContext`](#host-and-tlscontext) resources in concert.

## Certificates and Secrets

Properly-functioning TLS requires the use of [TLS certificates] to prove that the
various systems communicating are who they say they are. At minimum, $productName$
must have a server certificate that identifies it to clients; when [mTLS] or
[client certificate authentication] are in use, additional certificates are needed.

You supply certificates to $productName$ in Kubernetes [TLS Secrets]. These Secrets
_must_ contain valid X.509 certificates with valid PKCS1, PKCS8, or Elliptic Curve private
keys. If a Secret does not contain a valid certificate, an error message will be logged, for
example:

```
tls-broken-cert.default.1 2 errors:;  1. K8sSecret secret tls-broken-cert.default tls.key cannot be parsed as PKCS1 or PKCS8: asn1: syntax error: data truncated;  2. K8sSecret secret tls-broken-cert.default tls.crt cannot be parsed as x.509: x509: malformed certificate
```

If you set the `AMBASSADOR_FORCE_SECRET_VALIDATION` environment variable, the invalid
Secret will be rejected, and a `Host` or `TLSContext` resource attempting to use an invalid
certificate will be disabled entirely. **Note** that in $productName$ $version$, this
includes disabling cleartext communication for such a `Host`.

[TLS Certificates]: https://protonmail.com/blog/tls-ssl-certificate/
[mTLS]: mtls
[client certificate authentication]: ../../../howtos/client-cert-validation/
[TLS Secrets]: https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets

## `Host`

A `Host` represents a domain in $productName$ and defines how the domain manages TLS. For more information on the Host resource, see [The Host CRD reference documentation](../host-crd).

**If no `Host`s are present**, $productName$ synthesizes a `Host` that
allows only cleartext routing. You will need to explictly define `Host`s to enable
TLS termination.

<Alert severity="info">
  The examples below do not define a <code>requestPolicy</code>; however, most real-world
  usage of $productName$ will require defining the <code>requestPolicy</code>.<br/>
  <br/>
  For more information, please refer to the <a href="../host-crd#secure-and-insecure-requests"><code>Host</code> documentation.</a>
</Alert>

### Bring your own certificate

The `Host` can read a certificate from a Kubernetes Secret and use that certificate
to terminate TLS on a domain.

The following example shows the certificate contained in the Kubernetes Secret named
`host-secret` configured to have $productName$ terminate TLS on the `host.example.com`
domain:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  tlsSecret:
    name: host-secret
```

By default, `tlsSecret` will only look for the named secret in the same namespace as the `Host`.
In the above example, the secret `host-secret` will need to exist within the `default` namespace
since that is the namespace of the `Host`.

To reference a secret that is in a different namespace from the `Host`, the `namespace` field is required.
The below example will configure the `Host` to use the `host-secret` secret from the `example` namespace.

```yaml
---
apiVersion: getambassador.io/v2
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  acmeProvider:
    authority: none
  tlsSecret:
    name: host-secret
    namespace: example
```

<Alert severity="warning">

  The Kubernetes Secret named by <code>tlsSecret</code> must contain a valid TLS certificate.
  If `AMBASSADOR_FORCE_SECRET_VALIDATION` is set and the Secret contains an invalid
  certificate, $productName$ will reject the Secret and completely disable the
  `Host`; see [**Certificates and Secrets**](#certificates-and-secrets) above.

</Alert>

### Advanced TLS configuration with the `Host`

You can specify TLS configuration directly in the `Host` via the `tls` field. This is the
recommended method to do more advanced TLS configuration for a single `Host`.

For example, the configuration to enforce a minimum TLS version on the `Host` looks as follows:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  tlsSecret:
    name: min-secret
  tls:
    min_tls_version: v1.2
```

<Alert severity="warning">

  The Kubernetes Secret named by <code>tlsSecret</code> must contain a valid TLS certificate.
  If `AMBASSADOR_FORCE_SECRET_VALIDATION` is set and the Secret contains an invalid
  certificate, $productName$ will reject the Secret and completely disable the
  `Host`; see [**Certificates and Secrets**](#certificates-and-secrets) above.

</Alert>

The following fields are accepted in the `tls` field:
```yaml
tls:
  cert_chain_file:    # string
  private_key_file:   # string
  ca_secret:          # string
  cacert_chain_file:  # string
  alpn_protocols:     # string
  cert_required:      # bool
  min_tls_version:    # string
  max_tls_version:    # string
  cipher_suites:      # array of strings
  ecdh_curves:        # array of strings
  sni:                # string
  crl_secret:         # string
```

These fields have the same function as in the [`TLSContext`](#tlscontext) resource,
as described below.

### `Host` and `TLSContext`

You can link a `Host` to a [`TLSContext`](#tlscontext) instead of defining `tls`
settings in the `Host` itself. This is primarily useful for sharing settings between
multiple `Host`s.

#### Link a `TLSContext` to the `Host`

<Alert severity="warning">
  It is invalid to use both the <code>tls</code> setting and the <code>tlsContext</code>
  setting on the same <code>Host</code>. The recommended setting is using the <code>tls</code> setting
  unless you have multiple <code>Host</code>s that need to share TLS configuration.
</Alert>

To link a [`TLSContext`](#tlscontext) with a `Host`, create a [`TLSContext`](#tlscontext)
with the desired configuration and link it to the `Host` by setting the `tlsContext.name`
field in the `Host`. For example, to enforce a minimum TLS version on the `Host` above,
create a `TLSContext` with any name with the following configuration:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: TLSContext
metadata:
  name: min-tls-context
spec:
  hosts:
  - host.example.com
  secret: min-secret
  min_tls_version: v1.2
```

Next, link it to the `Host` via the `tlsContext` field as shown:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  tlsSecret:
    name: min-secret
  tlsContext:
    name: min-tls-context
```

<Alert severity="warning">

  The `Host` and the `TLSContext` must name the same Kubernetes Secret; if not,
  $productName$ will disable TLS for the `Host`.

</Alert>

<Alert severity="warning">

  The Kubernetes Secret named by <code>tlsSecret</code> must contain a valid TLS certificate.
  If `AMBASSADOR_FORCE_SECRET_VALIDATION` is set and the Secret contains an invalid
  certificate, $productName$ will reject the Secret and completely disable the
  `Host`; see [**Certificates and Secrets**](#certificates-and-secrets) above.

</Alert>

<Alert severity="warning">

  The `Host`'s `hostname` and the `TLSContext`'s `hosts` must have compatible settings. If
  they do not, requests may not be accepted.

</Alert>

See [`TLSContext`](#tlscontext) below to read more on the description of these fields.

#### Create a `TLSContext` with the name `{{AMBASSADORHOST}}-context` (DEPRECATED)

<Alert severity="warning">
  This implicit <code>TLSContext</code> linkage is deprecated and will be removed
  in a future version of $productName$; it is <b>not</b> recommended for new
  configurations. Any other TLS configuration in the <code>Host</code> will override
  this implict <code>TLSContext</code> link.
</Alert>

The `Host` will implicitly link to the `TLSContext` when a `TLSContext` exists with the following:

- the name `{{NAME_OF_AMBASSADORHOST}}-context`
- `hosts` in the `TLSContext` set to the same value as `hostname` in the `Host`, and
- `secret` in the `TLSContext` set to the same value as `tlsSecret` in the `Host`

**As noted above, this implicit linking is deprecated.**

For example, another way to enforce a minimum TLS version on the `Host` above would
be to simply create the `TLSContext` with the name `example-host-context` and then not modify the `Host`:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: TLSContext
metadata:
  name: example-host-context
spec:
  hosts:
  - host.example.com
  secret: host-secret
  min_tls_version: v1.2
```

<Alert severity="warning">

  The `Host` and the `TLSContext` must name the same Kubernetes Secret; if not,
  $productName$ will disable TLS for the `Host`.

</Alert>

<Alert severity="warning">

  The Kubernetes Secret named by <code>tlsSecret</code> must contain a valid TLS certificate.
  If `AMBASSADOR_FORCE_SECRET_VALIDATION` is set and the Secret contains an invalid
  certificate, $productName$ will reject the Secret and completely disable the
  `Host`; see [**Certificates and Secrets**](#certificates-and-secrets) above.

</Alert>

<Alert severity="warning">

  The `Host`'s `hostname` and the `TLSContext`'s `hosts` must have compatible settings. If
  they do not, requests may not be accepted.

</Alert>

Full reference for all options available to the `TLSContext` can be found [below](#tlscontext).

## TLSContext

The `TLSContext` is used to configure advanced TLS options in $productName$.
Remember, a `TLSContext` must always be paired with a `Host`.

A full schema of the `TLSContext` can be found below with descriptions of the
different configuration options.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: TLSContext
metadata:
  name: example-host-context
spec:
  # 'hosts' defines the hosts for which this TLSContext is relevant.
  # It ties into SNI. A TLSContext without "hosts" is useful only for
  # originating TLS.
  # type: array of strings
  #
  # hosts: []

  # 'sni' defines the SNI string to use on originated connections.
  # type: string
  #
  # sni: None

  # 'secret' defines a Kubernetes Secret that contains the TLS certificate we
  # use for origination or termination. If not specified, $productName$ will look
  # at the value of cert_chain_file and private_key_file.
  # type: string
  #
  # secret: None

  # 'ca_secret' defines a Kubernetes Secret that contains the TLS certificate we
  # use for verifying incoming TLS client certificates.
  # type: string
  #
  # ca_secret: None

  # Tells $productName$ whether to interpret a "." in the secret name as a "." or
  # a namespace identifier.
  # type: boolean
  #
  # secret_namespacing: true

  # 'cert_required' can be set to true to _require_ TLS client certificate
  # authentication.
  # type: boolean
  #
  # cert_required: false

  # 'alpn_protocols' is used to enable the TLS ALPN protocol. It is required
  # if you want to do GRPC over TLS; typically it will be set to "h2" for that
  # case.
  # type: string (comma-separated list)
  #
  # alpn_protocols: None

  # 'min_tls_version' sets the minimum acceptable TLS version: v1.0, v1.1,
  # v1.2, or v1.3. It defaults to v1.0.
  # min_tls_version: v1.0

  # 'max_tls_version' sets the maximum acceptable TLS version: v1.0, v1.1,
  # v1.2, or v1.3. It defaults to v1.3.
  # max_tls_version: v1.3

  # Tells $productName$ to load TLS certificates from a file in its container.
  # type: string
  #
  # cert_chain_file: None
  # private_key_file: None
  # cacert_chain_file: None
```

<Alert severity="warning">

  `secret` and (if used) `ca_secret` must specify Kubernetes Secrets containing valid TLS
  certificates. If `AMBASSADOR_FORCE_SECRET_VALIDATION` is set and either Secret contains
  an invalid certificate, $productName$ will reject the Secret, which will also completely
  disable any `Host` using the `TLSContext`; see [**Certificates and Secrets**](#certificates-and-secrets)
  above.

</Alert>

### ALPN protocols

The `alpn_protocols` setting configures the TLS ALPN protocol. To use gRPC over
TLS, set `alpn_protocols: h2`. If you need to support HTTP/2 upgrade from
HTTP/1, set `alpn_protocols: h2,http/1.1` in the configuration.

#### HTTP/2 support

The `alpn_protocols` setting is also required for HTTP/2 support.

```yaml
apiVersion: getambassador.io/v3alpha1
kind:  TLSContext
metadata:
  name:  tls
spec:
  secret: ambassador-certs
  hosts: ["*"]
  alpn_protocols: h2[, http/1.1]
```
Without setting alpn_protocols as shown above, HTTP2 will not be available via
negotiation and will have to be explicitly requested by the client.

If you leave off http/1.1, only HTTP2 connections will be supported.

### TLS parameters

The `min_tls_version` setting configures the minimum TLS protocol version that
$productName$ will use to establish a secure connection. When a client
using a lower version attempts to connect to the server, the handshake will
result in the following error: `tls: protocol version not supported`.

The `max_tls_version` setting configures the maximum TLS protocol version that
$productName$ will use to establish a secure connection. When a client
using a higher version attempts to connect to the server, the handshake will
result in the following error:
`tls: server selected unsupported protocol version`.

The `cipher_suites` setting configures the supported ciphers found below using the
[configuration parameters for BoringSSL](https://commondatastorage.googleapis.com/chromium-boringssl-docs/ssl.h.html#Cipher-suite-configuration) when negotiating a TLS 1.0-1.2 connection.
This setting has no effect when negotiating a TLS 1.3 connection.  When a client does not
support a matching cipher a handshake error will result.

The `ecdh_curves` setting configures the supported ECDH curves when negotiating
a TLS connection.  When a client does not support a matching ECDH a handshake
error will result.

```
  - AES128-SHA
  - AES256-SHA
  - AES128-GCM-SHA256
  - AES256-GCM-SHA384
  - ECDHE-RSA-AES128-SHA
  - ECDHE-RSA-AES256-SHA
  - ECDHE-RSA-AES128-GCM-SHA256
  - ECDHE-RSA-AES256-GCM-SHA384
  - ECDHE-RSA-CHACHA20-POLY1305
  - ECDHE-ECDSA-AES128-SHA
  - ECDHE-ECDSA-AES256-SHA
  - ECDHE-ECDSA-AES128-GCM-SHA256
  - ECDHE-ECDSA-AES256-GCM-SHA384
  - ECDHE-ECDSA-CHACHA20-POLY1305
  - ECDHE-PSK-AES128-CBC-SHA
  - ECDHE-PSK-AES256-CBC-SHA
  - ECDHE-PSK-CHACHA20-POLY1305
  - PSK-AES128-CBC-SHA
  - PSK-AES256-CBC-SHA
  - DES-CBC3-SHA
```

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  TLSContext
metadata:
  name:  tls
spec:
  hosts: ["*"]
  secret: ambassador-certs
  min_tls_version: v1.0
  max_tls_version: v1.3
  cipher_suites:
  - "[ECDHE-ECDSA-AES128-GCM-SHA256|ECDHE-ECDSA-CHACHA20-POLY1305]"
  - "[ECDHE-RSA-AES128-GCM-SHA256|ECDHE-RSA-CHACHA20-POLY1305]"
  ecdh_curves:
  - X25519
  - P-256
```


The `crl_secret` field allows you to reference a Kubernetes Secret that contains a certificate revocation list.
If specified, $productName$ will verify that the presented peer certificate has not been revoked by this CRL even if they are otherwise valid. This provides a way to reject certificates before they expire or if they become compromised.
The `crl_secret` field takes a PEM-formatted [Certificate Revocation List](https://en.wikipedia.org/wiki/Certificate_revocation_list) in a `crl.pem` entry.

Note that if a CRL is provided for any certificate authority in a trust chain, a CRL must be provided for all certificate authorities in that chain. Failure to do so will result in verification failure for both revoked and unrevoked certificates from that chain.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  TLSContext
metadata:
  name:  tls-crl
spec:
  hosts: ["*"]
  secret: ambassador-certs
  min_tls_version: v1.0
  max_tls_version: v1.3
  crl_secret: 'ambassador-crl'
---
apiVersion: v1
kind: Secret
metadata:
  name: ambassador-crl
  namespace: ambassador
type: Opaque
data:
  crl.pem: |
    {BASE64 CRL CONTENTS}
---
```
