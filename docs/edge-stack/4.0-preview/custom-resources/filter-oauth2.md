import Alert from '@material-ui/lab/Alert';

# The **OAuth2 Filter** Type

The OAuth2 Filter type performs OAuth2 authorization against an identity provider implementing [OIDC Discovery][]. The filter is both:

- An OAuth Client, which fetches resources from the Resource Server on the user's behalf.
- Half of a Resource Server, validating the Access Token before allowing the request through to the upstream service, which implements the other half of the Resource Server.

This is different from most OAuth implementations where the Authorization Server and the Resource Server are in the same security domain.
With $productName$, the Client and the Resource Server are in the same security domain, and there is an independent Authorization Server.

This doc is an overview of all the fields on the OAuth2 `Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
Tutorials and guides for the OAuth2 `Filter` Resource can be found in the [usage guides section][]

## External Filter API Reference

To create an OAuth2 Filter, the `spec.type` must be set to `oauth2`, and the `oauth2` field must contain configuration for your
OAuth2 filter.

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: Filter
metadata:
  name: "example-oauth2-filter"
  namespace: "example-namespace"
spec:
  type: "oauth2"                                           # required
  oauth2: OAuth2Filter                                     # required when `type: "oauth2"`
    authorizationURL: string                               # required, must be an absolute url
    expirationSafetyMargin: Duration                       # optional
    injectRequestHeaders: []AddHeaderTemplate              # optional
    - name: string                                         # required
      value: string (GoLang Template)                      # required
    allowMalformedAccessToken: bool                        # optional, default: `false`
    accessTokenValidation: Enum                            # optional
    accessTokenJWTFilter: JWTFilterReference               # optional
      name: string                                         # required
      namespace: string                                    # optional
      inheritScopeArgument: bool                           # optional, default: `false`
      stripInheritedScope: bool                            # optional, default: `false`
      arguments: JWTArguments                              # optional
        scope: []string                                    # optional
    clientAuthentication: ClientAuthentication             # optional
      method: Enum                                         # optional, default: `"HeaderPassword"`
      jwtAssertion: JWTAssertion                           # optional
        setClientID: bool                                  # optional, default: `false`
        audience: string                                   # optional
        signingMethod: Enum                                # optional, default: `RS256`
        lifetime: Duration                                 # optional, default: `"1m`
        setNBF: bool                                       # optional, default: `false`
        nbfSafetyMargin: Duration                          # optional
        setIAT: bool                                       # optional, default: `false`
        otherClaims: []byte                                # optional, default: `{}`
        otherHeaderParameters: []byte                      # optional, default: `{}`
    grantType: Enum                                        # required
    authorizationCodeSettings: AuthorizationCodeSettings   # optional, used when `grantType: "AuthorizationCode"`
      clientID: string                                     # required
      clientSecret: string                                 # optional
      clientSecretRef: SecretReference                     # optional
        name: string                                       # optional
        namespace: string                                  # optional
      maxStale: Duration                                   # optional
      insecureTLS: bool                                    # optional, default: `false`
      renegotiateTLS: Enum                                 # optional, default: `"never"`
      protectedOrigins: []Origin                           # required, min items: 1, max items: 16
      - origin: string                                     # required, must be an absolute URL, max length: 255
        includeSubdomains: bool                            # optional, defualt: `false`
        allowedInternalOrigins: []string                   # optional, max items: 16
    resourceOwnerSettings: ResourceOwnerSettings           # optoinal, used when `grantType: "ResourceOwnder"`
      clientID: string                                     # required
      clientSecret: string                                 # optional
      clientSecretRef: SecretReference                     # optional
    passwordSettings: PasswordSettings                     # optional, used when `grantType: "Password"`
      clientID: string                                     # required
      clientSecret: string                                 # optional
      clientSecretRef: SecretReference                     # optional
