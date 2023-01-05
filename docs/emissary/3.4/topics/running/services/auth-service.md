import Alert from '@material-ui/lab/Alert';

# Authentication service

$productName$ provides a highly flexible mechanism for authentication,
via the `AuthService` resource.  An `AuthService` configures
$productName$ to use an external service to check authentication and
authorization for incoming requests.  Each incoming request is
authenticated before routing to its destination.

All requests are validated by the `AuthService` (unless the `Mapping`
applied to the request sets `bypass_auth`).  It is not possible to
combine multiple `AuthServices`.  While it is possible to create
multiple `AuthService` resources, $productName$ load-balances between
them in a round-robin fashion.  This is useful for canarying an
`AuthService` change, but is not useful for deploying multiple
distinct `AuthServices`.  In order to combine multiple external
services (either having multiple services apply to the same request,
or selecting between different services for the different requests),
instead of using an `AuthService`, use an [$AESproductName$ `External`
`Filter`](/docs/edge-stack/latest/topics/using/filters/).

<Alert severity="info">

Because of the limitations described above, **$AESproductName$ does
not support `AuthService` resources, and you should instead use an
[`External`
`Filter`](/docs/edge-stack/latest/topics/using/filters/external),**
which is mostly a drop-in replacement for an `AuthService`.  The
`External` `Filter` relies on the $AESproductName$ `AuthService`.
Make sure the $AESproductName$ `AuthService` is deployed before
configuring `External` `Filters`.

</Alert>

The currently supported version of the `AuthService` resource is
`getambassador.io/v3alpha1`.  Earlier versions are deprecated.

## Example

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: AuthService
metadata:
  name: authentication
spec:
  ambassador_id: [ "ambassador-1" ]
  auth_service: "example-auth.authentication:3000"
  tls: true
  proto: http
  timeout_ms: 5000
  include_body:
    max_bytes: 4096
    allow_partial: true
  status_on_error:
    code: 403
  failure_mode_allow: false

  # proto: grpc only, default is v2. If upgrading from 2.x then you must set this to v3.
  protocol_version: v3

  # proto: http only
  path_prefix: "/path"
  allowed_request_headers:
  - "x-example-header"
  allowed_authorization_headers:
  - "x-qotm-session"
  add_auth_headers:
    x-added-auth: auth-added
  add_linkerd_headers: false
