# Load balancing

Load balancing configuration can be set for all $productName$ mappings in the [`ambassador Module`](../ambassador), or set per [`Mapping`](../../using/mappings). If nothing is set, simple round robin balancing is used via Kubernetes services.

To use advanced load balancing, you must first configure a [resolver](../resolvers) that supports advanced load balancing (e.g., the Kubernetes Endpoint Resolver or Consul Resolver). Once a resolver is configured, you can use the `load_balancer` attribute. The following fields are supported:

```yaml
load_balancer:
  policy: <load balancing policy to use>
```

Supported load balancer policies:

- `round_robin`
- `least_request`
- `ring_hash`
- `maglev`

For more information on the different policies and the implications, see [load balancing strategies in Kubernetes](https://blog.getambassador.io/load-balancing-strategies-in-kubernetes-l4-round-robin-l7-round-robin-ring-hash-and-more-6a5b81595d6c).

## Round robin
When `policy` is set to `round_robin`, $productName$ discovers healthy endpoints for the given mapping, and load balances the incoming L7 requests with round robin scheduling. To specify this:

```yaml
apiVersion: getambassador.io/v2
kind:  Module
metadata:
  name:  ambassador
spec:
  config:
    resolver: my-resolver
    load_balancer:
      policy: round_robin
```

or, per mapping:

```yaml
---
apiVersion: getambassador.io/v2
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
  service: quote
  resolver: my-resolver
  load_balancer:
    policy: round_robin
```

Note that load balancing may not appear to be "even" due to Envoy's threading model. For more details, see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/latest/faq/load_balancing/concurrency_lb).

## Least request

When `policy` is set to `least_request`, $productName$ discovers healthy endpoints for the given mapping, and load balances the incoming L7 requests to the endpoint with the fewest active requests. To specify this:

```yaml
apiVersion: getambassador.io/v2
kind:  Module
metadata:
  name:  ambassador
spec:
  config:
    resolver: my-resolver
    load_balancer:
      policy: least_request
```

or, per mapping:

```yaml
---
apiVersion: getambassador.io/v2
kind:  Mapping
metadata:
  name:  quote-backend/
spec:
  prefix: /backend/
  service: quote
  resolver: my-resolver
  load_balancer:
    policy: least_request
```

## Sticky sessions / session affinity

Configuring sticky sessions makes $productName$ route requests to a specific pod providing your service in a given session. One pod serves all requests from a given session, eliminating the need for session data to be transferred between pods. $productName$ lets you configure session affinity based on the following parameters in an incoming request:

- Cookie
- Header
- Source IP

**NOTE:** $productName$ supports sticky sessions using two load balancing policies, `ring_hash` and `maglev`.

### Cookie

```yaml
load_balancer:
  policy: ring_hash
  cookie:
    name: <name of the cookie, required>
    ttl: <TTL to set in the generated cookie>
    path: <name of the path for the cookie>
```

If the cookie you wish to set affinity on is already present in incoming requests, then you only need the `cookie.name` field. However, if you want $productName$ to generate and set a cookie in response to the first request, then you need to specify a value for the `cookie.ttl` field which generates a cookie with the given expiration time.

```yaml
apiVersion: getambassador.io/v2
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
service: quote
resolver: my-resolver
load_balancer:
  policy: ring_hash
  cookie:
    name: sticky-cookie
    ttl: 60s
```

### Header

```yaml
load_balancer:
  policy: ring_hash
  header: <header name>
```

$productName$ allows header based session affinity if the given header is present on incoming requests.

Example:

```yaml
apiVersion: getambassador.io/v2
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
  service: quote
  resolver: my-resolver
  load_balancer:
    policy: ring_hash
    header: STICKY_HEADER
```

#### Source IP

```yaml
load_balancer:
  policy: ring_hash
  source_ip: <boolean>
```

$productName$ allows session affinity based on the source IP of incoming requests.

```yaml
apiVersion: getambassador.io/v2
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
  service: quote
  resolver: my-resolver
  load_balancer:
    policy: ring_hash
    source_ip: true
```

Load balancing can be configured both globally, and overridden on a per mapping basis. The following example configures the default load balancing policy to be round robin, while using header-based session affinity for requests to the `/backend/` endpoint of the quote application:

Load balancing can be configured both globally, and overridden on a per mapping basis.

```yaml
apiVersion: getambassador.io/v2
kind:  Module
metadata:
  name:  ambassador
spec:
  config:
    resolver: my-resolver
    load_balancer:
      policy: round_robin
```

```yaml
apiVersion: getambassador.io/v2
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
  service: quote
  resolver: my-resolver
  load_balancer:
    policy: ring_hash
    header: STICKY_HEADER
```
