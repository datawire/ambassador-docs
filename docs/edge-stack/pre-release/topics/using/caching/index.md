import Alert from '@material-ui/lab/Alert';

# Caching - Cache and CachePolicy

HTTP caching provides a mechanism to improve performance of applications by taking advantage of the fact that some responses do no change very often. Browsers and CDN's take advantage of this fact and are able to keep copies of HTTP Responses in a cache so that they can be served quickly to reduce the impact of network latency and/or heavy server computation.

Ambassador Edge Stack impowers the Developer to define their own caching strategy for their services using the `Cache` and `CachePolicy` custom resources. The `Cache` resource indicates the specific cache provider and provider specific configuration that will be used when caching response. The `CachePolicy` resource specifies a particular host and path to match, along with the ability for the developer to intercept the request to inject `cache-control` semantics to enable caching.

## Cache Providers

Edge Stack supports the following cache providers:

* [InMemory](in-memory) - stores responses in-memory reduce computation on backend services

## Managing Caching

Cache's are created with the Cache resource type, which contains global arguments for the cache provider. Which Cache is applied for which HTTP requests is then configured in CachePolicy resources.

### Cache definition

A Cache resources allows you to configure a cache provider. The body of the resource spec depends on the cache provider type:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Cache
metadata:
  name:      "string"      # required; this is how to refer to the Cache in a CachePolicy
  namespace: "string"      # optional; default is the usual `kubectl apply` default namespace
spec:
  ambassadorId:           # optional; default is ["default"]
  - "string"
  ambassadorId: "string"  # no need for a list if there's only one value
  cacheProvider: "enum: 'in-memory'" # required 
  config: {}              # provider specific configuration
```

### CachePolicy definition

CachePolicy resource specifies which Cache to apply to which host and service.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: CachePolicy
metadata:
  name:      "string"       # required
  namespace: "string"      # optional; default is the usual `kubectl apply` default namespace
spec:
  rules:
    - host: "glob-string" # required;
      path: "glob-string" # required;
      cacheProviderRef:
        name: "string" # required; will look for Cache in same
      cacheControl: "enum: no-cache | private | max-age=60 | inherit" #optional: inject cache semantics before sending to upstream cluster
```

Rule configuration values include:

| Value               | Example               | Description                                                                 |
| ------------------- | --------------------- | --------------------------------------------------------------------------- |
| `host`              | `*`, `foo.com`        | The Host that a given cache rule should match                               |
| `path`              | `/foo/url/`           | The URL path that a given cache rule should match to                        |
| `cacheProviderRef`: | `name: default-cache` | The name of a given Cache to be applied                                     |
| `cacheControl`:     | `no-cache`            | The value of the `cache-control` header to inject into the upstream request |

The wildcard `*` is supported for both `path` and `host`.

#### FilterPolicy example

In the example below, the `my-cache-engine` Cache is an In-Memory Cache that will be applied to all hosts and ru on  `/httpbin/ip`, `/httpbin/user-profile`. If the incoming request does not include a `cache-control` header then the `cacheControl` field will inject it into the request
prior to sending it to the upstream service.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Cache
metadata:
  name: my-cache-engine
  namespace: default
spec:
  cacheProvider: in-memory
  config: {}
---
apiVersion: getambassador.io/v3alpha1
kind: CachePolicy
metadata:
  name: httpbin-policy
  namespace: default
spec:
  rules:
    - host: "*"
      path: "/httpbin/ip"
      cacheRef: 
        name: "my-cache-engine"
      cacheControl: "max-age=60"
    - host: "*"
      path: "/httpbin/user-profile"
      cacheRef: 
        name: "my-cache-engine"
      cacheControl: "no-cache"
```

<Alert severity="info">
  Edge Stack will choose the first CachePolicy rule that matches the incoming request. As in the above example, you must list your rules in the order of least to most generic.
</Alert>
