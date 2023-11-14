
import Alert from '@material-ui/lab/Alert';

# The **Filter** Resource (v1alpha1)

The `Filter` custom resource works in conjunction with the [FilterPolicy custom resource][] to define how and when $productName$ will
modify or intercept incoming requests before sending them to your upstream Service. `Filters` define what actions to take on a request,
while `FilterPolicies` define the matching criteria for requests, such as the headers, hostname, and path, and supply references to
one or more `Filters` to execute against those requests. Filters are largely used to add built-in authentication and security, but
$productName$ also supports developing custom filters to add your own processing and logic.

<br />

This doc is an overview of all the fields on the `Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
This page is specific to the `gateway.getambassador.io/v1alpha1` version of the `Filter` resource. For the older `getambassador.io/v3alpha1` resource,
please see [the v3alpha1 Filter api reference][].

<Alert severity="info">
    <code>v1alpha1</code> <code>Filters</code> can only be referenced from <code>v1alpha1</code> <code>FilterPolicies</code>.
</Alert>


<Alert severity="info">
    Filtering actions of all types in $productName$ are only ever executed on incoming requests and not on responses from your upstream Services.
</Alert>

## Filter API Reference

Filtering is configured using `Filter` custom resources.  The body of the resource `spec` depends on the filter type:

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: Filter
metadata:
  name: "example-filter"
  namespace: "example-namespace"
spec:
  type:      Enum               # required
  jwt:       JWTFilter          # optional, required when `type: "jwt"`
  oauth2:    OAuth2Filter       # optional, required when `type: "oauth2"`
  apikey:    APIKeyFilter       # optional, required when `type: "apikey"`
  external:  ExternalFilter     # optional, required when `type: "external"`
  plugin:    PluginFilter       # optional, required when `type: "plugin"`
status:      []metav1.Condition # field managed by controller, max items: 8
```

### FilterSpec

| **Field**  | **Type**                                                     | **Description**                                                                       |
|------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `type`     | `Enum` (`"jwt"`/`"oauth2"`/`"apikey"`/`"external"`/`"plugin"`) | Required field that identifies the type of the Filter that is configured to be executed on a request. |
| `jwt`      | [JWTFilter][]                                                | Provides configuration for the JWT Filter type                   |
| `oauth2`   | [OAuth2Filter][]                                             | Provides configuration for the OAuth2 Filter type         |
| `apikey`   | [APIKeyFilter][]                                             | Provides configuration for the APIKey Filter type      |
| `external` | [ExternalFilter][]                                           | Provides configuration for the External Filter type  |
| `plugin`   | [PluginFilter][]                                             | Provides configuration for the Plugin Filter type  |

### FilterStatus

This field is set automatically by $productName$ to provide info about the status of the `Filter`.

| **Field**    | **Type**                 | **Description**                                                                                                   |
|--------------|--------------------------|-------------------------------------------------------------------------------------------------------------------|
| `conditions` | \[\][metav1.Condition][] | Describes the current conditions of the WebApplicationFirewall, known conditions are `Accepted`;`Ready`;`Rejected` |

<Alert severity="info">
  The short name for <code>Filter</code> is <code>fil</code>, so you can get filters using <code>kubectl get filter</code> or <code>kubectl get fil</code>.
</Alert>

[FilterPolicy custom resource]: ../filterpolicy
[JWTFilter]: ../filter-jwt
[PluginFilter]: ../filter-plugin
[OAuth2Filter]: ../filter-oauth2
[APIKeyFilter]:  ../filter-apikey
[ExternalFilter]: ../filter-external
[the v3alpha1 Filter api reference]: ../../../getambassador/v3alpha1/filter
[metav1.Condition]: https://pkg.go.dev/k8s.io/apimachinery/pkg/apis/meta/v1#Condition
