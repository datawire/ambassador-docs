# Controlling the Edge Stack 404 Page

Established users will want to better control 404 behavior both for usability and
security. You can leverage the `Mapping` resource to implement this
functionality to your cluster. $productName$ users can use a 'catch-all' mapping
using the `/` prefix in a `Mapping` configuration.  The simplest `Mapping`, described
below, returns only 404 text. To use a custom 404 landing page, simply insert your
service and remove the rewrite value.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: "404-fallback"
spec:
  hostname: "*"
  prefix: "/"
  rewrite: "/404/"         # This must not map to any existing prefix!
  service: localhost:8500  # This needs to exist, but _not_ respond on /404/
```

For more information on the `Mapping` resource, see
[Advanced `Mapping` Configuration](../../topics/using/mappings).
