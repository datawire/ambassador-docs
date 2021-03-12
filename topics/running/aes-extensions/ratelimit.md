# Ambassador Edge Stack Rate Limiting Extension

The Ambassador Edge Stack ships with a rate limiting service that is enabled
to perform advanced rate limiting out of the box.

Configuration of the `Mapping` and `RateLimit` resources that control **how**
to rate limit requests can be found in the
[Rate Limiting](../../using/rate-limits) section of the documentation.

This document focuses on how to deploy and manage the rate limiting extension.

## Ambassador Configuration

Ambassador uses the [`RateLimitService` plugin](../services/rate-limit-service) 
to connect to the rate limiting extension in the Ambassador Edge Stack.

The default `RateLimit` is named `ambassador-edge-stack-ratelimit` and is 
defined as:

```yaml
apiVersion: getambassador.io/v2
kind: AuthService
metadata:
  name: ambassador-edge-stack-ratelimit
  namespace: ambassador
spec:
  service: 127.0.0.1:8500
```

This configures Envoy to send requests that are labeled for rate limiting to the
extension process running on port 8500. The rate limiting extension will then
use that request to count against any `RateLimit` whose pattern matches the
request labels.

## Authentication Extension Configuration

Certain use cases may require some tuning of the rate limiting extension. 
Configuration of this extension is managed via environment variables.
[The Ambassador Container](../environment) has a full list of environment
variables available for configuration. This document highlights the ones used
by the rate limiting extension.

#### Redis

The rate limiting extension relies heavily on redis for writing and reading
counters for the different `RateLimit` patterns.

The Ambassador Edge Stack shares the same Redis pool for all features that use
Redis.

See the [Redis documentation](../aes-redis) for information on Redis tuning.

#### `AES_RATELIMIT_PREVIEW`

Set `AES_RATELIMIT_PREVIEW` to `true` to access support for redis clustering, 
local caching, and an upgraded redis client with improved scalability in 
preview mode.