import Alert from '@material-ui/lab/Alert';

# The **FilterPolicy** Resource

The `FilterPolicy` custom resource works in conjunction with the [Filter custom resource][] to define how and when $productName$ will
modify or intercept incoming requests before sending to your upstream Service. `Filters` define what actions to take on a request,
while `FilterPolicies` define the matching criteria for requests such as the headers, hostname, and path, and supply references to
one or more `Filters` to execute on those requests.

This doc is an overview of all the fields on the `FilterPolicy` Custom Resource with descriptions of the purpose, type, and default values of those fields.

Tutorials and guides for the `Filter`/`FilterPolicy` Resources can be found in the [usage guides section][]

<Alert severity="info">
    Filtering actions of all types in $productName$ are only ever executed on incoming requests and not on responses from your upstream Services.
</Alert>

## FilterPolicy API Reference

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: FilterPolicy
metadata:
  name: "example-filter-policy"
  namespace: "example-namespace"
spec: FilterPolicy
  rules: []FilterPolicyRule                   # required, min items: 1
  - host: string                              # optional, default: `"*"`
    path: string                              # optional, default: `"*"`
    precedence: int                           # optional
    filterRefs: []FilterReference             # optional, max items: 5
    - name: string                            # required
      namespace: string                       # optional
      onDeny: Enum                            # optional, default: `"break"`
      onAllow: Enum                           # optional, default: `"continue"`
      ifRequestHeader: HTTPHeaderMatch        # optional
        type: Enum                            # optional, default: `"Exact"`
        name: string                          # required
        value: string                         # optional, max length: 4096
        negate: bool                          # optional, default: `false`
      arguments: FilterArguments              # optional
        type: Enum                            # required
        jwt: JWTArguments                     # optional, required when `type: "jwt"`
          scope: []string                     # optional
        oauth2: OAuth2Arguments               # optional, required when `type: "oauth2"`
          scope: []string                     # optional
          insteadOfRedirect: OAuth2Redirect   # optional
            statusCode: int                   # optional
            ifRequestHeader: HTTPHeaderMatch  # optional
            filterRefs: []FilterReference     # optional
          sameSite: Enum                      # optional
status: FilterPolicyStatus                    # field managed by controller
  conditions: []metav1.Condition              # max items: 8
  rules: []FilterPolicyRuleStatus             # max items: 64
  - index: string
    host: string
    path: string
    conditions: []metav1.Condition
