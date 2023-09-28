import Alert from '@material-ui/lab/Alert';

# The **External Filter** Type (v3alpha1)

The `External Filter` allows users to provide their own Kubernetes Service speaking the [ext_authz protocol][].
$productName$ will send a request to this "External Service" that contains a copy of the incoming request. The External Service will then be able
to examine details of the incoming request, make changes to its headers, and allow or reject it by sending back a response to $productName$.
The external service is free to perform any logic it likes before responding to $productName$, allowing for custom filtering and
processing on incoming requests. The `External Filter` may be used along with any of the other Filter types. For more information about
how requests are matched to `Filter` resources and the order in which `Filters` are executed, please refer to the [FilterPolicy Resource][] documentation.

<br />

This doc is an overview of all the fields on the `External Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
This page is specific to the `getambassador.io/v3alpha1` version of the `External Filter` resource. For the newer `gateway.getambassador.io/v1alpha1` resource,
please see [the v1alpha1 External Filter api reference][].

<Alert severity="info">
    <code>v3alpha1</code> <code>Filters</code> can only be referenced from <code>v3alpha1</code> <code>FilterPolicies</code>.
</Alert>

## External Filter API Reference

To create an External Filter, the `spec.type` must be set to `external`, and the `external` field must contain the configuration for your
external filter.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: "example-external-filter"
  namespace: "example-namespace"
spec:
  ambassador_id: []string                     # optional
  External:  ExternalFilter                   # required
    auth_service: string                      # required
    tls: bool                                 # optional, default=true if auth_service starts with https://
    tlsConfig: TLSConfig                      # optional
      certificate: TLSSource                  # optional
        fromSecret: SecretReference           # required
          name: string                        # required
          namespace: string                   # optional
      caCertificate: TLSSource                # optional
        fromSecret: SecretReference           # required
          name: string                        # required
          namespace: string                   # optional
    proto: Enum                               # optional, default=http
    timeout_ms: int                           # optional, default=5000
    allowed_request_headers: []string         # optional
    allowed_authorization_headers: []string   # optional
    add_linkerd_headers: bool                 # optional
    path_prefix: string                       # optional
    include_body: IncludeBody                 # optional
      max_bytes: int                          # required
      allow_partial: bool                     # required
    protocol_version: Enum                    # required
    status_on_error:                          # optional
      code: int                               # required
    failure_mode_allow: bool                  # optional

```

### ExternalFilter