status: []metav1.Condition                                 # field managed by controller, max items: 8
```

### OAuth2Filter

| **Field**                     | **Type**                      | **Description**                                                                                                                                                  |
|-------------------------------|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `authorizationURL`            | `string`                      | Identity Provider Issuer URL which hosts the OpenID provider well-known configurartion. The URL must be an absolute URL. Per [OpenID Connect Discovery 1.0][] the configuration must be provided in a json document at the path `/.well-known/openid-configuration`. This is used by the OAuth2 Filter for determining things like the AuthorizationEndpoint, TokenEndpoint, JWKs endpint, etc... |
| `expirationSafetyMargin`      | [Duration][]                  | Sets a buffer to check if the Token is expired or is going to expire within the safety margin. This is to ensure the application has enough time to reauthenticate to adjust for clock skew and network latency. By default, no safety margin is added. |
| `injectRequestHeaders`        | \[\][][AddHeaderTemplate]     | List of headers that will be injected into the upstream request if allowed through. The headers can pull information from the Token has values. For example, attaching user email claim to a header from the token. |
| `allowMalformedAccessToken`   | `bool` | Allows any access token even if they are not RFC 6750-compliant. |
| `accessTokenValidation`       | `Enum`(`"auto"`,`"jwt"`,`"userinfo"`) | Sets the method used for validating an AccessToken. |
| `accessTokenJWTFilter`        | [JWTFilterReference][]        | Reference to a [JWT Filter][] to be executed after the OAuth2 Filter finishes |
| `clientAuthentication`        | [ClientAuthentication][]      | Defines how the OAuth2 Filter will authenticate with the iDP token endpoint. By default, it will pass it along as password in the Authentication header. Depending on how your iDP is configured it might require a JWTAssertion or passing the password. |
| `grantType`                   | `Enum`(`"AuthorizationCode"`,`"ClientCredentials"`,`"Password"`,`"ResourceOwner"`) | Sets the Authorization Flow that the filter will use to authenticate the incoming request. |
| `authorizationCodeSettings`   | [AuthorizationCodeSettings][] | Specific settings that configure the `AuthorizationCode` grant type. |
| `resourceOwnerSettings`       | [ResourceOwnerSettings][]     | Specific settings that configure the `ResourceOwner` grant type. |
| `passwordSettings`            | [PasswordSettings][]          | Specific settings that configure the `Password` grant type. |

`grantType` options:

- `"AuthorizationCode"`: Authenticate by redirecting to a login page served by the identity provider.
- `"ClientCredentials"`: Authenticate by requiring that the incoming HTTP request include as headers the credentials for Ambassador to use to authenticate to the identity provider.
- `"Password"`: Authenticate by requiring `X-Ambassador-Username` and `X-Ambassador-Password` on all incoming requests, and use them to authenticate with the identity provider using the OAuth2 Resource Owner Password Credentials grant type.

### Duration

**Appears on**: [Oauth2Filter][], [JWTAssertion][], [AuthorizationCodeSettings][]
Duration is a field that accepts a string that will be parsed as a sequence of decimal numbers ([metav1.Duration][]), each with optional fraction
and a unit suffix, such as `"300ms"`, `"1.5h"` or `"2h45m"`. Valid time units are `"ns"`, `"us"` (or `"µs"`), `"ms"`, `"s"`,
`"m"`, `"h"`. See [Go time.ParseDuration][].

### AddHeaderTemplate

**Appears On**: [OAuth2Filter][]
List of headers that will be injected into the upstream request if allowed through. The headers can pull information from the Token has values. For example, attaching user email claim to a header from the token.

| **Field**  | **Type**                       | **Description**                                                                                         |
|------------|--------------------------------|---------------------------------------------------------------------------------------------------------|
| `name`     | `string`                       | The name of the header to inject `value` into                                                           |
| `value`    | `string` (GoLang Template)     | A Golang template that can dynamically extract request information as the value of the injected header. |

The header value can be set based on the JWT value. If an `OAuth2 Filter` is chained with a [JWT filter][] with `injectRequestHeaders` configured, both sets of headers will be injected. If the same header is injected in both filters, the `OAuth2 Filter` will populate the value. The value is specified as a [Go text/template][] string, with the following data made available to it:

- `.token.Raw` → The access token raw JWT (`string`)
- `.token.Header` → The access token JWT header (as parsed JSON: `map[string]interface{}`)
- `.token.Claims` → The access token JWT claims (as parsed JSON: `map[string]interface{}`)
- `.token.Signature` → The access token signature (`string`)
- `.idToken.Raw` → The raw id token JWT (`string`)
- `.idToken.Header` → The id token JWT header (as parsed JSON: `map[string]interface{}`)
- `.idToken.Claims` → The id token JWT claims (as parsed JSON: `map[string]interface{}`)
- `.idToken.Signature` → The id token signature (`string`)
- `.httpRequestHeader` → `http.Header` a copy of the header of the incoming HTTP request. Any changes to `.httpRequestHeader` (such as by using using `.httpRequestHeader.Set`) have no effect. It is recommended to use `.httpRequestHeader.Get` instead of treating it as a map, in order to handle capitalization correctly.

### JWTFilterReference

**Appears On**: [OAuth2Filter][]
Reference to a [JWT Filter][] to be executed after the OAuth2 Filter finishes

| **Field**              | **Type**          | **Description**                                                                                         |
|------------------------|-------------------|---------------------------------------------------------------------------------------------------------|
| `name`                 | `string`          | Name of the JWTFilter used to verify AccessToken. Note the Filter refrenced here must be a JWTFilter. |
| `namespace`            | `string`          | Namespace of the JWTFilter used to verify AccessToken. Note the Filter refrenced here must be a JWTFilter. |
| `inheritScopeArgument`:| `bool`            | Will use the same scope as set on the FilterPolicy OAuth2Arguments. If the JWTFilter sets a scope as well then the union of the two will be used. |
| `stripInheritedScope`  | `bool`            | Determines whether or not to santized a scope that is formatted as an URI and was inherited from the FilterPolicy OAuth2Arguments. This will be done prior to passing it along to the referenced JWTFilter. This requires that InheritScopeArgument is true. |
| `arguments`            | [JWTArguments][]  | Defines the input arguments that can be set for a JWTFilter. |

### JWTArguments

**Appears On**: [JWTFilterReference][]
Defines the input arguments that can be set for a JWTFilter.

| **Field**  | **Type**    | **Description**                                                                                         |
|------------|-------------|---------------------------------------------------------------------------------------------------------|
| `scope`    | `[]string`  | Set of scopes the JWT will be validated against. |

### ClientAuthentication

**Appears On**: [OAuth2Filter][]
Defines how the OAuth2 Filter will authenticate with the iDP token endpoint. By default, it will pass it along as password in the Authentication header. Depending on how your iDP is configured it might require a JWTAssertion or passing the password.

| **Field**      | **Type**                         | **Description**                                                                                         |
|----------------|----------------------------------|---------------------------------------------------------------------------------------------------------|
| `method`       | `Enum`(`"HeaderPassword"`,`"BodyPassword"`,`"JWTAssertion"`) | Defines the type of client authentication that will be used |
| `jwtAssertion` | [JWTAssertion][] | Allows setting a [JWT Filter][] with custom settings on how to verify JWT obtained via the OAuth2 flow. |

### JWTAssertion

**Appears On**: [ClientAuthentication][]
Allows setting a [JWT Filter][] with custom settings on how to verify JWT obtained via the OAuth2 flow.

| **Field**                | **Type**                | **Description**                                                                                         |
|--------------------------|-------------------------|---------------------------------------------------------------------------------------------------------|
| `setClientID`            | `bool`                  | Determines whether to set the ClientID as an HTTP parameter. Setting it as an HTTP parameter is optional per RFC 7521 §4.2. but some iDP's require it. |
| `audience`               | `string`                | Audience your IDP requires for authentication. If not set then the default will be to use the token endpoint from the OIDC discovery document. |
| `signingMethod`          | [ValidAlgorithms][]     | The set of signing algorithms that can be considered when verifying tokens attached to requests. If the token is signed with an algorithm that is not in this list then it will be rejected. If not provided then all supported algorithms are allowed. The list should match the set configured in the iDP, as well as the full set of possible valid tokens maybe received. For example, if you may have previously supported RS256 & RS512 but you have decided to only receive tokens signed using RS512 now. This will cause existing tokens to be rejected. |
| `lifetime`               | [Duration][]            | TODO: |
| `setNBF`                 | `bool`                  | TODO: |
| `nbfSafetyMargin`        | [Duration][]            | TODO: |
| `setIAT`                 | `bool`                  | TODO: |
| `otherClaims`            | `[]byte` (Encoded JSON) | Key/value pairs that will be add to the JWT sent for client Auth to the Identity Provider |
| `otherHeaderParameters`  | `[]byte` (Encoded JSON) | Additional headers sent in the Authorization request. |

### ValidAlgorithms

**Appears On**: [JWTAssertion][]
Valid Algorithms is an enum with quite a few entries, the possible values are:

- `"none"`
- **ECDSA Algorithms**: `"ES256"`, `"ES384"`, `"ES512"`
- **HMAC-SHA Algorithms**: `"HS256"`, `"HS384"`, `"HS512"`
- **RSA-PSS Algorithms**: `"PS256"`, `"PS384"`, `"PS512"`
- **RSA Algorithms**: `"RS256"`, `"RS384"`, `"RS512"`

### AuthorizationCodeSettings

**Appears On**: [OAuth2Filter][]
Specific settings that configure the `AuthorizationCode` grant type.

| **Field**          | **Type**            | **Description**                                                                                         |
|--------------------|---------------------|---------------------------------------------------------------------------------------------------------|
| `clientID`         | `string`            | The ID registered with the IdentityProvider for the client. |
| `clientSecret`     | `string`            | The secret registered with the IdentityProvider for the client. |
| `clientSecretRef`  | [SecretReference][] | Reference to a [Kubernetes Secret][] within the cluster that contains the secret registered with the IdentityProvider for the client. |
| `maxStale`         | [Duration][]        | Sets the duration that JWKs keys and OIDC discovery responses will be cached, ignoring any caching headers when configured |
| `insecureTLS`      | `bool`              | Tells the $productName$ to skip verifying the IdentityProvider server when communicating with the various endpoints. This is typically needed when using an IdentityProvider configured with self-signed certs. |
| `renegotiateTLS`   | `Enum` (`never`,`onceAsClient`,`freelyAsClient`)    | Sets whether the OAuth2 Filter will renegotiateTLS with the iDP server and if so what supported method of renegotiation will be used. |
| `protectedOrigins` | \[\][Origin][]      | List of origins (domains) that the OAuth2 Filter is configured to protect. Setting multiple origins allows for protecting multiple domains using the same Session and Token that is retrieved from the Identity Provider. When setting multiple protected origins, the first origin will be used for the final redirect to the IdentityProvider therefore the identity provider needs to be configured to allow redirects from that origin. However, it is recommended that all protected origins are registered with the IdentityProvider because this is subject to change in the future. |

### SecretReference

**Appears On**: [AuthorizationCodeSettings][], [PasswordSettings][], [ResourceOwnerSettings][]
A reference to a [Kubernetes Secret][].

| **Field**   | **Type**   | **Description**                                                                                         |
|-------------|------------|---------------------------------------------------------------------------------------------------------|
| `name`      | `string`   | Name of the Kubernetes Secret being referenced. |
| `namespace` | `string`   | Namespace of the Kubernetes Secret being referenced. |

### Origin

**Appears On**: [AuthorizationCodeSettings][]
A domain that the OAuth2 Filter is configured to protect. It is recommended that all protected origins are registered with the IdentityProvider because this is subject to change in the future.

| **Field**                | **Type**   | **Description**                                                                                         |
|--------------------------|------------|---------------------------------------------------------------------------------------------------------|
| `origin`                 | `string`   | The absolute URL (schema://hostname) that is protected by the OAuth2 Filter |
| `includeSubdomains`      | `bool`     | Enables protecting sub-domains of the domain identified in the Origin field. Example, when `Origin=https://example.com` then the subdomain of `https://app.example.com` would be watched. |
| `allowedInternalOrigins` | `[]string` | Indentifies a list of allowed internal origins that were set by a downstream proxy via a host header rewrite. The origins identified in this list ensures the request is allowed and will ensure it redirects correctly to the upstream origin. For example, a downstream client will communicate with an origin of `https://example.com` but then an internal proxy will do a rewrite so that the host header received by Edge Stack is `http://example.internal`. |

