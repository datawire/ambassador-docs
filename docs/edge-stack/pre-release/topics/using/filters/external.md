# External Filter

The external Filter calls out to an external service speaking the [`ext_authz` protocol](../../../running/services/ext_authz), providing a highly flexible interface to plug in your own authentication, authorization, and filtering logic.

## Example

```yaml
---
apiVersion: getambassador.io/v2
kind: Filter
metadata:
  name: "my-filter"
  namespace: "my-namespace"
spec:
  External:
    auth_service: "example-auth:3000"
    tls: true
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

The External spec is mostly identical to an [AuthService spec](../../../running/services/auth-service), with the following exceptions:

* In an AuthService, the `tls` field may either be a Boolean, or a string referring to a `TLSContext`. In an `External` filter, it may only be a Boolean; referring to a TLS context is not supported.
* In an AuthService, the `add_linkerd_headers` field defaults based on the [`ambassador` `Module`](../../../running/ambassador). In an External filter, it defaults to `false`.

## Fields

`auth-service` is the only required field, all others are optional.

| Attribute | Default value | Description |
| --- | --- | --- |
|`auth_service` | n/a |  Identifies the external auth service to talk to.  Is of the format `protocol://host:port` where `protocol` and `port` are optional.  The protocol may be `http://` or `https://`, which influences the default value of `tls` and of the port.  If no protocol is given, it defaults to `http://`.
|`tls` | `true` if `auth_service` starts with "https://" | Whether to use TLS or cleartext when speaking to the external auth service.   |
|`proto` | `http` | Specifies which variant of the [`ext_authz` protocol](../ext_authz/) to use when communicating with the external auth service.  Valid options are `http` or `grpc`. |
|`timeout_ms` | `5000` | The total maximum duration in milliseconds for the request to the external auth service, before triggering `status_on_error` or `failure_mode_allow`.|
|`include_body` | `null` | Controls how much to buffer the request body to pass to the external auth service, for use cases such as computing an HMAC or request signature.  If `include_body` is `null` or unset, then the request body is not buffered at all, and an empty body is passed to the external auth service.  If `include_body` is not `null`, the `max_bytes` and `allow_partial` subfields are required.  `max_bytes` controls the amount of body data that will be passed to the external auth service. `allow_partial` controls what happens to requests with bodies larger than `max_bytes`. If `allow_partial` is `true`, the first `max_bytes` of the body are sent to the external auth service. If `false`, the message is rejected with HTTP 413 ("Payload Too Large"). Unfortunately, in order for `include_body` to function properly, the `AuthService` in [`aes.yaml`](/yaml/aes.yaml) must be edited to have `include_body` set with `max_bytes` greater than the largest `max_bytes` used by any `External` filter (so if an `External` filter has `max_bytes: 4096`, then the `AuthService` will need `max_bytes: 4097`), and `allow_partial: true`.|
|`status_on_error.code` | `403` | Controls the status code returned when unable to communicate with external auth service.  This is ignored if `failure_mode_allow: true`.|
|`failure_mode_allow` | `false` | Setting to `true` will allow the request through to the upstream backend service if there is an error communicating with the external auth service, instead of returning `status_on_error.code` to the client.|


The following fields are only used if `proto` is set to `http`. They are ignored if `proto` is `grpc`.

| Attribute | Default value | Description |
| --- | --- | --- |
|`path_prefix` | "" | Prepends a string to the request path of the request when sending it to the external auth service.  By default this is empty, and nothing is prepended.  For example, if the client makes a request to `/foo`, and `path_prefix: /bar`, then the path in the request made to the external auth service will be `/foo/bar`.|
|`allowed_request_headers` | [] |lists the headers that will be sent copied from the incoming request to the request made to the external auth service (case-insensitive). In addition to the headers listed in this field, the following headers are always included: `Authorization`, `Cookie`, `From`, `Proxy-Authorization`, `User-Agent`, `X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto`.
|`allowed_authorization_headers`| [] | Lists the headers that will be copied from the response from the external auth service to the request sent to the upstream backend service (if the external auth service indicates that the request to the upstream backend service should be allowed).  In addition to the headers listed in this field, the following headers are always included: `Authorization`, `Location`, `Proxy-Authenticate`, `Set-cookie`, `WWW-Authenticate`|
|`add_linkerd_headers` | `false` | When true, in the request to the external auth service, adds an `l5d-dst-override` HTTP header that is set to the hostname and port number of the external auth service. |


