# Timeouts

$productName$ enables you to control timeouts in several different ways.

## Request timeout: `timeout_ms`

`timeout_ms` is the end-to-end timeout for an entire user-level transaction in milliseconds. It begins after the full incoming request is received up until the full response stream is returned to the client. This timeout includes all retries. It can be disabled by setting the value to `0`.

Default: `3000`

## Idle timeout: `idle_timeout_ms`

`idle_timeout_ms` controls how long a connection should remain open when no traffic is being sent through the connection. `idle_timeout_ms` is distinct from `timeout_ms`, as the idle timeout applies on either down or upstream request events and is reset every time an encode/decode event occurrs or data is processed for the stream. `idle_timeout_ms` operates on a per-route basis and will overwrite behavior of the `cluster_idle_timeout_ms`.  If not set, $productName$ will default to the value set by `cluster_idle_timeout_ms`. It can be disabled by setting the value to `0`.

## Cluster max connection lifetime: `cluster_max_connection_lifetime_ms`

`cluster_max_connection_lifetime_ms` controls how long upstream connections should remain open, regardless of whether traffic is currently being sent through it or not. By setting this value, you can control how long Envoy will hold open healthy connections to upstream services before it is forced to recreate them, providing natural connection churn. This helps in situations where the upstream cluster is represented by a service discovery mechanism that requires new connections in order to discover new backends. In particular, this helps with Kubernetes Service-based routing where the set of upstream Endpoints changes, either naturally due to pod scale up or explicitly because the label selector changed.

## Cluster idle timeout: `cluster_idle_timeout_ms`

`cluster_idle_timeout_ms` controls how long a connection stream will remain open if there are no active requests. This timeout operates based on outgoing requests to upstream services. It can be disabled by setting the value to `0`.

Default `3600000` (1 hour).

## Connect timeout: `connect_timeout_ms`

`connect_timeout_ms` sets the connection-level timeout for $productName$ to an upstream service at the network layer.  This timeout runs until $productName$ can verify that a TCP connection has been established, including the TLS handshake.  This timeout cannot be disabled.

Default: `3000`

## Module only

## Listener idle timeout: `listener_idle_timeout_ms`

`listener_idle_timeout_ms` configures the [`idle_timeout`](https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/upstreams/http/v3/http_protocol_options.proto.html#extensions-upstreams-http-v3-httpprotocoloptions)
in the Envoy HTTP Connection Manager and controls how long a connection from the
downstream client to $productName$ will remain open if there are no active
requests. Only full requests will be counted towards this timeout so clients
sending TCP keepalives will not guarantee a connection remains open. This
timeout  It can be disabled by setting the value to `0`.


Default: `3600000` (1 hour)


**Caution** Disabling this timeout increases the likelihood of stream leaks due
to missed FINs in the TCP connection.

### Example

The various timeouts are applied to a Mapping resource and can be combined.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  hostname: '*'
  prefix: /backend/
  service: quote
  timeout_ms: 4000
  idle_timeout_ms: 500000
  connect_timeout_ms: 2000
```
