# Ambassador Edge Stack Authentication Extension

The Ambassador Edge Stack ships with an authentication service that is enabled
to perform OAuth, JWT validation, and custom authentication schemes. It can
perform different authentication schemes on different requests allowing you to
enforce authentication as your application needs.

Configuration of the `Filter` and `FilterPolicy`  resources that control **how**
to do authentication can be found in the 
[Filters and Authentication](../../using/filters) section of the documentation.

This document focuses on how to deploy and manage the authentication extension.

## Ambassador Configuration

Ambassador uses the [`AuthService` plugin](../services/auth-service) 
to connect to the authentication extension in the Ambassador Edge Stack.

The default `AuthService` is named `ambassador-edge-stack-auth` and is defined 
as:

```yaml
apiVersion: getambassador.io/v2
kind: AuthService
metadata:
  name: ambassador-edge-stack-ratelimit
  namespace: ambassador
spec:
  auth_service: 127.0.0.1:8500
  proto: grpc
  status_on_error:
    code: 503
  allow_request_body: false
```

This configures Envoy to talk to the extension process running on port 8500
using gRPC and trim the body from the request when doing so. The default error
code fo 503 is usually overwritten by the `Filter` that is authenticating the 
request.

This default `AuthService` works for most use cases. If you find the need to
tune how Ambassador connects to the authentication extension (like changing the
default timeout), you can find the full configuration options in the 
[`AuthService` plugin](../services/auth-service) documentation.

## Authentication Extension Configuration

Certain use cases may require some tuning of the authentication extension. 
Configuration of this extension is managed via environment variables.
[The Ambassador Container](../environment) has a full list of environment
variables available for configuration. This document highlights the ones used
by the authentication extension.

#### Redis

The authentication extensions uses Redis for caching the response from the 
`token endpoint` when performing OAuth.

The Ambassador Edge Stack shares the same Redis pool for all features that use
Redis.

See the [Redis documentation](../aes-redis) for information on Redis tuning.

#### `AES_AUTH_TIMEOUT`

The `AES_AUTH_TIMEOUT` environment variable configures the default timeout in
the authentication extension.

This timeout is necessary so that any error responses configured by `Filter`s 
that the extension runs make their way to the client and are not overwritten by
the timeout from Envoy if a request takes longer than 5s.

If you have a long chain of `Filter`s or a `Filter` that takes > 4s to respond,
you can increase the timeout value by setting this to a duration that gives your
`Filter`s enough time to run.

> A couple of considerations when changing `AES_AUTH_TIMEOUT`

> The `timeout_ms` of the `ambassador-edge-stack-auth` `AuthService` defaults
> to `5000` (5s). You will need to adjust this as well.

> `AES_AUTH_TIMEOUT` should always be ~1s shorter than the `timeout_ms` of
> the `ambassador-edge-stack-auth` `AuthService` to ensure `Filter` error
> responses make it to the client.

> The `External` `Filter` also have a `timeout_ms` field that must be set if
> a single `Filter` will take longer than 5s.