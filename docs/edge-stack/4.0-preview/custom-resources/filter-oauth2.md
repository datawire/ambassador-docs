import Alert from '@material-ui/lab/Alert';

# The **OAuth2 Filter** Type

The OAuth2 Filter type performs OAuth2 authorization against an identity provider implementing [OIDC Discovery][].

This doc is an overview of all the fields on the OAuth2 `Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
Tutorials and guides for the OAuth2 `Filter` Resource can be found in the [usage guides section][].

## External Filter API Reference

To create an OAuth2 Filter, the `spec.type` must be set to `oauth2`, and the `oauth2` field must contain the configuration for your
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
    accessTokenValidation: Enum                            # optional, default: `"auto"`
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
| `expirationSafetyMargin`      | [Duration][]                  | Sets a buffer to check if the Token is expired or is going to expire within the safety margin. This is to ensure the application has enough time to reauthenticate to adjust for clock skew and network latency. By default, no safety margin is added. If a token is received with an expiration less than this field, then the token is considered to already be expired. |
| `injectRequestHeaders`        | \[\][][AddHeaderTemplate]     | List of headers that will be injected into the upstream request if allowed through. The headers can pull information from the Token has values. For example, attaching user email claim to a header from the token. |
| `allowMalformedAccessToken`   | `bool` | Allows any access token even if they are not RFC 6750-compliant. |
| `accessTokenValidation`       | `Enum`(`"auto"`,`"jwt"`,`"userinfo"`) | Sets the method used for validating an AccessToken. |
| `accessTokenJWTFilter`        | [JWTFilterReference][]        | Reference to a [JWT Filter][] to be executed after the OAuth2 Filter finishes |
| `clientAuthentication`        | [ClientAuthentication][]      | Defines how the OAuth2 Filter will authenticate with the iDP token endpoint. By default, it will pass it along as password in the Authentication header. Depending on how your iDP is configured it might require a JWTAssertion or passing the password. |
| `grantType`                   | `Enum`(`"AuthorizationCode"`,`"ClientCredentials"`,`"Password"`,`"ResourceOwner"`) | Sets the Authorization Flow that the filter will use to authenticate the incoming request. |
| `authorizationCodeSettings`   | [AuthorizationCodeSettings][] | Specific settings that configure the `AuthorizationCode` grant type. |
| `resourceOwnerSettings`       | [ResourceOwnerSettings][]     | Specific settings that configure the `ResourceOwner` grant type. |
| `passwordSettings`            | [PasswordSettings][]          | Specific settings that configure the `Password` grant type. |

**`grantType` options**:

- `"AuthorizationCode"`: Authenticate by redirecting to a login page served by the identity provider.
- `"Password"`: Authenticate by requiring `X-Ambassador-Username` and `X-Ambassador-Password` on all incoming requests, and use them to authenticate with the identity provider using the OAuth2 Resource Owner Password Credentials grant type.
- `"ClientCredentials"`: Authenticate by requiring that the incoming HTTP request include as headers the credentials for Ambassador to use to authenticate to the identity provider.
  - The type of credentials needing to be submitted depends on the `clientAuthentication.method` (below):
  - For `"HeaderPassword"` and `"BodyPassword"`, the headers `X-Ambassador-Client-ID` and `X-Ambassador-Client-Secret` must be set.
  - For `"JWTAssertion"`, the `X-Ambassador-Client-Assertion` header must be set to a JWT that is signed by your client secret, and conforms with the requirements in RFC 7521 section 5.2 and RFC 7523 section 3, as well as any additional specified by your identity provider.

**`accessTokenValidation` options**:

- `"jwt"`: Validates the Access Token as a JWT.

  - By default: It accepts the RS256, RS384, or RS512 signature algorithms, and validates the signature against the JWKS from
OIDC Discovery. It then validates the `exp`, `iat`, `nbf`, `iss` (with the Issuer from OIDC Discovery), and `scope` claims: if present,
none of the scope values are required to be present. This relies on the identity provider using non-encrypted signed JWTs as
Access Tokens, and configuring the signing appropriately
  - This behavior can be modified by delegating to [JWT Filter][] with `accessTokenJWTFilter`:

- `"userinfo"`: Validates the access token by polling the OIDC UserInfo Endpoint. This means that $productName$ must initiate
an HTTP request to the identity provider for each authorized request to a protected resource. This performs poorly,
but functions properly with a wider range of identity providers. It is not valid to set `accessTokenJWTFilter` if
`accessTokenValidation`: `userinfo`.

- `"auto"` attempts to do `"jwt"` validation if any of these conditions are true:
  - `accessTokenJWTFilter` is set
  - `grantType` is `"ClientCredentials"`
  - the Access Token parses as a JWT and the signature is valid,
  - If none of the above conditions are satisfied, it falls back to `"userinfo"` validation.

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
| `scope`    | `[]string`  | A list of OAuth scope values to include in the scope of the authorization request. If one of the scope values for a path is not granted, then access to that resource is forbidden; if the `scope` argument lists `foo`, but the authorization response from the provider does not include `foo` in the scope, then it will be taken to mean that the authorization server forbade access to this path, as the authenticated user does not have the `foo` resource scope. |

**Some notes about `scope`**:

- If `grantType: "AuthorizationCode"`, then the `openid` scope value is always included in the requested scope, even if it is not listed.
- If `grantType: "ClientCredentials"` or `grantType: "Password"`, then the default scope is empty. If your identity provider does not have a default scope, then you will need to configure one here.
- As a special case, if the `offline_access` scope value is requested, but not included in the response then access is not forbidden. With many identity providers, requesting the `offline_access` scope is necessary to receive a Refresh Token.
- The ordering of scope values does not matter, and is ignored.


### ClientAuthentication

**Appears On**: [OAuth2Filter][]
Defines how the OAuth2 Filter will authenticate with the iDP token endpoint. By default, it will pass it along as password in the Authentication header. Depending on how your iDP is configured it might require a JWTAssertion or passing the password.

| **Field**      | **Type**                         | **Description**                                                                                         |
|----------------|----------------------------------|---------------------------------------------------------------------------------------------------------|
| `method`       | `Enum`(`"HeaderPassword"`,`"BodyPassword"`,`"JWTAssertion"`) | Defines the type of client authentication that will be used |
| `jwtAssertion` | [JWTAssertion][] | This field is only used when `method: "JWTAssertion"`. Allows setting a [JWT Filter][] with custom settings on how to verify JWT obtained via the OAuth2 flow. |

`method` options:

- `"HeaderPassword"`: Treat the client secret as a password, and pack that in to an HTTP header for HTTP Basic authentication.
- `"BodyPassword"`: Treat the client secret as a password, and put that in the HTTP request bodies submitted to the identity provider. This is NOT RECOMMENDED by RFC 6749, and should only be used when using `HeaderPassword` isn't possible.
- `"JWTAssertion"`: Treat the client secret as a password, and put that in the HTTP request bodies submitted to the identity provider. This is NOT RECOMMENDED by RFC 6749, and should only be used when using `HeaderPassword` isn't possible.

### JWTAssertion

**Appears On**: [ClientAuthentication][]
Allows setting a [JWT Filter][] with custom settings on how to verify JWT obtained via the OAuth2 flow.

| **Field**                | **Type**                | **Description**                                                                                         |
|--------------------------|-------------------------|---------------------------------------------------------------------------------------------------------|
| `setClientID`            | `bool`                  | Whether to set the Client ID as an HTTP parameter; setting it as an HTTP parameter is optional (per RFC 7521 §4.2) because the Client ID is also contained in the JWT itself, but some identity providers document that they require it to also be set as an HTTP parameter anyway. |
| `audience`               | `string`                | This field is ignored when `grantType: "ClientCredentials"`. The audience your IDP requires for authentication. If not set then the default will be to use the token endpoint from the OIDC discovery document. |
| `signingMethod`          | [ValidAlgorithms][]     | The set of signing algorithms that can be considered when verifying tokens attached to requests. If the token is signed with an algorithm that is not in this list then it will be rejected. If not provided then all supported algorithms are allowed. The list should match the set configured in the iDP, as well as the full set of possible valid tokens maybe received. For example, if you may have previously supported RS256 & RS512 but you have decided to only receive tokens signed using RS512 now. This will cause existing tokens to be rejected. |
| `lifetime`               | [Duration][]            | This field is ignored when `grantType: "ClientCredentials"`. The lifetime of the generated JWT; just enough time for the request to the identity provider to complete (plus possibly an extra allowance for clock skew). |
| `setNBF`                 | `bool`                  | This field is ignored when `grantType: "ClientCredentials"`. Whether to set the optional "nbf" ("Not Before") claim in the generated JWT. |
| `nbfSafetyMargin`        | [Duration][]            | This field is only used when `setNBF: true` The safety margin to build-in to the "nbf" claim, to allow for clock skew between ambassador and the identity provider. |
| `setIAT`                 | `bool`                  | This field is ignored when `grantType: "ClientCredentials"`. Whether to set the optional "iat" ("Issued At") claim in the generated JWT. |
| `otherClaims`            | `[]byte` (Encoded JSON) | This field is ignored when `grantType: "ClientCredentials"`. Key/value pairs that will be add to the JWT sent for client Auth to the Identity Provider |
| `otherHeaderParameters`  | `[]byte` (Encoded JSON) | This field is ignored when `grantType: "ClientCredentials"`. Any extra JWT header parameters to include in the generated JWT non-standard claims to include in the generated JWT; only the "typ" and "alg" header parameters are set by default. |

### ValidAlgorithms

**Appears On**: [JWTAssertion][]
Valid Algorithms is an enum with quite a few entries, the possible values are:

- `"none"`
- **ECDSA Algorithms**: `"ES256"`, `"ES384"`, `"ES512"`
  - The secret must be a PEM-encoded Eliptic Curve private key
- **HMAC-SHA Algorithms**: `"HS256"`, `"HS384"`, `"HS512"`
  - The secret is a raw string of bytes; it can contain anything
- **RSA-PSS Algorithms**: `"PS256"`, `"PS384"`, `"PS512"`
  - The secret must be a PEM-encoded RSA private key
- **RSA Algorithms**: `"RS256"`, `"RS384"`, `"RS512"`
  - The secret must be a PEM-encoded RSA private key

### AuthorizationCodeSettings

**Appears On**: [OAuth2Filter][]
Specific settings that configure the `AuthorizationCode` grant type.

| **Field**          | **Type**            | **Description**                                                                                         |
|--------------------|---------------------|---------------------------------------------------------------------------------------------------------|
| `clientID`         | `string`            | The ID registered with the IdentityProvider for the client. |
| `clientSecret`     | `string`            | The secret registered with the IdentityProvider for the client. |
| `clientSecretRef`  | [SecretReference][] | Reference to a [Kubernetes Secret][] within the cluster that contains the secret registered with the IdentityProvider for the client. The Kubernetes Secret must of the `generic` type, with the value stored under the key `oauth2-client-secret` |
| `maxStale`         | [Duration][]        | How long to keep stale cached OIDC replies for. This sets the `max-stale` Cache-Control directive on requests, and also ignores the `no-store` and `no-cache` Cache-Control directives on responses. This is useful for maintaining good performance when working with identity providers with misconfigured Cache-Control. Note that if you MUST set `maxStale` as a consistent value on each `Filter` resource to get predictable caching behavior. |
| `insecureTLS`      | `bool`              | Tells the $productName$ to skip verifying the IdentityProvider server when communicating with the various endpoints. This is typically needed when using an IdentityProvider configured with self-signed certs. |
| `renegotiateTLS`   | `Enum` (`never`,`onceAsClient`,`freelyAsClient`)    | Sets whether the OAuth2 Filter will renegotiateTLS with the iDP server and if so what supported method of renegotiation will be used. |
| `protectedOrigins` | \[\][Origin][]      | This field is only used when `grantType: "AuthorizationCode"`. List of origins (domains) that the OAuth2 Filter is configured to protect. Setting multiple origins allows for protecting multiple domains using the same Session and Token that is retrieved from the Identity Provider. When setting multiple protected origins, the first origin will be used for the final redirect to the IdentityProvider therefore the identity provider needs to be configured to allow redirects from that origin. However, it is recommended that all protected origins are registered with the IdentityProvider because this is subject to change in the future. Only the scheme `(https://)` and authority `(example.com:1234)` parts are used; the path part of the URL is ignored. You will need to register each origin in `protectedOrigins` as an authorized callback endpoint with your identity provider. The URL will look like `{{ORIGIN}}/.ambassador/oauth2/redirection-endpoint`. |

> **Note**: If you provide more than one protectedOrigin, all share the same authentication system, so that logging into one origin logs you into all origins; to have multiple domains that have separate logins, use separate `Filters`.

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

**Note about `allowedInternalOrigins`**: This field is primarily used to allow you to tell $productName$ that there is another gateway
in front of $productName$ that rewrites the Host header, so that on the internal network between that gateway and $productName$, the
origin appears to be `allowedInternalOrigins` instead of `origin`. As a special-case the scheme and/or authority of the `allowedInternalOrigins`
may be `"*"`, which matches any scheme or any domain respectively.
Using `"*"` is most useful in configurations with exactly one protected origin; in such a configuration, $productName$ doesn't need
to know what the origin looks like on the internal network, just that a gateway in front of $productName$ is rewriting it.
It is invalid to use `"*"` with `includeSubdomains: true`.

For example, if you have a gateway in front of $productName$ handling traffic for `myservice.example.com`, terminating TLS and routing
that traffic to Ambassador with the name `ambassador.internal`, you might write:

```yaml
- origin: https://myservice.example.com
  allowedInternalOrigins:
  - http://ambassador.internal
```

or, to avoid being fragile to renaming ambassador.internal to something else, since there are not multiple origins that the `Filter` must
distinguish between, you could instead write:

```yaml
- origin: https://myservice.example.com
  allowedInternalOrigins:
  - "*://*"
```

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

- [OAuth2 design in $productName][]: Learn about how the OAuth2 system works
- [Using Oauth2 Filters][]: Use the OAuth2 Filter for authentication to protect access to services
  - [SSO with Auth0][]: Setup single sign on with Auth0
  - [SSO with Azure][]: Setup single sign on with Azure
  - [SSO with Google][]: Setup single sign on with Google
  - [SSO with Keycloak][]: Setup single sign on with Keycloak
  - [SSO with Okta][]: Setup single sign on with Okta
  - [SSO with OneLogin][]: Setup single sign on with OneLogin
  - [SSO with Salesforce][]: Setup single sign on with Salesforce
  - [SSO with UAA][]: Setup single sign on with UAA

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
[Using Oauth2 Filters]: ../../guides/sso/oauth2-sso
[OAuth2 design in $productName]: ../../design/oauth2
[SSO with Auth0]: ../../guides/sso/auth0
[SSO with Azure]: ../../guides/sso/azure
[SSO with Google]: ../../guides/sso/google
[SSO with Keycloak]: ../../guides/sso/keycloak
[SSO with Okta]: ../../guides/sso/okta
[SSO with OneLogin]: ../../guides/sso/onelogin
[SSO with Salesforce]: ../../guides/sso/salesforce
[SSO with UAA]: ../../guides/sso/uaa
[Go time.ParseDuration]: https://pkg.go.dev/time#ParseDuration
[Kubernetes secret]: https://kubernetes.io/docs/concepts/configuration/secret/
[OpenID Connect Discovery 1.0]: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
[metav1.Duration]: https://pkg.go.dev/k8s.io/apimachinery/pkg/apis/meta/v1#Duration
[OIDC Discovery]: https://openid.net/specs/openid-connect-discovery-1_0.html
