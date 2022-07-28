# Protecting Access to the Diagnostics Interface

Out of the box, $productName$ enables `Mapping`s to provide access to the diagnostics
interfaces that can help you debug your installation. In a production environment, though,
public access to these endpoints is not an ideal situation.  To solve this, we will be
using the Ambassador `Module` to remove the default mappings, after which we'll create a
new, host-based `mapping` to expose the diagnostics interface more securely.  The
Ambassador `Module` applies system-wide configuration settings for $productName$ to follow.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
spec:
  config:
    diagnostics:
      enabled: false
```

After applying this module, the diagnostics interface are no longer accessible from
the outside world. We should not, however, exclude actual administrators from using
these interfaces, so to create a more managed endpoint for them to use, create a
`Mapping` to expose the endpoint:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: diag-mapping
spec:
  host: diag.example.com
  prefix: /diag/
  rewrite: /diag/
  service: localhost:8777
```

Now, administrators can connect to the diagnostic interface using the `diag.example.com`
hostname, and the [`Mapping`](../../topics/using/intro-mappings) settings can
be appropriately configured to better control access to these services.  To learn more
about Ambassador `Module` configurations, see [Ambassador `Module`](../../topics/running/ambassador).
