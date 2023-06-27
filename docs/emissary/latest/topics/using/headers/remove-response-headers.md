# Remove response headers

$productName$ can remove a list of HTTP headers that would be sent to the client in the response (e.g. default `x-envoy-upstream-service-time`).

## The `remove_response_headers` attribute

The `remove_response_headers` attribute takes a list of keys used to match to the header.

`remove_request_headers` can be set either in a `Mapping` or using [`ambassador Module defaults`](../../defaults).

## Mapping example

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
  remove_response_headers:
  - x-envoy-upstream-service-time
  service: quote
```

will drop the header with key `x-envoy-upstream-service-time`.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
spec:
  config:
    defaults:
      httpmapping:
        remove_response_headers:
        - x-envoy-upstream-service-time
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-backend1
spec:
  prefix: /backend1/
  service: quote
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-backend2
spec:
  prefix: /backend2/
  service: quote
```

This is the same as the mapping example, but the headers will be removed for both mappings.
