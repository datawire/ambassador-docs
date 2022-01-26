import Alert from '@material-ui/lab/Alert';

# Authentication extension

$productName$ ships with an authentication service that is enabled
to perform OAuth, JWT validation, and custom authentication schemes. It can
perform different authentication schemes on different requests allowing you to
enforce authentication as your application needs.

The Filter and FilterPolicy resources are used to [configure how to do authentication](../../../using/filters).  This doc focuses on how to deploy and manage the authentication extension.

## $productName$ configuration

$productName$ uses the [AuthService plugin](../../services/auth-service)
to connect to the authentication extension.

The default AuthService is named `ambassador-edge-stack-auth` and is defined
as:

```yaml
apiVersion: getambassador.io/v2
kind: AuthService
metadata:
  name: ambassador-edge-stack-auth
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
code of 503 is usually overwritten by the Filter that is authenticating the
request.

This default AuthService works for most use cases. If you need to
tune how $productName$ connects to the authentication extension (like changing the
default timeout), you can find the full configuration options in the
[AuthService plugin docs](../../services/auth-service).

## Authentication extension configuration

Certain use cases may require some tuning of the authentication extension.
Configuration of this extension is managed via environment variables.
[The $productName$ container environment](../../environment) has a full list of environment
variables available for configuration, including the variables used by the
authentication extension.

#### Redis

The authentication extension uses Redis for caching the response from the
`token endpoint` when performing OAuth.

$productName$ shares the same Redis pool for all features that use Redis.  More information is available for [tuning Redis](../../aes-redis) if needed.

#### Timeout variables

The `AES_AUTH_TIMEOUT` environment variable configures the default timeout in
the authentication extension.

This timeout is necessary so that any error responses configured by Filters
that the extension runs make their way to the client.  Otherwise they would be
overruled by the timeout from Envoy if a request takes longer than five seconds.

If you have a long chain of Filters or a Filter that takes five or more seconds to respond,
you can increase the timeout value to give your Filters enough time to run.

<Alert severity="warning">
The <code>timeout_ms</code> of the <code>ambassador-edge-stack-auth</code> AuthService defaults
to a value of 5000 (five seconds). You will need to adjust this as well.
<div style="margin: 10px 0 10px 0;"></div>
<code>AES_AUTH_TIMEOUT</code> should always be around one second shorter than the <code>timeout_ms</code> of the AuthService to ensure Filter error responses make it to the client.
<div style="margin: 10px 0 10px 0;"></div>
The External Filter also have a <code>timeout_ms</code> field that must be set if a single Filter will take longer than five seconds.
</Alert>
