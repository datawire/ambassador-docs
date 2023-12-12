import Alert from '@material-ui/lab/Alert';

# The **External Filter** Type

The `External Filter` allows users to provide their own Kubernetes Service speaking the [ext_authz protocol][].
$productName$ will send a request to this "External Service" that contains a copy of the incoming request. The External Service will then be able
to examine details of the incoming request, make changes to its headers, and allow or reject it by sending back a response to $productName$.
The external service is free to perform any logic it likes before responding to $productName$, allowing for custom filtering and
processing on incoming requests. The `External Filter` may be used along with any of the other Filter types. For more information about
how requests are matched to `Filter` resources and the order in which `Filters` are executed, please refer to the [FilterPolicy Resource][] documentation.

This doc is an overview of all the fields on the External `Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
Tutorials and guides for the External `Filter` Resource can be found in the [usage guides section][]

## External Filter API Reference

To create an External Filter, the `spec.type` must be set to `external`, and the `external` field must contain the configuration for your
external filter.

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: Filter
metadata:
  name: "example-external-filter"
  namespace: "example-namespace"
spec:
  type:      "external"                     # required
  external:  ExternalFilter                 # required when `type: "external"`
    protocol: Enum                          # required
    authServiceURL: string                  # required, must be an absolute url
    statusOnError: int                      # optional, default: `403`
    failureModeAllow: bool                  # optional, default: `false`
    timeout: Duration                       # optional, default: `"5s"`
    httpSettings: HTTPSettings              # optional, can only be set when `protocol: "http"`
      pathPrefix: string                    # optional
      allowedRequestHeaders: []string       # optional
      allowedAuthorizationHeaders: []string # optional
      addLinkerdHeaders: bool               # optional, default: `false`
    grpcSettings: GRPCSettings              # optional, can only be set when `protocol: "grpc"`
      protocolVersion: Enum                 # optional, default: `"v3"`
    include_body: IncludeBody               # optional
      maxBytes: int                         # required, default: `4096`
      allowPartial: bool                    # required, default `true`
status: []metav1.Condition                  # field managed by controller, max items: 8
```

### ExternalFilter

| **Field**          | **Type**                    | **Description**                                                                                                                                                  |
|--------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `protocol`         | `Enum` (`"http"`/`"grpc"`)  | The type of protocol to use when communicating with the External Service. It is recommended to use "grpc" over "http" due to supporting additional capabilities. |
| `authServiceURL`   | `string`                    | The URL of the service performing the authorization / filtering logic. Must be an absolute URL. |
| `statusOnError`    | `int`                       | Allows overriding the status code returned when the External Service returns a non 200 response code for `protocol: "http"` or [DeniedHttpResponse][] for `protocol: "grpc"` |
| `failureModeAllow` | `bool`                      | Determines what happens when $productName$ cannot communicate with the External Service due to network issues, or the service not being available. By default, the ExternalFilter will reject the request if it is unable to communicate. This can be overriden by setting this setting to `"true"` so that it fails open, allowing the request through to the upstream service. |
| `timeout`          | [Duration][]                | The amount of time $productName$ will wait before erring on a timeout. **Note**: this value cannot be larger than the overall Auth Service timeout that is configured in Envoy or else it would effectively not have any timeout. |
| `httpSettings`     | [HTTPSettings][]            | Settings specific to the http protocol. This can only be set when `protocol: "http"`. |
| `grpcSettings`     | [GRPCSettings][]            | Settings specific to the grpc protocol. This can only be set when `protocol: "grpc"`. |
| `include_body`     | [IncludeBody][]             | Configures passing along the request body to the External Service. If not set then a blank body is sent over to the External Service. |

<Alert severity="warning">
  The overall Auth Service timeout that is configured in Envoy, mentioned in the <code>timeout</code> field is set to `5 Seconds` and is not currently configurable but will be made so for the official release of $productName$ 4.x.
</Alert>

