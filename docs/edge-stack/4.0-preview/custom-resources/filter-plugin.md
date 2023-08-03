import Alert from '@material-ui/lab/Alert';

# The **Plugin Filter** Type

The Plugin filter type allows you to plug in your own custom code. This code is compiled into a .so file,
which you load into the Envoy Proxy container at `/etc/ambassador-plugins/${NAME}.so`. For more information about how requests are
matched to `Filter` resources and the order in which `Filters` are executed, please refer to the [FilterPolicy Resource][] documentation.

The [Plugin Filter usage guide][] contains a tutorial on developing and building plugin filters.

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

[Plugin Filter usage guide]: ../../guides/custom-filters/plugin
[FilterPolicy Resource]: ../filterpolicy
