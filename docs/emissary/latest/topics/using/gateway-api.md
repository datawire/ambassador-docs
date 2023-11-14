# Gateway API

## Using the Gateway API

$productName$ now supports a limited subset of the new `v1alpha1` [Gateway API](https://gateway-api.sigs.k8s.io/).
Note that the Gateway API is not supported when `AMBASSADOR_LEGACY_MODE` is set.

Support is currently limited to the following fields, however this will expand in future releases:

  - `Gateway.spec.listeners.port`
  - `HTTPRoute.spec.rules.matches.path.type` (`Exact`, `Prefix`, and `RegularExpression`)
  - `HTTPRoute.spec.rules.matches.path.value`
  - `HTTPRoute.spec.rules.matches.header.type` (`Exact` and `RegularExpression`)
  - `HTTPRoute.spec.rules.matches.header.values`
  - `HTTPRoute.spec.rules.forwardTo.serviceName`
  - `HTTPRoute.spec.rules.forwardTo.port`
  - `HTTPRoute.spec.rules.forwardTo.weight`

Please see the [specification](https://gateway-api.sigs.k8s.io/reference/spec/) for more details.
