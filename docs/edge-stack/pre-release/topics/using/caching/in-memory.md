# In-Memory Cache Provider

The In-Memory Cache provides a simple way to do HTTP caching by allowing Ambassador Edge Stack to cache responses for directly serving back to the downstream client. This cache can be used for scenarios where you want to reduce the upstream load for heavy computation or if the upstream cluster has latency challenges.

For requests:

- Respects request’s `cache-control` directive
- Does not store HTTP `HEAD` requests

For Upstream responses:
- only caches responses based on [RFC7234](https://httpwg.org/specs/rfc7234.html#calculating.freshness.lifetime)
- only caches the following response codes: `200`, `203`, `204`, `206`, `300`, `301`, `308`, `404`, `405`, `410`, `414`, `451`, `501`
  
## Provider config

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Cache
metadata:
  name:      "string"      # required; this is how to refer to the Cache in a CachePolicy
  namespace: "string"      # optional; default is the usual `kubectl apply` default namespace
spec:
  cacheProvider: "in-memory" # required 
  config: {}
```