### ResourceOwnerSettings

**Appears On**: [OAuth2Filter][]
Specific settings that configure the `ResourceOwner` grant type.

| **Field**          | **Type**            | **Description**                                                                                         |
|--------------------|---------------------|---------------------------------------------------------------------------------------------------------|
| `clientID`         | `string`            | The ID registered with the IdentityProvider for the client. |
| `clientSecret`     | `string`            | The secret registered with the IdentityProvider for the client. |
| `clientSecretRef`  | [SecretReference][] | Reference to a [Kubernetes Secret][] within the cluster that contains the secret registered with the IdentityProvider for the client. |

### PasswordSettings

**Appears On**: [OAuth2Filter][]
Specific settings that configure the `Password` grant type.

| **Field**          | **Type**            | **Description**                                                                                         |
|--------------------|---------------------|---------------------------------------------------------------------------------------------------------|
| `clientID`         | `string`            | The ID registered with the IdentityProvider for the client. |
| `clientSecret`     | `string`            | The secret registered with the IdentityProvider for the client. |
| `clientSecretRef`  | [SecretReference][] | Reference to a [Kubernetes Secret][] within the cluster that contains the secret registered with the IdentityProvider for the client. |

## OAuth2 Filter Usage Guides

The following guides will help you get started using OAuth2 Filters

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

[usage guides section]: #oauth2-filter-usage-guides
[AddHeaderTemplate]: #addheadertemplate
[Oauth2Filter]: #oauth2filter
[JWTFilterReference]: #jwtfilterreference
[ClientAuthentication]: #jwtfilterreference
[AuthorizationCodeSettings]: #authorizationcodesettings
[ResourceOwnerSettings]: #resourceownersettings
[PasswordSettings]: #passwordsettings
[JWTArguments]: #jwtarguments
[JWTAssertion]: #jwtassertion
[ValidAlgorithms]: #validalgorithms
[SecretReference]: #secretreference
[Origin]: #origin
[Duration]: #duration
[JWT Filter]: ../filter-jwt
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
[Go time.ParseDuration]: https://pkg.go.dev/time#ParseDuration
[Kubernetes secret]: https://kubernetes.io/docs/concepts/configuration/secret/
[OpenID Connect Discovery 1.0]: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
[metav1.Duration]: https://pkg.go.dev/k8s.io/apimachinery/pkg/apis/meta/v1#Duration
[OIDC Discovery]: https://openid.net/specs/openid-connect-discovery-1_0.html
