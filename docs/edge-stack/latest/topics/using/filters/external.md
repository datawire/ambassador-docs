# External Filter

The `External` `Filter` calls out to an external service speaking the
[`ext_authz` protocol](../../../running/services/ext-authz), providing
a highly flexible interface to plug in your own authentication,
authorization, and filtering logic.

## Example

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: "my-filter"
  namespace: "my-namespace"
spec:
  External:
    auth_service: "https://example-auth:3000"
    proto: http
    timeout_ms: 5000
    include_body:
      max_bytes: 4096
      allow_partial: true
    status_on_error:
      code: 403
    failure_mode_allow: false

    # proto: http only
    path_prefix: "/path"
    allowed_request_headers:
    - "x-allowed-input-header"
    allowed_authorization_headers:
    - "x-allowed-output-header"
    add_linkerd_headers: false
```

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

## Fields

`auth_service` is the only required field, all others are optional.

| Attribute                    | Default value                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auth_service`               | (none; a value is required)                                 | Identifies the external auth service to talk to.  The format of this field is `scheme://host:port` where `scheme://` and `:port` are optional.  The scheme-part, if present, must be either `http://` or `https://`; if the scheme-part is not present, it behaves as if `http://` is given.  The scheme-part influences the default value of the `tls` field and the default value of the port-part.  The host-part must be the [namespace-qualified DNS name](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services) of the service you want to use for authentication.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls`                        | `true` if `auth_service` starts with "https://"             | Controls whether to use TLS or cleartext when speaking to the external auth service.  The default is based on the scheme-part of the `auth_service`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tlsConfig`                  | none; optional                                              | Configure tls settings between $productName$ and the configured AuthService. See [`Configure TLS Settings`](#configuring-tls-settings).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `proto`                      | `http`                                                      | Specifies which variant of the [`ext_authz` protocol](../../../running/services/ext-authz) to use when communicating with the external auth service.  Valid options are `http` or `grpc`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `timeout_ms`                 | `5000`                                                      | The total maximum duration in milliseconds for the request to the external auth service, before triggering `status_on_error` or `failure_mode_allow`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `include_body`               | `null`                                                      | Controls how much to buffer the request body to pass to the external auth service, for use cases such as computing an HMAC or request signature.  If `include_body` is `null` or unset, then the request body is not buffered at all, and an empty body is passed to the external auth service.  If `include_body` is not `null`, the `max_bytes` and `allow_partial` subfields are required.  Unfortunately, in order for `include_body` to function properly, the `AuthService` in [`aes.yaml`](https://app.getambassador.io/yaml/edge-stack/$version$/aes.yaml) must be edited to have `include_body` set with `max_bytes` greater than the largest `max_bytes` used by any `External` `Filter` (so if an `External` `Filter` has `max_bytes: 4096`, then the `AuthService` will need `max_bytes: 4097`), and `allow_partial: true`.                                                                                                                                                                                                    |
| `include_body.max_bytes`     | (none; a value is required if `include_body` is not `null`) | Controls the amount of body data that is passed to the external auth service.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `include_body.allow_partial` | (none; a value is required if `include_body` is not `null`) | Controls what happens to requests with bodies larger than `max_bytes`.  If `allow_partial` is `true`, the first `max_bytes` of the body are sent to the external auth service.  If `false`, the message is rejected with HTTP 413 ("Payload Too Large").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `status_on_error.code`       | `403`                                                       | Controls the status code returned when unable to communicate with external auth service.  This is ignored if `failure_mode_allow: true`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `failure_mode_allow`         | `false`                                                     | Controls whether to allow or reject requests when there is an error communicating with the external auth service; a value of `true` allows the request through to the upstream backend service, a value of `false` returns a `status_on_error.code` response to the client.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `protocol_version`           | `v2`                                                        | Indicates the version of the transport protocol that the External Filter is using. This is only applicable to External Filters using `proto: grpc`. Allowed values are `v3` and `v2`(defualt). `protocol_version` was used in previous versions of $productName$ to note the protocol used by the gRPC service for the External Filter. $productName$ 3.x is running an updated version of Envoy that has dropped support for the `v2` protocol, so starting in 3.x, if `protocol_version` is not specified, the default  value of `v2` will cause an error to be posted and a static response will be returned. Therefore, you must set it to `protocol_version: v3`. If upgrading from a previous version, you will want  to set it to `v3` and ensure it is working before upgrading to Emissary-ingress 3.Y. The default value for `protocol_version` remains `v2` in the `getambassador.io/v3alpha1` CRD specifications to avoid making breaking changes outside of a CRD version change. Future versions of CRD's will deprecate it. |

The following fields are only used if `proto` is set to `http`.  They
are ignored if `proto` is `grpc`.

| Attribute                       | Default value | Description                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path_prefix`                   | `""`          | Prepends a string to the request path of the request when sending it to the external auth service.  By default this is empty, and nothing is prepended.  For example, if the client makes a request to `/foo`, and `path_prefix: /bar`, then the path in the request made to the external auth service will be `/foo/bar`.                                                                                                                              |
| `allowed_request_headers`       | `[]`          | Lists the headers (case-insensitive) that are copied from the incoming request to the request made to the external auth service.  In addition to the headers listed in this field, the following headers are always included: `Authorization`, `Cookie`, `From`, `Proxy-Authorization`, `User-Agent`, `X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto`.                                                                                   |
| `allowed_authorization_headers` | `[]`          | Lists the headers (case-insensitive) that are copied from the response from the external auth service to the request sent to the upstream backend service (if the external auth service indicates that the request to the upstream backend service should be allowed).  In addition to the headers listed in this field, the following headers are always included: `Authorization`, `Location`, `Proxy-Authenticate`, `Set-cookie`, `WWW-Authenticate` |
| `add_linkerd_headers`           | `false`       | When true, in the request to the external auth service, adds an `l5d-dst-override` HTTP header that is set to the hostname and port number of the external auth service.                                                                                                                                                                                                                                                                                |


The following fields are only used if `proto` is set to `grpc`.  They
are ignored if `proto` is `http`.


| Attribute          | Default value | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protocol_version` | `v2`          | Indicates the version of the transport protocol that the External Filter is using. This is only applicable to External Filters using `proto: grpc`. When left unset or set to `v2` $productName$ will automatically convert between the `v2` protocol used by the External Filter and the `v3` protocol that is used by the `AuthService` that ships with $productName$. When this field is set to `v3` then no conversion between $productName$ and the `AuthService` will take place as it can speak `v3` natively with $productName$'s `AuthService`. |

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

When an `ExternalFilter` has the `auth_service` field configured with a URL that starts with `https://` then $productName$ will attempt to communicate with the AuthService over a TLS connection. The following configurations are supported:

1. Verify server certificate with host CA Certificates - *default when `tls: true`*
2. Verify server certificate with provided CA Certificate
3. Mutual TLS between client and server

Overall, these new configuration options enhance the security of the communications between $productName$ and your `ExternalFilter` by providing a way to verify the server's certificate, allowing customization of the trust verification process, and enabling mutual TLS (mTLS) between $productName$ and the `ExternalFilter` service. By employing these security measures, users can have greater confidence in the authenticity, integrity, and confidentiality of their filter's actions, especially if it interacts with any sensitive information.

The following settings are provided for configuring the `tlsConfig`:

| Attribute       | Sub-Field    | Default Value                                               | Description                                                                                                                                                                                                                                                        |
| --------------- | ------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `caCertificate` |              |                                                             | Configures $productName$ to use the provided CA certifcate to verify the server provided certificate.                                                                                                                                                               |
|                 | `fromSecret` | secret `namespace` defaults to Filter namespace if not set. | Provide the `name` and `namespace` (optional) of an `Opaque` [Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/#secret-types) that contains the `tls.crt` key with the CA Certificate.                                                  |
| `certificate`   |              |                                                             | Configures $productName$ to use the provided certificate to present to the server when connecting.                                                                                                                                                                  |
|                 | `fromSecret` | secret `namespace` defaults to Filter namespace if not set. | Provide the `name` and `namespace` (optional) of a `kubernetes.io/tls` [Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/#secret-types) that contains the private key and public certificate that will be presented to the AuthService. |

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
```
	envoyCoreV2 "github.com/datawire/ambassador/pkg/api/envoy/api/v2/core"
	envoyAuthV2 "github.com/datawire/ambassador/pkg/api/envoy/service/auth/v2"
	envoyType "github.com/datawire/ambassador/pkg/api/envoy/type"
```

`v3` Imports:
```
	envoyCoreV3 "github.com/datawire/ambassador/v2/pkg/api/envoy/config/core/v3"
	envoyAuthV3 "github.com/datawire/ambassador/v2/pkg/api/envoy/service/auth/v3"
	envoyType "github.com/datawire/ambassador/v2/pkg/api/envoy/type/v3"
```

In the [datawire/sample-external-service repository](https://github.com/datawire/Sample-External-Service), you can find examples of an External Filter using both the
`v2` transport protocol as well as `v3` along with deployment instructions for reference. The External Filter in this repo does not perform any authorization and is instead meant to serve as a reference for the operations that an External can make use of.
