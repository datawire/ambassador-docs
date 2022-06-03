# Log service

By default, $productName$ puts the access logs on stdout; such
that the can be read using `kubectl logs`.  The format of those logs,
and the local destination of them, can be configured using the
[`envoy_log_` settings in the `ambassador
Module`](../../ambassador).  However, the
options there only allow for logging local to $productName$'s Pod.  By
configuring a `LogService`, you can configure $productName$ to
report its access logs to a remote service, in addition to the usual
`ambassador Module` configured logging.

The remote access log service (or ALS) must implement the
`AccessLogService` gRPC interface, defined in [Envoy's `als.proto`][als.proto].

[als.proto]: https://github.com/emissary-ingress/emissary/blob/master/api/envoy/service/accesslog/v2/als.proto

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: LogService
metadata:
  name: example-log-service
spec:
  # Common to all $productName$ resources
  ambassador_id: []string           # optional; default is ["default"]

  # LogService specific
  service: "string"                 # required
  driver: "enum-string:[tcp, http]" # required
  driver_config:                    # required
    additional_log_headers:           # optional; default is [] (only for `driver: http`)
    - header_name: string               # required
      during_request: boolean           # optional; default is true
      during_response: boolean          # optional; default is true
      during_trailer: boolean           # optional; default is true
  flush_interval_time: int-seconds  # optional; default is 1
  flush_interval_byte_size: integer # optional; default is 16384
  grpc: boolean                     # optional; default is false
  protocol_version: enum            # optional; default is v2
```

 - `service` is where to route the access log gRPC requests to

 - `driver` identifies which type of accesses to log; HTTP requests (`"http"`) or
   TLS connections (`"tcp"`).

 - `driver_config` stores the configuration that is specific to the `driver`:

    * `driver: tcp` has no additional configuration; the config must
      be set as `driver_config: {}`.

    * `driver: http`

       - `additional_log_headers` identifies HTTP headers to include in
         the access log, and when in the logged-request's lifecycle to
         include them.

 - `flush_interval_time` is the maximum number of seconds to buffer
   accesses for before sending them to the ALS.  The logs will be
   flushed to the ALS every time this duration is reached, or when the
   buffered data reaches `flush_interval_byte_size`, whichever comes
   first.  See the [Envoy documentation on
   `buffer_flush_interval`][buffer_flush_interval] for more
   information.

 - `flush_interval_byte_size` is a soft size limit for the access log
   buffer.  The logs will be flushed to the ALS every time the
   buffered data reaches this size, or whenever `flush_interval_time`
   elapses, whichever comes first.  See the [Envoy documentation on
   `buffer_size_bytes`][buffer_size_bytes] for more information.

 - `grpc` must be `true`.

[buffer_flush_interval]: https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/access_loggers/grpc/v3/als.proto.html#extensions-access-loggers-grpc-v3-commongrpcaccesslogconfig
[buffer_size_bytes]: https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/access_loggers/grpc/v3/als.proto.html#extensions-access-loggers-grpc-v3-commongrpcaccesslogconfig

 - `protocol_version` Controls the gRPC service name used to communicate with the `LogService`.  Allowed values are `v2`, which uses the `envoy.service.auth.v2.Authorization` service name; and `v3`, which uses the `envoy.service.auth.v3.Authorization` service name.  `v3` cannot be used with [the `AMBASSADOR_ENVOY_API_VERSION=V2` environment variable](../../running/#ambassador_envoy_api_version).

## Example

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: LogService
metadata:
  name: als
spec:
  service: "als.default:3000"
  driver: http
  driver_config: {}  # NB: driver_config must be set, even if it's empty
  grpc: true         # NB: grpc must be true
```

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
