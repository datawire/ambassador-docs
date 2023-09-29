import Alert from '@material-ui/lab/Alert';

# The **Plugin Filter** Type (v1alpha1)

The Plugin filter type allows you to plug in your own custom code. This code is compiled into a .so file,
which you load into the Envoy Proxy container at `/etc/ambassador-plugins/${NAME}.so`. For more information about how requests are
matched to `Filter` resources and the order in which `Filters` are executed, please refer to the [FilterPolicy Resource][] documentation.

<br />

This page is specific to the `gateway.getambassador.io/v1alpha1` version of the `Plugin Filter` resource. For the older `getambassador.io/v3alpha1` resource,
please see [the v3alpha1 Plugin Filter api reference][].

<Alert severity="info">
    <code>v1alpha1</code> <code>Filters</code> can only be referenced from <code>v1alpha1</code> <code>FilterPolicies</code>.
</Alert>

## Plugin Filter API Reference

To create a Plugin Filter, the `spec.type` must be set to `plugin`, and the `plugin` field must contain the configuration for your Plugin Filter.

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: Filter
metadata:
  name: "example-plugin-filter"
  namespace: "example-namespace"
spec:
  type: "plugin"                   # required
  plugin: PluginFilter             # required when `type: "plugin"`
    name: string                   # required
status:      []metav1.Condition    # field managed by controller, max items: 8
```

`name`: Indicates the compiled binaries name excluding the extension for the Plugin.
Envoy Proxy will look for the .so file in the `/etc/ambassador-plugins` directory.
For example, if `name: "example-plugin"` the .so file should be available at
`"/etc/ambassador-plugins/example-plugin.so"` on the Envoy Proxy container.

[FilterPolicy Resource]: ../filterpolicy
[the v3alpha1 Plugin Filter api reference]: ../../../getambassador/v3alpha1/filter-plugin