```

## Fields

`auth_service` is the only required field, all others are optional.

| Attribute                    | Default value                                                                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ambassador_id`              | `[ "default" ]`                                                                     | Which [Ambassador ID](../../running/#ambassador_id) the `AuthService` should apply to.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `auth_service`               | (none; a value is required)                                                         | Identifies the external auth service to talk to.  The format of this field is `scheme://host:port` where `scheme://` and `:port` are optional.  The scheme-part, if present, must be either `http://` or `https://`; if the scheme-part is not present, it behaves as if `http://` is given.  The scheme-part controls whether TLS or plaintext is used and influences the default value of the port-part.  The host-part must be the [namespace-qualified DNS name](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services) of the service you want to use for authentication. |
| `tls`                        | `""`                                                                                | This field is populated with the name of the defined TLSContext, which determines the TLS certificate presented to external auth services.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `proto`                      | `http`                                                                              | Specifies which variant of the [`ext_authz` protocol](../ext-authz/) to use when communicating with the external auth service.  Valid options are `http` or `grpc`.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `timeout_ms`                 | `5000`                                                                              | The total maximum duration in milliseconds for the request to the external auth service, before triggering `status_on_error` or `failure_mode_allow`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `include_body`               | `null`                                                                              | Controls how much to buffer the request body to pass to the external auth service, for use cases such as computing an HMAC or request signature.  If `include_body` is `null` or unset, then the request body is not buffered at all, and an empty body is passed to the external auth service.  If `include_body` is not `null`, the `max_bytes` and `allow_partial` subfields are required.                                                                                                                                                                                                                            |
| `include_body.max_bytes`     | (none; a value is required if `include_body` is not `null`)                         | Controls the amount of body data that is passed to the external auth service.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `include_body.allow_partial` | (none; a value is required if `include_body` is not `null`)                         | Controls what happens to requests with bodies larger than `max_bytes`.  If `allow_partial` is `true`, the first `max_bytes` of the body are sent to the external auth service.  If `false`, the message is rejected with HTTP 413 ("Payload Too Large").                                                                                                                                                                                                                                                                                                                                                                 |
| `status_on_error.code`       | `403`                                                                               | Controls the status code returned when unable to communicate with external auth service.  This is ignored if `failure_mode_allow: true`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `failure_mode_allow`         | `false`                                                                             | Controls whether to allow or reject requests when there is an error communicating with the external auth service; a value of `true` allows the request through to the upstream backend service, a value of `false` returns a `status_on_error.code` response to the client.                                                                                                                                                                                                                                                                                                                                              |
| `stats_name`                 | the `auth_service` value with non-alphanumeric characters replaced with underscores | See [Overriding Statistics Names](../../statistics/#overriding-statistics-names).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `circuit_breakers`           | the value set in the [`ambassador` `Module`](../../../using/defaults)               | See [Circuit Breakers](../../../using/circuit-breakers/).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

The following field is only used if `proto` is set to `grpc`.  It is
ignored if `proto` is `http`.

| Attribute          | Default value | Description                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protocol_version` | `v3`          | Allowed values are `v3` and `v2`(defualt). `protocol_version` was used in previous versions of $productName$ to control the protocol used by the gRPC service. $productName$ 3.x is running an updated version of Envoy that has dropped support for the `v2` protocol, so starting in 3.x, if `protocol_version` is not specified, the default  value of `v2` will cause an error to be posted and a static response will be returned. Therefore, you must set it to `protocol_version: v3`. If upgrading from a previous version, you will want  to set it to `v3` and ensure it is working before upgrading to Emissary-ingress 3.Y. The default value for `protocol_version` remains `v2` in the `getambassador.io/v3alpha1` CRD specifications to avoid making breaking changes outside of a CRD version change. Future versions of CRD's will deprecate it. |

The following fields are only used if `proto` is set to `http`.  They
are ignored if `proto` is `grpc`.

| Attribute                       | Default value                                                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path_prefix`                   | `""`                                                                       | Prepends a string to the request path of the request when sending it to the external auth service.  By default this is empty, and nothing is prepended.  For example, if the client makes a request to `/foo`, and `path_prefix: /bar`, then the path in the request made to the external auth service will be `/foo/bar`.                                                                                                                              |
| `allowed_request_headers`       | `[]`                                                                       | Lists the headers (case-insensitive) that are copied from the incoming request to the request made to the external auth service.  In addition to the headers listed in this field, the following headers are always included: `Authorization`, `Cookie`, `From`, `Proxy-Authorization`, `User-Agent`, `X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto`.                                                                                   |
| `allowed_authorization_headers` | `[]`                                                                       | Lists the headers (case-insensitive) that are copied from the response from the external auth service to the request sent to the upstream backend service (if the external auth service indicates that the request to the upstream backend service should be allowed).  In addition to the headers listed in this field, the following headers are always included: `Authorization`, `Location`, `Proxy-Authenticate`, `Set-cookie`, `WWW-Authenticate` |
| `add_auth_headers`              | `{}`                                                                       | A dictionary of `header: value` pairs that are added to the request made to the external auth service.                                                                                                                                                                                                                                                                                                                                                  |
| `add_linkerd_headers`           | Defaults to the value set in the [`ambassador` `Module`](../../ambassador) | When true, in the request to the external auth service, adds an `l5d-dst-override` HTTP header that is set to the hostname and port number of the external auth service.                                                                                                                                                                                                                                                                                |

## Canarying multiple `AuthServices`

You may create multiple `AuthService` manifests to round-robin
authentication requests among multiple services.  **All services must
use the same `path_prefix` and header definitions.** If you try to
have different values, you'll see an error in the [diagnostics
service](../../ambassador/#diagnostics), telling you which value is
being used.

## Configuring public `Mappings`

An `AuthService` can be disabled for a `Mapping` by setting
`bypass_auth` to `true`.  This will tell $productName$ to allow all
requests for that `Mapping` through without interacting with the
external auth service.



## Transport Protocol Migration


> **Note:** The following information is only applicable to `AuthServices` using `proto: grpc`
As of $productName$ version 2.3, the `v2` transport protocol is deprecated and any AuthServices making use
of it should migrate to `v3` before support for `v2` is removed in a future release.

The following imports simply need to be updated to migrate an AuthService

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
