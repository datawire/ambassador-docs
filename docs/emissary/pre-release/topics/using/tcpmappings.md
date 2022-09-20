# `TCPMapping` resources

In addition to managing HTTP, gRPC, and WebSockets at layer 7, $productName$ can also manage TCP connections at layer 4. The core abstraction used to support TCP connections is the `TCPMapping`.

An $productName$ `TCPMapping` associates TCP connections with upstream _services_.
Cleartext TCP connections are defined by destination IP address and/or destination TCP port;
TLS-encrypted TCP connections can also be defined by the hostname presented using SNI.
A service is exactly the same as in HTTP [`Mappings`](../mappings/) and other $productName$ resources.

## TCPMapping configuration

Like all native $productName$ resources, `TCPMappings` have an
`ambassador_id` field to select which $productName$ installations take
notice of it:

| Attribute       | Description                                                                                                   | Type             | Default value                    |
|:----------------|:--------------------------------------------------------------------------------------------------------------|:-----------------|----------------------------------|
| `ambassador_id` | [A list of `ambassador_id`s which should pay attention to this resource](../../running/running#ambassador_id) | array of strings | optional; default is ["default"] |

### Downstream configuration

The downstream configuration refers to the connection between the end-client and $productName$.

| Attribute | Description                                                                                                                                          | Type    | Default value                                                    |
|:----------|:-----------------------------------------------------------------------------------------------------------------------------------------------------|:--------|:-----------------------------------------------------------------|
| `port`    | Which TCP port number $productName$ should listen on this `TCPMapping`; may or may not correspond to a [`Listener` resource](../../running/listener) | string  | required; no default                                             |
| `host`    | If non-empty, [terminate TLS](#tls-termination) on this port; using this hostglob for SNI-based for routing                                          | string  | optional; if not present, do not terminate TLS on this port      |
| `address` | Which IP address $productName$ should listen on                                                                                                      | string  | optional; if not present, accept connections on all IP addresses |
| `weight`  | The (integer) percentage of traffic for this resource when [canarying](../canary) between multiple `TCPMappings`                                     | integer | optional; default is to not canary                               |

If the `port` does not pair with an actual existing
[`Listener`](../../running/listener), then an appropriate internal
`Listener` is automatically created.

If the `Listener` does *not* terminate TLS (controlled by
`Listener.spec.protocolStack` and by `TCPMapping.spec.host`), then no
[`Hosts`](../../running/host-crd) may associate with the `Listener`,
and only one `TCPMapping` (or set of [canaried](../canary)
`TCPMappings`; see the `weight` attribute) may associate with the
`Listener`.

If the `Listener` *does* terminate TLS, then any number of
`TCPMappings` and `Hosts` may associate with the `Listener`, and are
selected between using SNI.

It is an error if the `TCPMapping.spec.host` and
`Listener.spec.protocolStack` do not agree about whether TLS should be
terminated, and the `TCPMapping` will be discarded.

#### TLS termination

If the `host` field is non-empty, then the `TCPMapping` will terminate
TLS when listening for connections from end-clients

To do this, $productName$ needs a TLS certificate and configuration;
there are two ways that this can be provided:

First, $productName$ checks for any [`Host`
resources](../../running/host-crd) with TLS configured whose
`Host.spec.hostname` glob-matches the `TCPMapping.spec.host`; if such
a `Host` exists, then its TLS certificate and configuration is used.

Second, if such a `Host` is not found, then $productName$ checks for
any [`TLSContext` resources](../../running/tls) who have an item in
`TLSContext.spec.hosts` that exact-matches the `TCPMapping.spec.host`;
if such a `TLSContext` exists, then it and its certificate are used.
These host fields may _contain_ globs, but they are not considered
when matching; for example, a `TLSContext` host string of
`*.example.com` would not match with a `TCPMapping` host of
`foo.example.com`, but would match with a `TCPMapping` host of
`*.example.com`.

It is an error if no such `Host` or `TLSContext` is found, then the
`TCPMapping` is discarded.

### Upstream configuration

The upstream configuration refers to the connection between
$productName$ and the service that it is a gateway to.

| Attribute          | Description                                                                                                                                                                                          | Type             | Default value                                                                                           |
|:-------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------|:--------------------------------------------------------------------------------------------------------|
| `service`          | The service to talk to; a string of the format `scheme://host:port`, where `scheme://` and `:port` are optional.  If the scheme is `https`, then TLS is originated, otherwise the scheme is ignored. | string           | required; no default; if originating TLS the default port is 443, otherwise the default port is 80      |
| `resolver`         | The [resolver](../../running/resolvers) to use when resolving the hostname in `service`                                                                                                              | string           | optional                                                                                                |
| `enable_ipv4`      | Whether to enable IPv4 DNS lookups when resolving the hostname in `service`; has no affect if the hostname is an IP address or using a non-DNS `resolver`.                                           | Boolean          | optional; default is true unless set otherwise by the [`ambassador` `Module`](../../running/ambassador) |
| `enable_ipv6`      | Whether to enable IPv6 DNS lookups when resolving the hostname in `service`; has no affect if the hostname is an IP address or using a non-DNS `resolver`.                                           | Boolean          | optional; default is true unless set otherwise by the [`ambassador` `Module`](../../running/ambassador) |
| `tls`              | The name of a [`TLSContext`](../../running/tls) to originate TLS; TLS is originated if `tls` is non-empty.                                                                                           | string           | optional; default is to not use a `TLSContext`                                                          |
| `circuit_breakers` | Circuit breakers, same as for [HTTP `Mappings`](../circuit-breakers)                                                                                                                                 | array of objects | optional; default is set by the [`ambassador` `Module`](../../running/ambassador)                       |
| `idle_timeout_ms`  | The timeout, in milliseconds, after which the connection will be terminated if no traffic is seen.                                                                                                   | integer          | optional; default is no timeout                                                                         |

If both `enable_ipv4` and `enable_ipv6` are true, $productName$ will prefer IPv6 to IPv4. See the [`ambassador` `Module`](../../running/ambassador) documentation for more information.

The values for the scheme-part of the `service` are a bit of a
misnomer; despite the `https://` string being recognized, it does not
imply anything about whether the traffic is HTTP; just whether it is
encrypted.

If `service` does not specify a port number: if TLS is *not* being
originated, then a default port number of `80` is used; if TLS *is*
being originated (either because the `service` says `https://` or
because `tls` is set), then a default port number of `443` is used
(even if the service says `http://`).

The default `resolver` is a KubernetesServiceResolver, which takes a [namespace-qualified DNS name](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services).
Given that `AMBASSADOR_NAMESPACE` is correctly set, $productName$ can map to services in other namespaces:
- `service: servicename` will route to a service in the same namespace as $productName$, and
- `service: servicename.namespace` will route to a service in a different namespace.

#### TLS origination

If the `TCPMapping.spec.service` starts with `https://`, or if the
`TCPMapping.spec.tls` is set, then the `TCPMapping` will originate TLS
when dialing out to the service.

If originating TLS, but `TCPMapping.spec.tls` is not set, then
$productName$ will use a default TLS client configuration, and will
not provide a client certificate.

If `TCPMapping.spec.tls` is set, then $productName$ looks for a
[`TLSContext` resource](../../running/tls) with that name (the
`TLSContext` may be found in _any_ namespace).

### `TCPMapping` and TLS

The `TCPMapping.spec.host` attribute determines whether $productName$ will _terminate_ TLS when a client connects to $productName$.
The `TCPMapping.spec.service` and `TCPMapping.spec.tls` attributes work together to determine whether $productName$ will _originate_ TLS when connecting to an upstream.
The two are _totally_ independent.
See the sections on [TLS termination](#tls-termination) and [TLS origination](#tls-origination), respectively.

## Examples

### neither terminating nor originating TLS

If `host` is not set, then TLS is not terminated.
If `service` does not start with `https://` and `tls` is empty, then TLS is not originated.
So, if both of these are true, then$productName$ simply proxies bytes between the client and the upstream; TLS may or may not be involved, $productName$ doesn't care.
You should specify in `service` which port to dial to; if you don't, $productName$ will use port 80 because it is not originating TLS.

So, for example,

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: TCPMapping
metadata:
  name:  ssh
spec:
  port: 2222
  service: upstream:22
```

could be used to relay an SSH connection on port 2222, or

```yaml
apiVersion: getambassador.io/v3alpha1
kind: TCPMapping
metadata:
  name:  cockroach
spec:
  port: 26257
  service: cockroach:26257
```

could proxy a CockroachDB connection.

### terminating TLS, but not originating it

If `host` is set, then TLS is terminated.
If `service` does not start with `https://` and `tls` is empty, then TLS is not originated.
In this case, $productName$ will terminate the TLS connection, require that the host offered with SNI match the `host` attribute, and then make a **cleartext** connection to the upstream host.
You should specify in `service` which port to dial to; if you don't, $productName$ will use port 80 because it is not originating TLS.

This can be useful for doing host-based TLS proxying of arbitrary protocols, allowing the upstream to not have to care about TLS.

Note that this case **requires** that you have created a termination `TLSContext` or `Host` that matches the `TCPMapping.spec.host`.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  TLSContext
metadata:
  name:  my-context
spec:
  hosts:
  - my-host-1
  - my-host-2
  secret: supersecret
---
apiVersion: getambassador.io/v3alpha1
kind: TCPMapping
metadata:
  name:  my-host-1
spec:
  port: 2222
  host: my-host-1
  service: upstream-host-1:9999
---
apiVersion: getambassador.io/v3alpha1
kind: TCPMapping
metadata:
  name:  my-host-2
spec:
  port: 2222
  host: my-host-2
  service: upstream-host-2:9999
```

The above will accept a TLS connection with SNI on port 2222.
If the client requests SNI host `my-host-1`, the decrypted traffic will be relayed to `upstream-host-1`, port 9999.
If the client requests SNI host `my-host-2`, the decrypted traffic will be relayed to `upstream-host-2`, port 9999.
Any other SNI host will cause the TLS handshake to fail.

#### both terminating and originating TLS, with and without a client certificate

If `host` is set, then TLS is terminated.
In this case, $productName$ will terminate the incoming TLS connection, require that the host offered with SNI match the `host` attribute, and then make a **TLS** connection to the upstream host.

If `tls` is non-empty, then TLS is originated with a client certificate.
In this case, $productName$ will use the `TLSContext` referred to by `tls` to determine the certificate offered to the upstream service.

If `service` starts with `https://`, then then TLS is originated without a client certificate (unless `tls` is also set)

In either case, you should specify in `service` which port to dial to; if you don't, $productName$ will use port 443 because it is originating TLS.

This is useful for doing host routing while ensuring that data is always encrypted while in-transit.

Note that this case **requires** that you have created a termination `TLSContext` or `Host` that matches the `TCPMapping.spec.host`.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  TLSContext
metadata:
  name:  my-context
spec:
  hosts:
  - my-host-1
  - my-host-2
  secret: supersecret
---
apiVersion: getambassador.io/v3alpha1
kind:  TLSContext
metadata:
  name:  origination-context
spec:
  secret: othersecret
---
apiVersion: getambassador.io/v3alpha1
kind: TCPMapping
metadata:
  name:  test-1
spec:
  port: 2222
  host: my-host-1
  service: https://upstream-host-1:9999
---
apiVersion: getambassador.io/v3alpha1
kind: TCPMapping
metadata:
  name:  test-2
spec:
  port: 2222
  host: my-host-2
  tls: origination-context
  service: https://upstream-host-2:9999
```

The above will accept a TLS connection with SNI on port 2222.

If the client requests SNI host `my-host-1`, the traffic will be relayed over a TLS connection to `upstream-host-1`, port 9999. No client certificate will be offered for this connection.

If the client requests SNI host `my-host-2`, the decrypted traffic will be relayed to `upstream-host-2`, port 9999. The client certificate from `origination-context` will be offered for this connection.

Any other SNI host will cause the TLS handshake to fail.

#### originating TLS, but not terminating it

Here, $productName$ will accept the connection **without terminating TLS**, then relay traffic over a **TLS** connection upstream. This is probably useful only to accept unencrypted traffic and force it to be encrypted when it leaves $productName$.

Example:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  TLSContext
metadata:
  name:  origination-context
spec:
  secret: othersecret
---
apiVersion: getambassador.io/v3alpha1
kind: TCPMapping
metadata:
  name:  test
spec:
  port: 2222
  service: https://upstream-host:9999
```

The example above will accept **any** connection to port 2222 and relay it over a **TLS** connection to `upstream-host` port 9999. No client certificate will be offered.