| **Field**          | **Type**                    | **Description**                                                                                                                                                  |
|--------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `auth_service`     | `string`                    | Identifies the external auth service to talk to. The format of this field is `scheme://host:port` where `scheme://` and `:port` are optional. The scheme-part, if present, must be either `http://` or `https://`; if the scheme-part is not present, it behaves as if `http://` is given. The scheme-part influences the default value of the `tls` field and the default value of the port-part. The host-part must be the [namespace-qualified DNS name][] of the service you want to use for authentication. |
| `tls`              | `bool`                      | Controls whether to use TLS or cleartext when speaking to the external auth service. The default is based on the scheme-part of the `auth_service` |
| `tlsConfig`        | [TLSConfig][]               | Configures tls settings between $productName$ and the configured AuthService |
| `proto`            | `Enum` (`"http"`/`"grpc"`)  | The type of [ext_authz protocol][] to use when communicating with the External Service. It is recommended to use "grpc" over "http" due to supporting additional capabilities. |
| `timeout_ms`       | `int`                       | The total maximum duration in milliseconds for the request to the external auth service, before triggering `status_on_error` or `failure_mode_allow` |
| `allowed_request_headers` | `[]string`           | Only applies when `proto: http`. Lists the headers (case-insensitive) that are copied from the incoming request to the request made to the external auth service. In addition to the headers listed in this field, the following headers are always included: `Authorization`, `Cookie`, `From`, `Proxy-Authorization`, `User-Agent`, `X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto` |
| `allowed_authorization_headers` | `[]string`     | Only applies when `proto: http`. Lists the headers (case-insensitive) that are copied from the response from the external auth service to the request sent to the upstream backend service (if the external auth service indicates that the request to the upstream backend service should be allowed). In addition to the headers listed in this field, the following headers are always included: `Authorization`, `Location`, `Proxy-Authenticate`, `Set-cookie`, `WWW-Authenticate` |
| `add_linkerd_headers` | `bool`                   | Only applies when `proto: http`. When true, in the request to the external auth service, adds an `l5d-dst-override` HTTP header that is set to the hostname and port number of the external auth service |
| `path_prefix`      | `string`                    | Only applies when `proto: http`. Prepends a string to the request path of the request when sending it to the external auth service. By default this is empty, and nothing is prepended. For example, if the client makes a request to `/foo`, and `path_prefix: /bar`, then the path in the request made to the external auth service will be `/foo/bar` |
| `include_body`     | [IncludeBody][]             | Controls how much to buffer the request body to pass to the external auth service, for use cases such as computing an HMAC or request signature. If `include_body` is unset, then the request body is not buffered at all, and an empty body is passed to the external auth service. If include_body is not null, the `max_bytes` and `allow_partial` subfields are required. Unfortunately, in order for `include_body` to function properly, the `AuthService` resource must be edited to have its own `include_body` set with `max_bytes` greater than the largest `max_bytes` used by any `External Filter`, and `allow_partial: true` |
| `status_on_error.code`    | `int`                | Controls the status code returned when unable to communicate with external auth service. This is ignored if `failure_mode_allow: true` |
| `failure_mode_allow` | `bool`                    | Controls whether to allow or reject requests when there is an error communicating with the external auth service; a value of true allows the request through to the upstream backend service, a value of false returns a `status_on_error.code` response to the client |
| `protocol_version`  | `Enum (v3)`                | Only applies when `proto: grpc`. Indicates the version of the transport protocol that the `External Filter` is using. Allowed values are `v3` and `v2`. `protocol_version` was used in previous versions of $productName$ to note the protocol used by the gRPC service for the `External Filter`. $productName$ 3.x is running an updated version of Envoy that has dropped support for the `v2` protocol, so starting in 3.x, if `protocol_version` is not specified, the default value of `v2` will cause an error to be posted and a static response will be returned. Therefore, you must set it to `protocol_version: v3`. If upgrading from a previous version, you will want to set it to `v3` and ensure it is working before upgrading to $productName$ 3.x. The default value for `protocol_version` remains `v2` in the `getambassador.io/v3alpha1` CRD specifications to avoid making breaking changes outside of a CRD version change |

### IncludeBody

**Appears On**: [ExternalFilter][]
Configures passing along the request body to the External Service. If not set then a blank body is sent over to the External Service.

| **Field**        | **Type**  | **Description**                                                                                                                                                  |
|------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `maxBytes`       | `int`     | Sets the number of bytes of the request body to buffer over to the External Service |
| `allowPartial`   | `bool`    | Indicates whether the included body can be a partially buffered body or if the complete buffered body is expected. If not partial then a `HTTP 413` error is returned by Envoy. |

### TLSConfig

**Appears On**: [ExternalFilter][]
Configures passing along the request body to the External Service. If not set then a blank body is sent over to the External Service.

| **Field**                   | **Type**        | **Description**                                                                                                                                                  |
|-----------------------------|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `certificate.fromSecret`    | SecretReference | Configures $productName$ to use the provided certificate to present to the server when connecting. Provide the `name` and `namespace` (optional) of a `kubernetes.io/tls` [Kubernetes Secret][] that contains the private key and public certificate that will be presented to the AuthService. Secret namespace defaults to Filter namespace if not set |
| `caCertificate.fromSecret`  | SecretReference | Configures $productName$ to use the provided CA certifcate to verify the server provided certificate. Provide the `name` and `namespace` (optional) of an `Opaque` [Kubernetes Secret][] that contains the `tls.crt` key with the CA Certificate. Secret namespace defaults to Filter namespace if not set |


[ExternalFilter]: #externalfilter
[IncludeBody]: #includebody
[TLSConfig]: #tlsconfig
[ext_authz protocol]: ../../../../topics/running/services/ext-authz
[FilterPolicy Resource]: ../filterpolicy
[the v1alpha1 External Filter api reference]: ../../../gateway-getambassador/v1alpha1/filter-external
[Kubernetes Secret]: https://kubernetes.io/docs/concepts/configuration/secret
[namespace-qualified DNS name]: https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services
