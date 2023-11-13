
import Alert from '@material-ui/lab/Alert';

# The **Filter** Resource (v3alpha1)

The `Filter` custom resource works in conjunction with the [FilterPolicy custom resource][] to define how and when $productName$ will
modify or intercept incoming requests before sending them to your upstream Service. `Filters` define what actions to take on a request,
while `FilterPolicies` define the matching criteria for requests, such as the headers, hostname, and path, and supply references to
one or more `Filters` to execute against those requests. Filters are largely used to add built-in authentication and security, but
$productName$ also supports developing custom filters to add your own processing and logic.

This doc is an overview of all the fields on the `Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
This page is specific to the `getambassador.io/v3alpha1` version of the `Filter` resource. For the newer `gateway.getambassador.io/v1alpha1` resource,
please see [the v1alpha1 Filter api reference][].

<Alert severity="info">
    Filtering actions of all types in $productName$ are only ever executed on incoming requests and not on responses from your upstream Services.
</Alert>

<Alert severity="info">
    <code>v3alpha1</code> <code>Filters</code> can only be referenced from <code>v3alpha1</code> <code>FilterPolicies</code>.
</Alert>

## v3alpha1 Filter API Reference

Filtering is configured using `Filter` custom resources.  The body of the resource `spec` depends on the filter type:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: "example-filter"
  namespace: "example-namespace"
spec:
  ambassador_id: []string           # optional
  JWT:           JWTFilter          # optional
  OAuth2:        OAuth2Filter       # optional
  APIKey:        APIKeyFilter       # optional
  External:      ExternalFilter     # optional
  plugin:        PluginFilter       # optional
```

### FilterSpec

Other than `ambassador_id`, only one of the following fields may be configured. For example you cannot create a `Filter` with both
`JWT` and `External`.

| **Field**        | **Type**                                                     | **Description**                                                                       |
|------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `ambassador_id`  | \[\]`string`                 | Ambassador id accepts a list of strings that allow you to restrict which instances of $productName$ can use/view this resource. If `ambassador_id` is configured, then only Deployments of $productName$ with a matching `AMBASSADOR_ID` environment variable will be able to use this resource. |
| `JWT`            | [JWTFilter][]                                                | Provides configuration for the JWT Filter type                   |
| `OAuth2`         | [OAuth2Filter][]                                             | Provides configuration for the OAuth2 Filter type         |
| `APIKey`         | [APIKeyFilter][]                                             | Provides configuration for the APIKey Filter type      |
| `External`       | [ExternalFilter][]                                           | Provides configuration for the External Filter type  |
| `Plugin`         | [PluginFilter][]                                             | Provides configuration for the Plugin Filter type  |

[FilterPolicy custom resource]: ../filterpolicy
[JWTFilter]: ../filter-jwt
[PluginFilter]: ../filter-plugin
[OAuth2Filter]: ../filter-oauth2
[APIKeyFilter]:  ../filter-apikey
[ExternalFilter]: ../filter-external
[the v1alpha1 Filter api reference]: ../../../gateway-getambassador/v1alpha1/filter
