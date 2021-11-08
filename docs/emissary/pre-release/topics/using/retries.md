# Automatic retries

Sometimes requests fail. When these requests fail for transient issues, $productName$ can automatically retry the request.

Retry policy can be set for all $productName$ mappings in the [`ambassador Module`](../../running/ambassador), or set per [`Mapping`](../mappings). Generally speaking, you should set `retry_policy` on a per mapping basis. Global retries can easily result in unexpected cascade failures.

> Note that when setting `retry_policy`, adjusting `max_retries` in the [circuit breaker](https://www.getambassador.io/docs/edge-stack/pre-release/topics/using/circuit-breakers/) configuration should also be considered in order to account for all desired retries.

## Configuring retries

The `retry_policy` attribute configures automatic retries. The following fields are supported:

```yaml
retry_policy:
  retry_on: <string>
  num_retries: <integer>
  per_try_timeout: <string>
```

### `retry_on`

(Required) Specifies the condition under which $productName$ retries a failed request.

| Value | Description |
| --- | --- |
|`5xx`| Retries if the upstream service responds with any 5xx code or does not respond at all
|`gateway-error`| Similar to a `5xx` but only applies to a 502, 503, or 504 response
|`connect-failure`| Retries on a connection failure to the upstream service (included in `5xx`)
|`retriable-4xx`| Retries on a retriable 4xx response (currently only 409)
|`refused-stream`| Retires if the upstream service sends a REFUSED_STREAM error (included in `5xx`)
|`retriable-status-codes`| Retries based on status codes set in the `x-envoy-retriable-status-codes` header. If that header isn't set, $productName$ will not retry the request.

 For more details on each of these values, see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/v1.9.0/configuration/http_filters/router_filter#x-envoy-retry-on).

### `num_retries`

(Default: 1) Specifies the number of retries to execute for a failed request.

### `per_try_timeout`

(Default: global request timeout) Specify the timeout for each retry. Must be in seconds or nanoseconds, e.g., `1s`, `1500ns`.

## Examples

A per mapping retry policy:

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
  retry_policy:
    retry_on: "5xx"
    num_retries: 10
```

A global retry policy (not recommended):

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Module
metadata:
  name:  ambassador
spec:
  config:
    retry_policy:
      retry_on: "retriable-4xx"
      num_retries: 4
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
  service: quote
  hostname: '*'
```