### Duration

**Appears On**: [ExternalFilter][]
Duration is a field that accepts a string that will be parsed as a sequence of decimal numbers ([metav1.Duration][]), each with optional fraction
and a unit suffix, such as `"300ms"`, `"1.5h"` or `"2h45m"`. Valid time units are `"ns"`, `"us"` (or `"µs"`), `"ms"`, `"s"`,
`"m"`, `"h"`. See [Go time.ParseDuration][].

### HTTPSettings

**Appears On**:
Settings specific to the http protocol. This can only be set when `protocol: "http"`.

| **Field**                     | **Type**     | **Description**                                                                                                                                                  |
|-------------------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `pathPrefix`                  | `string`     | Value that gets appended to the path of the downsteam request. Nothing is appended when this field is omitted |
| `allowedRequestHeaders`       | `[]string`   | A list of headers from the downstream request that will be passed along as headers in the request to the external service. This includes metadata sent from Envoy to the EdgeStack Auth Service. By default, the following list of headers are passed through: `authorization`,`cookie`,`from`,`proxy-authorization`, `user-agent`, `x-forwarded-for`, `x-forwarded-host`, `x-forwarded-proto`. |
| `allowedAuthorizationHeaders` | `[]string`   | Headers from the External Service that will be added to the request to the upstream service. By default, the following headers are passed to the upstream service: `location`,`authorization`,`proxy-authenticate`,`set-cookie`,`www-authenticate`. Any additional headers that are needed should be added and are case-insenstive. |
| `addLinkerdHeaders`           | `bool`       | When set to `true`, injects the `l5d-dst-override` header set to hostname and port of the external service which is used by [LinkerD][] when proxying through the Service Mesh. |

### GRPCSettings

**Appears On**: [ExternalFilter][]
Settings specific to the http protocol. This can only be set when `protocol: "grpc"`.

| **Field**          | **Type**        | **Description**                                                                                                                                                  |
|--------------------|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `protocolVersion`  | `Enum` (`"v3"`) | Indicates the version of the transport protocol that the External Filter is using. This is only applicable to External Filters using `protocol: "grpc"`. Currently the only supported version is `"v3"`, so this field exists to provide compatability for future verions of ext_authz. |

### IncludeBody

**Appears On**: [ExternalFilter][]
Configures passing along the request body to the External Service. If not set then a blank body is sent over to the External Service.

| **Field**        | **Type**  | **Description**                                                                                                                                                  |
|------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `maxBytes`       | `int`     | Sets the number of bytes of the request body to buffer over to the External Service |
| `allowPartial`   | `bool`    | Indicates whether the included body can be a partially buffered body or if the complete buffered body is expected. If not partial then a 413 http error is returned by Envoy. |

## External Filter Usage Guides

- [Using External Filters][]: Use the External Filter to write your own service with custom processing and authentication logic
  - [The Ext_Authz Protocol][]: Learn about how the ext_authz protocol works

[Duration]: #duration
[HTTPSettings]: #httpsettings
[ExternalFilter]: #externalfilter
[GRPCSettings]: #grpcsettings
[IncludeBody]: #includebody
[usage guides section]: #external-filter-usage-guides
[ext_authz protocol]: ../../guides/custom-filters/ext-authz
[The Ext_Authz Protocol]: ../../guides/custom-filters/ext-authz
[FilterPolicy Resource]: ../filterpolicy
[Using External Filters]: ../../guides/custom-filters/external
[LinkerD]: https://linkerd.io/
[metav1.Duration]: https://pkg.go.dev/k8s.io/apimachinery/pkg/apis/meta/v1#Duration
[DeniedHttpResponse]: https://github.com/envoyproxy/envoy/blob/1230c6cfba3791e4544b4ca23cacdbfc20a6fbaa/api/envoy/service/auth/v3/external_auth.proto
[Go time.ParseDuration]: https://pkg.go.dev/time#ParseDuration