```

### FilterPolicy

| **Field**  | **Type**                   | **Description**                                                                   |
|------------|----------------------------|-----------------------------------------------------------------------------------|
| `rules`    | \[\][FilterPolicyRule][]   | Set of matching rules that are checked against incoming request to determine which set of Filter's to apply. If no matches are found then the request is allowed through to the upstream service without executing any Filters. |

### FilterPolicyRule

**Appears on**: [FilterPolicy][]
Configures matching rules that are checked against incoming request to determine which `Filter` to apply (if any).

| **Field**    | **Type**                 | **Description**                                                                   |
|--------------|--------------------------|-----------------------------------------------------------------------------------|
| `host`       | `string`                 | "glob-string" that matches on the `:authority` header of the incoming request. If not set it will match on all incoming requests. |
| `path`       | `string`                 | "glob-string" that matches on the request path. If not provided then it will match on all incoming requests. |
| `filterRefs` | \[\][FilterReference][]  | List of references to `Filters` that will be applied to the incoming request. Filters will be applied to the request in the order they are listed. If no filters are provided then the request will be allowed through to the upstream service without any additional processing. This allows for having one Rule that is overly permissive and then using a single rule to opt-out on certain paths. |
| `precedence` | `int`                    | Allows forcing a precedence ordering on the rules. By default the rules are evaluated in the order they are in the `FilterPolicy.spec.rules` field. However, multiple FilterPolicy's can be applied to a cluster. To ensure that a specific ordering is enforced then using a precedence is an option. |

### FilterReference

**Appears on**: [FilterPolicyRule][], [OAuth2Redirect][]
List of references to `Filters` that will be applied to the incoming request. Filters will be applied to the request in the order they are listed. If no filters are provided then the request will be allowed through to the upstream service without any additional processing. This allows for having one Rule that is overly permissive and then using a single rule to opt-out on certain paths.

| **Field**         | **Type**                          | **Description**                                                                   |
|-------------------|-----------------------------------|-----------------------------------------------------------------------------------|
| `name`            | `string`                          | Name that identifies the Filter |
| `namespace`       | `string`                          | Kubernetes namespace that the Filter resides. It must be a RFC 1123 label. Valid values include: `"example"`, Invalid values include: `"example.com"` (`.` is an invalid character). This validation is based off of the [corresponding Kubernetes validation]. |
| `onDeny`          | `Enum` (`"break"`,`"continue"`)   | Determines the behavior when a Filter denies the request. |
| `onAllow`         | `Enum` (`"break"`,`"continue"`)   | Determines the behavior when a Filter denies the request. |
| `ifRequestHeader` | [HTTPHeaderMatch][]               | Checks if exact or regular expression matches a value in a request Header to determine if an individual Filter is executed or not. |
| `arguments`       | [FilterArguments][]               | Strongly typed input arguments that can be passed into a Filter on per [FilterReference][] level allowing for different behavior on different Rules. |

### HTTPHeaderMatch

**Appears on**: [FilterPolicyRule][], [OAuth2Redirect][]
Checks if exact or regular expression matches a value in a request Header to determine if an individual Filter is executed or not.

| **Field**  | **Type**                                | **Description**                                                                   |
|------------|-----------------------------------------|-----------------------------------------------------------------------------------|
| `type`     | `Enum`(`"Exact"`,`"RegularExpression"`) | The semantics of how HTTP header values should be evaluated |
| `name`     | `string`                                | Name of the header to match. Matching MUST be case insensitive. (See [https://tools.ietf.org/html/rfc7230#section-3.2][]). Valid examples: `"Authorization"`/`"Set-Cookie"`. Invalid examples: `":method"` - `:` is an invalid character. This means that HTTP/2 pseudo headers are not currently supported by this type. `"/invalid"` - `/` is an invalid character. |
| `value`    | `string`                                | Value of HTTP Header to be matched. If type is RegularExpression then this must be a valid regex with length being at least 1. |
| `negate`   | `bool`                                  | Allows the match criteria to be negated or flipped. For example, you can have a regex that checks for any non-empty string which would indicate would translate to if header exists on request then match on it. With negate turned on this would translate to match on any request that doesn't have a header. |

### FilterArguments

**Appears on**: [FilterPolicyRule][]
Strongly typed input arguments that can be passed into a Filter on per [FilterReference][] level allowing for different behavior on different Rules.

| **Field**    | **Type**                                      | **Description**                                                                   |
|--------------|-----------------------------------------------|-----------------------------------------------------------------------------------|
| `type`       | `Enum` (`"jwt"`/`"oauth2"`) | Identifies the expected type of the arguments that will be passed to the `FilterRef`. This must match the type of the `filterRef` and if it doesn't the `FilterPolicy` `rule` will be considered invalid and a status condition will be updated to indicate the mismatch. |
| `jwt`        | [JWTArguments][]      | Defines the input arguments that can be set for an [JWT Filter][] on a per `FilterPolicy` `rule` level. |
| `oauth2`     | [OAuth2Arguments][]   | Defines the input arguments that can be set for an [OAuth2 Filter][] on a per `FilterPolicy` `rule` level. |

### JWTArguments

**Appears on**: [FilterArguments][]
Defines the input arguments that can be set for an [JWT Filter][] on a per `FilterPolicy` `rule` level.

| **Field**    | **Type**    | **Description**                                                                   |
|--------------|-------------|-----------------------------------------------------------------------------------|
| `scope`      | `[]string`  | Set of scopes the JWT will be validated against |

### OAuth2Arguments

**Appears on**: [FilterArguments][]
Defines the input arguments that can be set for an [OAuth2 Filter][] on a per `FilterPolicy` `rule` level.

| **Field**           | **Type**                                        | **Description**                                                                   |
|---------------------|-------------------------------------------------|-----------------------------------------------------------------------------------|
| `scope`             | `[]string`                                      | Set of scopes the JWT will be validated against |
| `insteadOfRedirect` | [OAuth2Redirect][]                              | Allows customizing the behavior of the OAuth2 redirect and whether it will redirect the browser or not. |
| `sameSite`          | `Enum`(`"default"`,`"none"`,`"lax"`,`"strict"`) | Set of options for setting the SameSite attribute on a cookie. [https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00][] for details. |

### OAuth2Redirect

**Appears on**: [OAuth2Arguments][]
Allows customizing the behavior of the OAuth2 redirect and whether it will redirect the browser or not.

| **Field**         | **Type**                | **Description**                                                                   |
|-------------------|-------------------------|-----------------------------------------------------------------------------------|
| `statusCode`      | `int`                   | The HTTP status code to be used in response. If filterRef is not set then this will default to a 403 forbidden. |
| `ifRequestHeader` | [HTTPHeaderMatch][]     | Allows only applying the InsteadOfRedirect logic when a the header matches. |
| `filterRefs`      | \[\][FilterReference][] | List of references to Filter's that will be applied when an OAuth2 session has expired and the user would like to try a secondary authentication mechanism without redircting to the iDP. Nesting an [OAuth2 Filter][] inside of an [OAuth2 Filter][] is not supported. |

### FilterPolicyStatus

Automatically managed by the controller to reflect the state of the `FilterPolicy`

| **Field**              | **Type**                  | **Description**                                                                   |
|------------------------|---------------------------|-----------------------------------------------------------------------------------|
| `conditions`           | \[\][metav1.Condition][]  | Describes the current condition of the `FilterPolicy`. |
| `rules`                |`[]FilterPolicyRuleStatus` | Describes the status for each unique Rule defined in the `Spec` |
| `rules.index`          | `string`                  | The zero-based index of the rule within `rules` with the problem to help with identifying the error |
| `rules.host`           | `string`                  | `host` of the rule with the problem to help with identifying the error
| `rules.path`           | `string`                  | `path` of the rule with the problem to help with identifying the error |
| `rules.conditions`     | \[\][metav1.Condition][]  | Describes the current condition of a specific `rule`. |

## Filter Usage Guides

The following guides will help you get started using the different types of `Filters`

- [Using JWT Filters][] - Use the JWT Filter to validate and process JWTs on requests
- [Using Oauth2 Filters][] - Use the OAuth2 Filter for authentication to protect access to services
  - [SSO with Oauth2][] - Use OAuth2 Filters for single sign on
  - [SSO with Auth0][] - Setup single sign on with Auth0
  - [SSO with Azure][] - Setup single sign on with Azure
  - [SSO with Google][] - Setup single sign on with Google
  - [SSO with Keycloak][] - Setup single sign on with Keycloak
  - [SSO with Okta][] - Setup single sign on with Okta
  - [SSO with OneLogin][] - Setup single sign on with OneLogin
  - [SSO with Salesforce][] - Setup single sign on with Salesforce
  - [SSO with UAA][] - Setup single sign on with UAA
- [Chaining Oauth2 and JWT Filters][] - Learn how to combine Filters for Oauth2 and JWT processing
- [Using APIKey Filters][] - Use the APIKey Filter to validate API Keys present in the HTTP header
- [Using External Filters][] - Use the External Filter to write your own service with custom processing and authentication logic
  - [Basic Auth using External Filters][] - Setup basic authentication using an External Filter
- [Using Plugin Filters][] - Compile your own custom filtering plugin on top of $productName$

[usage guides section]: #filter-usage-guides
[FilterPolicy]: #filterpolicy
[FilterPolicyRule]: #filterpolicyrule
[FilterReference]: #filterreference
[FilterArguments]: #filterarguments
[HTTPHeaderMatch]: #httpheadermatch
[OAuth2Redirect]: #oauth2redirect
[OAuth2Arguments]: #oauth2arguments
[JWTArguments]: #jwtarguments
[JWT Filter]: ../filter-jwt
[OAuth2 Filter]: ../filter-oauth2
[Filter custom resource]: ../filter
[Using JWT Filters]: ../../guides/auth/jwt
[Using Oauth2 Filters]: ../../guides/auth/oauth2
[SSO with Auth0]: ../../guides/sso/auth0
[SSO with Azure]: ../../guides/sso/azure
[SSO with Google]: ../../guides/sso/google
[SSO with Keycloak]: ../../guides/sso/keycloak
[SSO with Oauth2]: ../../guides/sso/oauth2-sso
[SSO with Okta]: ../../guides/sso/okta
[SSO with OneLogin]: ../../guides/sso/onelogin
[SSO with Salesforce]: ../../guides/sso/salesforce
[SSO with UAA]: ../../guides/sso/uaa
[Chaining Oauth2 and JWT Filters]: ../../guides/auth/oauth2-and-jwt
[Using APIKey Filters]: ../../guides/auth/apikey
[Using External Filters]: ../../guides/custom-filters/external
[Basic Auth using External Filters]: ../../guides/auth/basic-auth
[Using Plugin Filters]: ../../guides/custom-filters/plugin
[corresponding Kubernetes validation]: https://github.com/kubernetes/apimachinery/blob/02cfb53916346d085a6c6c7c66f882e3c6b0eca6/pkg/util/validation/validation.go#L187
[https://tools.ietf.org/html/rfc7230#section-3.2]: https://tools.ietf.org/html/rfc7230#section-3.2
[https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00]: https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00
[metav1.Condition]: https://pkg.go.dev/k8s.io/apimachinery/pkg/apis/meta/v1
