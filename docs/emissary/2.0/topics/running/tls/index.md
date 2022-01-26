# Transport Layer Security (TLS)

$productName$'s robust TLS support exposes configuration options
for different TLS use cases including:

- [Simultaneously Routing HTTP and HTTPS](cleartext-redirection/#cleartext-routing)
- [HTTP -> HTTPS Redirection](cleartext-redirection/#http-https-redirection)
- [Mutual TLS](mtls)
- [Server Name Indication (SNI)](sni)
- [TLS Origination](origination)

## `Host`

A `Host` represents a domain in $productName$ and defines how the domain manages TLS. For more information on the Host resource, see [The Host CRD reference documentation](../host-crd).

In $AESproductName$, the simplest configuration
of a `Host` will enable TLS with a self-signed certificate and redirect cleartext traffic to HTTPS.

> The example below does not define a `requestPolicy`; however, this is something to keep in mind as you begin using the `Host` `CRD` in $productName$.
>
> For more information, please refer to the [`Host` documentation](../host-crd#secure-and-insecure-requests).


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

### Bring your own certificate

For both $AESproductName$ and $OSSproductName$, the `Host` can read a
certificate from a Kubernetes secret and use that certificate to terminate TLS
on a domain.

The following will configure $productName$ to grab a certificate from a secret
named `host-secret` and use that secret for terminating TLS on the
`host.example.com` domain:

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

You can specify TLS configuration directly in the `Host` via the `tls` field. This is the recommended method for more advanced TLS Configuration.

For example, the configuration to enforce a minimum TLS version on the `Host` looks as follows:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  acmeProvider:
    authority: none
  tlsSecret:
    name: min-secret
  tls:
    min_tls_version: v1.2
```

The following fields are accepted in the `tls` field:
```yaml
tls:
  cert_chain_file: # <type: string>
  private_key_file: # <type: string>
  ca_secret: # <type: string>
  cacert_chain_file: # <type: string>
  alpn_protocols: # <type: string>
  cert_required: # <type: bool>
  min_tls_version: # <type: string>
  max_tls_version: # <type: string>
  cipher_suites: # <type: array of strings>
  ecdh_curves: # <type: array of strings>
  redirect_cleartext_from: # <type: int32>
  sni: # <type: string>
```

### `Host` and `TLSContext`

The `Host` will configure most TLS termination settings in $productName$.

If you require TLS configuration that is not available
via the above `tls` settings in a `Host`, you can create a `TLSContext` and associate it with a `Host` with either of the following two methods.

> **Note:** It is invalid to configure both `spec.tls` and `spec.tlsContext.name` on a `Host`. It is recommended to configure the `tls` setting in a `Host` without creating any `TLSContext` objects unless necessary. If you need to link a `TLSContext` to a `Host` make sure you are not also configuring the `tls` settings in that `Host`.


#### Create a `TLSContext` with the name `{{AMBASSADORHOST}}-context`

You can create a [`TLSContext`](#tlscontext) with the name
`{{NAME_OF_AMBASSADORHOST}}-context`, `hosts` set to the same `hostname`, and `secret`
set to the same `tlsSecret`.

For example, to enforce a minimum TLS version on the `Host` above, create a
`TLSContext` named `example-host-context` with the following configuration:

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

Full reference for all options available to the `TLSContext` can be found [below](#tlscontext).

#### Link a `TLSContext` to the `Host`

You can create a new [`TLSContext`](#tlscontext) with the desired configuration
and link it to the `Host` via the `tlsContext` field.

For example, to enforce a minimum TLS version on the `Host` above, create a
`TLSContext` with any name with the following configuration:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: TLSContext
metadata:
  name: min-tls-context
spec:
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
  acmeProvider:
    authority: none
  tlsSecret:
    name: min-secret
  tlsContext:
    name: min-tls-context
```

**Note**: Any `hosts` or `secret` in the `TLSContext` must be the compatible with the `Host` to which it is
being linked.

See [`TLSContext`](#tlscontext) below to read more on the description of these fields.

## TLSContext

The `TLSContext` is used to configure advanced TLS options in $productName$.
Remember, a `TLSContext` should always be paired with a `Host`.

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

  # If you set 'redirect_cleartext_from' to a port number, HTTP traffic
  # to that port will be redirected to HTTPS traffic. Make sure that the
  # port number you specify matches the port on which $productName$ is
  # listening!
  # redirect_cleartext_from: 8080

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

## TLS `Module` (*Deprecated*)

The TLS `Module` is deprecated. `TLSContext` should be used when using $productName$ version 0.50.0 and above.

For users of $productName$, see the [`Host` CRD](../host-crd) reference for more information.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Module
metadata:
  name:  tls
spec:
  config:
    # The 'server' block configures TLS termination. 'enabled' is the only
    # required element.
    server:
      # If 'enabled' is not True, TLS termination will not happen.
      enabled: True

      # If you set 'redirect_cleartext_from' to a port number, HTTP traffic
      # to that port will be redirected to HTTPS traffic. Make sure that the
      # port number you specify matches the port on which $productName$ is
      # listening!
      # redirect_cleartext_from: 8080

      # These are optional. They should not be present unless you are using
      # a custom Docker build to install certificates onto the container
      # filesystem, in which case YOU WILL STILL NEED TO SET enabled: True
      # above.
      #
      # cert_chain_file: /etc/certs/tls.crt   # remember to set enabled!
      # private_key_file: /etc/certs/tls.key  # remember to set enabled!

      # Enable TLS ALPN protocol, typically HTTP2 to negotiate it with
      # HTTP2 clients over TLS.
      # This must be set to be able to use grpc over TLS.
      # alpn_protocols: h2

    # The 'client' block configures TLS client-certificate authentication.
    # 'enabled' is the only required element.
    client:
      # If 'enabled' is not True, TLS client-certificate authentication will
      # not happen.
      enabled: False

      # If 'cert_required' is True, TLS client certificates will be required
      # for every connection.
      # cert_required: False

      # This is optional. It should not be present unless you are using
      # a custom Docker build to install certificates onto the container
      # filesystem, in which case YOU WILL STILL NEED TO SET enabled: True
      # above.
      #
      # cacert_chain_file: /etc/cacert/tls.crt  # remember to set enabled!
```
