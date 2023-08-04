
import Alert from '@material-ui/lab/Alert';

# The **Filter** Resource

The `Filter` custom resource works in conjunction with the [FilterPolicy custom resource][] to define how and when $productName$ will
modify or intercept incoming requests before sending them to your upstream Service. `Filters` define what actions to take on a request,
while `FilterPolicies` define the matching criteria for requests, such as the headers, hostname, and path, and supply references to
one or more `Filters` to execute against those requests. Filters are largely used to add built-in authentication and security, but
$productName$ also supports developing custom filters to add your own processing and logic.

This doc is an overview of all the fields on the `Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
Tutorials and guides for the `Filter` Resource can be found in the [usage guides section][]

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

## Filter Usage Guides

The following guides will help you get started using the different types of `Filters`

- [Using JWT Filters][]: Use the JWT Filter to validate and process JWTs on requests
- [Using Oauth2 Filters][]: Use the OAuth2 Filter for authentication to protect access to services
  - [Oauth2 design in $productName$][]: Learn about how the OAuth2 system works
  - [SSO with Auth0][]: Setup single sign-on with Auth0
  - [SSO with Azure][]: Setup single sign-on with Azure
  - [SSO with Google][]: Setup single sign-on with Google
  - [SSO with Keycloak][]: Setup single sign-on with Keycloak
  - [SSO with Okta][]: Setup single sign-on with Okta
  - [SSO with OneLogin][]: Setup single sign-on with OneLogin
  - [SSO with Salesforce][]: Setup single sign-on with Salesforce
  - [SSO with UAA][]: Setup single sign-on with UAA
- [Using APIKey Filters][]: Use the APIKey Filter to validate API Keys present in the HTTP header
- [Using External Filters][]: Use the External Filter to write your own service with custom processing and authentication logic
- [Using Plugin Filters][] - Compile your own custom filtering plugin on top of $productName$

[usage guides section]: #filter-usage-guides
[FilterPolicy custom resource]: ../filterpolicy
[JWTFilter]: ../filter-jwt
[OAuth2Filter]: ../filter-oauth2
[APIKeyFilter]:  ../filter-apikey
[ExternalFilter]: ../filter-external
[PluginFilter]: ../filter-plugin
[Using JWT Filters]: ../../guides/auth/jwt
[Oauth2 design in $productName$]: ../../design/oauth2
[Using Oauth2 Filters]: ../../guides/sso/oauth2-sso
[SSO with Auth0]: ../../guides/sso/auth0
[SSO with Azure]: ../../guides/sso/azure
[SSO with Google]: ../../guides/sso/google
[SSO with Keycloak]: ../../guides/sso/keycloak
[SSO with Okta]: ../../guides/sso/okta
[SSO with OneLogin]: ../../guides/sso/onelogin
[SSO with Salesforce]: ../../guides/sso/salesforce
[SSO with UAA]: ../../guides/sso/uaa
[Using APIKey Filters]: ../../guides/auth/apikey
[Using External Filters]: ../../guides/custom-filters/external
[Using Plugin Filters]: ../../guides/custom-filters/plugin
[metav1.Condition]: https://pkg.go.dev/k8s.io/apimachinery/pkg/apis/meta/v1#Condition
