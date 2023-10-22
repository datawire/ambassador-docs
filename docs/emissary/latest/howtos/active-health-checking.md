import Alert from '@material-ui/lab/Alert';

# Active Health Checking

$productName$ provides support for active health checking of upstreams via the `Mapping` resource. Active health checking will configure Envoy to make requests to the upstream at a configurable interval. If the upstream does not respond with an expected status code then the upstream will be marked as unhealthy and Envoy will no longer route requests to that upstream until they respond successfully to the health check.

This feature can only be used with the [endpoint resolver](../../topics/running/resolvers#the-kubernetes-endpoint-resolver). This is necessary because the endpoint resolver allows Envoy to be aware of each individual pod in a deployment as opposed to the [kubernetes service resolver](../../topics/running/resolvers#the-kubernetes-service-resolver) where Envoy is only aware of the upstream as a single endpoint. When envoy is aware of the multiple pods in a deployment then it will allow the active health checks to mark an individual pod as unhealthy while the remaining pods are able to serve requests.

<Alert severity="warning">
Active health checking configuration wil only function with the <a href="../../topics/running/resolvers#the-kubernetes-endpoint-resolver">endpoint resolver</a>. If configuration for active health checking is provided on a <code>Mapping</code> that does not use the endpoint resolver then the health checking configuration will be ignored.
</Alert>

## Active Health Checking Configuration

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: "example-mapping"
  namespace: "example-namespace"
spec:
  hostname: "*"
  prefix: /example/
  service: quote
  health_checks:                list[object]                 # optional
  - unhealthy_threshold:        int                          # optional (default: 2)
    healthy_threshold:          int                          # optional (default: 1)
    interval:                   duration                     # optional (default: 5s)
    timeout:                    duration                     # optional (default: 3s)
    health_check:               object                       # required
      http:
        path:                   string                       # required
        hostname:               string                       # optional
        remove_request_headers: list[string]                 # optional
        add_request_headers:    list[object]                 # optional
        - example-header-1:
            append:             bool                         # optional (default: true)
            value:              string                       # required
        expected_statuses:      list[object]                 # optional
        - max:                  int (100-599)                # required (only when using expected_statuses)
          min:                  int (100-599)                # required (only when using expected_statuses)

  - health_check:               object                       # required
      grpc:
        authority:              string                       # optional
        upstream_name:          string                       # required
...
```

### `health_checks` configuration

`health_checks` Configures a list of health checks to be run for the `Mapping` and provides several config options for how the health check requests should be run.

- `unhealthy_threshold`: The number of unexpected responses for an upstream pod to be marked as unhealthy. Regardless of the configuration of `unhealthy_threshold`, a single `503` response will mark the upstream as unhealthy until it passes the required number of health checks. This field is optional and defaults to `2`.
- `healthy_threshold`: The number of expected responses for an unhealthy upstream pod to be marked as healthy and resume handling traffic. This field is optional and defaults to `1`.
- `interval`: Specifies the interval for how frequently the health check request should be made. It is divided amongst the pods in a deployment. For example, an `interval` of `1s` on a deployment of 5 pods would result in each pod receiving a health check request about every 5 seconds. This field is optional and defaults to `5s` when not configured.
- `timeout`: Configures the timeout for the health check requests to an upstream. If a health check request fails the timeout it will be considred a failed check and count towards the `unhealthy_threshold`. This field is optional and defaults to `3s`.
- `health_check`: This field is required and provides the configuration for how the health check requests should be made. Either `grpc` or `http` may be configured for this field depending on whether an HTTP or gRPC health check is desired.

### HTTP `health_check` Configuration

`health_check.http` configures HTTP health checks to the upstream.

- `path`: This field is required and configures the path on the upstream service that the health checks request should be made to.
- `hostname`: Configures the value of the host header in the health check request. This field is optional and defaults to using the name of the Envoy cluster this health check is associated with.
- `expected_statuses`: Configures a range of response statuses from Min to Max (both inclusive). If the upstream returns any status in this range then it will be considered a passed health check. Thies field is optional and by default only `5xx` responses count as a failed health check and contribute towards the `unhealthy_threshold`.
  - `max`: End of the statuses to include. Must be between 100 and 599 (inclusive).
  - `min`: Start of the statuses to include. Must be between 100 and 599 (inclusive).
- `remove_request_headers`: Configures a list of HTTP headers that should be removed from each health check request sent to the upstream.
- `request_headers_to_add`: Configures a list of HTTP headers that should be added to each health check request sent to the upstream.

### gRPC `health_check` Configuration

`health_check.grpc` configures gRPC health checks to the upstream. Only two fields are configurable for gRPC health checks.

- `authority`: Configures the value of the :authority header in the gRPC health check request. This field is optional and if left empty the upstream name will be used.
- `upstream_name`: This field is required and configures the UpstreamName name parameter which will be sent to gRPC service in the health check message.
