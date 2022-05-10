import Alert from '@material-ui/lab/Alert';

# Transport Layer Security (TLS)

$productName$'s robust TLS support exposes configuration options
for different TLS use cases including:

- [Simultaneously Routing HTTP and HTTPS](cleartext-redirection#cleartext-routing)
- [HTTP -> HTTPS Redirection](cleartext-redirection#http-https-redirection)
- [Mutual TLS](mtls)
- [Server Name Indication (SNI)](sni)
- [TLS Origination](origination)

## `Host`

A `Host` represents a domain in $productName$ and defines how the domain manages TLS. For more information on the Host resource, see [The Host CRD reference documentation](../host-crd).

**If no `Host`s are present**, $productName$ synthesizes a `Host` that
terminates TLS using a self-signed TLS certificate, and redirects cleartext
traffic to HTTPS. You will need to explictly define `Host`s to change this behavior
(for example, to use a different certificate or to route cleartext).

<Alert severity="info">
  The examples below do not define a <code>requestPolicy</code>; however, most real-world
  usage of $productName$ will require defining the <code>requestPolicy</code>.<br/>
  <br/>
  For more information, please refer to the <a href="../host-crd#secure-and-insecure-requests"><code>Host</code> documentation.</a>
</Alert>

### Automatic TLS with ACME

With $AESproductName$, you can configure the `Host` to manage TLS by
requesting a certificate from a Certificate Authority using the
[ACME HTTP-01 challenge](https://letsencrypt.org/docs/challenge-types/).

After you create a DNS record, configure $AESproductName$ to get a certificate from the default CA, [Let's Encrypt](https://letsencrypt.org), by providing a hostname and your email for the certificate:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  acmeProvider:
    authority: https://acme-v02.api.letsencrypt.org/directory # Optional: The CA you want to get your certificate from. Defaults to Let's Encrypt
    email: julian@example.com
```

$AESproductName$ will now request a certificate from the CA and store it in a Secret
in the same namespace as the `Host`.

Please note an HTTP `Listener` on port 8080 is also required for ACME

**If you use ACME for multiple Hosts, add a wildcard Host too.**
This is required to manage a known issue. This issue will be resolved in a future Ambassador Edge Stack release.

### Bring your own certificate

The `Host` can read a certificate from a Kubernetes Secret and use that certificate
to terminate TLS on a domain.

The following example shows the certificate contained in the Kubernetes Secret named 'host-secret' configured to have $productName$ terminate TLS on the 'host.example.com' domain:

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
  The <code>Host</code>'s <code>hostname</code> and the <code>TLSContext</code>'s&nbsp;
  <code>hosts</code> must have compatible settings. If they do not, requests may not
  be accepted.
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
  The <code>Host</code>'s <code>hostname</code> and the <code>TLSContext</code>'s&nbsp;
  <code>hosts</code> must have compatible settings. If they do not, requests may not
  be accepted.
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
