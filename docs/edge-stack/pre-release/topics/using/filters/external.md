# Using The External Filter

The `External` `Filter` calls out to an external service speaking the
[`ext_authz` protocol](../../../running/services/ext-authz), providing
a highly flexible interface to plug in your own authentication,
authorization, and filtering logic.

<br />

The `External` spec is identical to the [`AuthService`
spec](../../../running/services/auth-service), with the following
exceptions:

* In an `AuthService`, the `tls` field must be a string referring to a
  `TLSContext`.  In an `External` `Filter`, it may only be a Boolean;
  referring to a `TLSContext` is not supported.
* In an `AuthService`, the default value of the `add_linkerd_headers`
  field is based on the [`ambassador`
  `Module`](../../../running/ambassador).  In an `External` `Filter`,
  the default value is always `false`.
* `External` `Filters` lack the `stats_name`, and
  `add_auth_headers` fields that `AuthServices` have.

<br />

See the [External Filter API reference][] for an overview of all the supported fields.

## Tracing Header Propagation

If $productName$ is configured to use a `TraceService`, Envoy will send tracing information as gRPC Metadata. Add the trace headers to the `allowed_request_headers` field to propagate the trace headers when using an ExternalFilter configured with `proto:http`. For example, if using **Zipkin** with **B3 Propagation** headers you can configure your External Filter like this:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: "my-ext-filter"
  namespace: "my-namespace"
spec:
  External:
    auth_service: "https://example-auth:3000"
    proto: http
    path_prefix: /check_request
    allowed_request_headers:
    - X-B3-Parentspanid
    - X-B3-Sampled
    - X-B3-Spanid
    - X-B3-Traceid
    - X-Envoy-Expected-Rq-Timeout-Ms
    - X-Envoy-Internal
    - X-Request-Id
```

## Configuring TLS Settings

When an `External Filter` has the `auth_service` field configured with a URL that starts with `https://` then $productName$
will attempt to communicate with the `AuthService` over a TLS connection. The following configurations are supported:

1. Verify server certificate with host CA Certificates - *default when `tls: true`*
2. Verify server certificate with provided CA Certificate
3. Mutual TLS between client and server

Overall, these new configuration options enhance the security of the communications between $productName$ and your `External Filter` by providing a way to
verify the server's certificate, allowing customization of the trust verification process, and enabling mutual TLS (mTLS) between $productName$ and the
`External Filter` service. By employing these security measures, users can have greater confidence in the authenticity, integrity,
and confidentiality of their filter's actions, especially if it interacts with any sensitive information.

### Example - Verify Server with Custom CA Certificate

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: "my-ext-filter"
  namespace: "my-namespace"
spec:
  External:
    auth_service: "https://example-auth:3000"
    proto: grpc
    tlsConfig:
      caCertificate:
        fromSecret:
          name: ca-cert-secret
          namespace: shared-certs
```

### Example - Mutual TLS (mTLS)

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: "my-ext-filter"
  namespace: "my-namespace"
spec:
  External:
    auth_service: "https://example-auth:3000"
    proto: grpc
    tlsConfig:
      caCertificate:
        fromSecret:
          name: ca-cert-secret
          namespace: shared-certs
      certificate:
        fromSecret:
          name: client-cert-secret
```

## Metrics

As of $productName$ 3.4.0, the following metrics for External Filters are available via the [metrics endpoint](../../../running/statistics/8877-metrics)

| Metric                                            | Type                  | Description                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ambassador_edge_stack_external_filter_allowed`   | Counter               | Number of requests that were allowed by Ambassador Edge Stack External Filters. Includes requests that are allowed by failure_mode_allow when unable to connect to the External Filter.                                                                                                           |
| `ambassador_edge_stack_external_filter_denied`    | Counter               | Number of requests that were denied by Ambassador Edge Stack External Filters. Includes requests that are denied by an inability to connect to the External Filter or due to a Filter config error.                                                                                               |
| `ambassador_edge_stack_external_filter_error`     | Counter               | Number of errors returned directly from Ambassador Edge Stack External Filters and errors from an inability to connect to the External Filter                                                                                                                                                     |
| `ambassador_edge_stack_external_handler_error`    | Counter               | Number of errors caused by Ambassador Edge Stack encountering invalid Filter config or an error while parsing the config. \nThese errors will always result in a HTTP 500 response being returned to the client and do not count towards metrics that track response codes from external filters. |
| `ambassador_edge_stack_external_filter_rq_class`  | Counter (with labels) | Aggregated counter of response code classes returned to downstream clients from Ambassador Edge Stack External Filters.  Includes requests that are denied by an inability to connect to the External Filter.                                                                                     |
| `ambassador_edge_stack_external_filter_rq_status` | Counter (with labels) | Counter of response codes returned to downstream clients from Ambassador Edge Stack External Filters. Includes requests that are denied by an inability to connect to the External Filter.                                                                                                        |

An example of what the metrics may look like can be seen below

```
# HELP ambassador_edge_stack_external_filter_allowed Number of requests that were allowed by Ambassador Edge Stack External Filters. Includes requests that are allowed by failure_mode_allow when unable to connect to the External Filter.
# TYPE ambassador_edge_stack_external_filter_allowed counter
ambassador_edge_stack_external_filter_allowed 2

