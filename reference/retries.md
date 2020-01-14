# Automatic Retries

Sometimes requests fail. When these requests fail for transient issues, Ambassador can automatically retry the request.

Retry policy can be set for all Ambassador mappings in the [ambassador](/reference/core/ambassador) module, or set per [mapping](../mappings#configuring-mappings). Generally speaking, you should set retry policy on a per mapping basis. Global retries can easily result in unexpected cascade failures.

## Configuring retries

The `retry_policy` attribute configures automatic retries. The following fields are supported:
```yaml
retry_policy:
  retry_on: <string>
  num_retries: <integer>
  per_try_timeout: <string>
```

### `retry_on`
(Required) Specifies the condition under which Ambassador retries a failed request. The list of supported values is one of: `5xx`, `gateway-error`, `connect-failure`, `retriable-4xx`, `refused-stream`, `retriable-status-codes`. For more details on each of these values, see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/v1.9.0/configuration/http_filters/router_filter#x-envoy-retry-on).

### `num_retries`
(Default: 1) Specifies the number of retries to execute for a failed request.

### `per_try_timeout`
(Default: global request timeout) Specify the timeout for each retry, e.g., `1s`, `1500ms`.

## Examples

A per mapping retry policy:

```yaml
---
apiVersion: getambassador.io/v1
kind:  Mapping
metadata:
  name:  tour-backend
spec:
  prefix: /backend/
  service: tour
  retry_policy:
    retry_on: "5xx"
    num_retries: 10
```

A global retry policy (not recommended):

```yaml
---
apiVersion: getambassador.io/v1
kind:  Module
metadata:
  name:  ambassador
spec:
  config:
    retry_policy:
      retry_on: "retriable-4xx"
      num_retries: 4
---
apiVersion: getambassador.io/v1
kind:  Mapping
metadata:
  name:  tour-backend
spec:
prefix: /backend/
service: tour
```
