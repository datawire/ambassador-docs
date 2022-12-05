# Query parameter-based routing

$productName$ can route to target services based on HTTP query parameters with the `query_parameters` and `regex_query_parameters` specifications. Multiple mappings with different annotations can be applied to construct more complex routing rules.

## The `query_parameters` annotation

The `query_parameters` attribute is a dictionary of `query_parameter`: `value` pairs. $productName$ will only allow requests that match the specified `query_parameter`: `value` pairs to reach the target service.

You can also set the `value` of a query parameter to `true` to test for the existence of a query parameter.

### A basic example

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
  service: quote
  query_parameters:
    quote-mode: backend
    random-query-parameter: datawire
```

This will allow requests to /backend/ to succeed only if the `quote-mode` query parameter has the value `backend` and the `random-query-parameter` has the value `datawire`.

## `regex_query_parameters`

The following mapping will route requests with the `quote-mode` header that contain values that match the regex.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  regex_query_parameters:
    quote-mode: "^[a-z].*"
  prefix: /backend/
  service: quote
```

### A conditional example

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-mode
spec:
  prefix: /backend/
  service: quote-mode
  regex_query_parameters:
    quote-mode: .*
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-regular
spec:
  prefix: /backend/
  service: quote-regular
```

This will send requests that contain the `quote-mode` query parameter (with any value) to the `quote-mode` target, while routing all other requests to the `quote-regular` target.