# HELP ambassador_edge_stack_external_filter_denied Number of requests that were denied by Ambassador Edge Stack External Filters. Includes requests that are denied by an inability to connect to the External Filter or due to a Filter config error.
# TYPE ambassador_edge_stack_external_filter_denied counter
ambassador_edge_stack_external_filter_denied 12

# HELP ambassador_edge_stack_external_filter_error Number of errors returned directly from Ambassador Edge Stack External Filters and errors from an inability to connect to the External Filter
# TYPE ambassador_edge_stack_external_filter_error counter
ambassador_edge_stack_external_filter_error 2

# HELP ambassador_edge_stack_external_filter_rq_class Aggregated counter of response code classes returned to downstream clients from Ambassador Edge Stack External Filters.  Includes requests that are denied by an inability to connect to the External Filter.
# TYPE ambassador_edge_stack_external_filter_rq_class counter
ambassador_edge_stack_external_filter_rq_class{class="2xx"} 2
ambassador_edge_stack_external_filter_rq_class{class="4xx"} 5
ambassador_edge_stack_external_filter_rq_class{class="5xx"} 7

# HELP ambassador_edge_stack_external_filter_rq_status Counter of response codes returned to downstream clients from Ambassador Edge Stack External Filters. Includes requests that are denied by an inability to connect to the External Filter.
# TYPE ambassador_edge_stack_external_filter_rq_status counter
ambassador_edge_stack_external_filter_rq_status{status="200"} 2
ambassador_edge_stack_external_filter_rq_status{status="401"} 3
ambassador_edge_stack_external_filter_rq_status{status="403"} 2
ambassador_edge_stack_external_filter_rq_status{status="500"} 2
ambassador_edge_stack_external_filter_rq_status{status="501"} 5

# HELP ambassador_edge_stack_external_handler_error Number of errors caused by Ambassador Edge Stack encountering invalid Filter config or an error while parsing the config. \nThese errors will always result in a HTTP 500 response being returned to the client and do not count towards metrics that track response codes from external filters.
# TYPE ambassador_edge_stack_external_handler_error counter
ambassador_edge_stack_external_handler_error 0
```

## Transport Protocol Migration

> **Note:** The following information is only applicable to External Filters using `proto: grpc`
As of $productName$ version 2.3, the `v2` transport protocol is deprecated and any External Filters making use
of it should migrate to `v3` before support for `v2` is removed in a future release.

The following imports simply need to be updated to migrate an External Filter

`v2` Imports:

```go
  envoyCoreV2 "github.com/datawire/ambassador/pkg/api/envoy/api/v2/core"
  envoyAuthV2 "github.com/datawire/ambassador/pkg/api/envoy/service/auth/v2"
  envoyType "github.com/datawire/ambassador/pkg/api/envoy/type"
```

`v3` Imports:

```go
  envoyCoreV3 "github.com/datawire/ambassador/v2/pkg/api/envoy/config/core/v3"
  envoyAuthV3 "github.com/datawire/ambassador/v2/pkg/api/envoy/service/auth/v3"
  envoyType "github.com/datawire/ambassador/v2/pkg/api/envoy/type/v3"
```

In the [datawire/sample-external-service repository](https://github.com/datawire/Sample-External-Service), you can find examples of an External Filter using both the
`v2` transport protocol as well as `v3` along with deployment instructions for reference. The External Filter in this repo does not perform any authorization and is instead meant to serve as a reference for the operations that an External can make use of.

[External Filter API reference]: ../../../../custom-resources/getambassador.io/v3alpha1/filter-external
