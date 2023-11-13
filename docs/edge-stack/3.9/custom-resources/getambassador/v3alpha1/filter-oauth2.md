import Alert from '@material-ui/lab/Alert';

# The **OAuth2 Filter** Type (v3alpha1)

The OAuth2 Filter type performs OAuth2 authorization against an identity provider implementing [OIDC Discovery][].

<br />

This doc is an overview of all the fields on the `OAuth2 Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
This page is specific to the `getambassador.io/v3alpha1` version of the `OAuth2 Filter` resource. For the newer `gateway.getambassador.io/v1alpha1` resource,
please see [the v1alpha1 OAuth2 Filter api reference][].

<Alert severity="info">
    <code>v3alpha1</code> <code>Filters</code> can only be referenced from <code>v3alpha1</code> <code>FilterPolicies</code>.
</Alert>

## OAuth2 Filter API Reference

To create an OAuth2 Filter, the `spec.type` must be set to `oauth2`, and the `oauth2` field must contain the configuration for your
OAuth2 filter.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: "example-oauth2-filter"
  namespace: "example-namespace"
spec:
  ambassador_id: []string                  # optional
  OAuth2: OAuth2                           # required
    authorizationURL: string               # required

    #------------------------------------------------------------------#
    # OAuth Client settings                                            #
    #------------------------------------------------------------------#
    expirationSafetyMargin: Duration       # optional
    grantType: Enum                        # optional, default="AuthorizationCode"
    clientAuthentication:                  # optional
      method: "enum"                       # optional, default="HeaderPassword"
      jwtAssertion:                        # optional if `method: "JWTAssertion"`, forbidden otherwise
        setClientID: bool                  # optional, default=false
        audience: string                   # optional, default is to use the token endpoint from the authorization URL
        signingMethod: Enum                # optional, default="RS256"
        lifetime: Duration                 # optional, default="1m"
        setNBF: bool                       # optional, default=false
        nbfSafetyMargin: Duration          # optional, default=0s
        setIAT: bool                       # optional, default=false
        otherClaims:                       # optional, default={}
          "string": anything
        otherHeaderParameters:             # optional; default={}
          "string": anything

    ## OAuth Client settings when `grantType: "AuthorizationCode"`
    clientURL: string                      # deprecated, use 'protectedOrigins' instead
    protectedOrigins: []ProtectedOrigin    # required, minItems: 1
    - origin: string                       # required
      internalOrigin: string               # optional, default is to just use the 'origin' field
      includeSubdomains: bool              # optional, default=false
    useSessionCookies:                     # optional, default={ value: false }
      value: bool                          # optional, default=true
      ifRequestHeader:                     # optional, default to apply "useSessionCookies.value" to all requests
        name: string                       # required
        negate: bool                       # optional, default=false
        value: string                      # optional, default is any non-empty string
        valueRegex: string                 # optional, default is any non-empty string
    clientSessionMaxIdle: Duration         # optional, default is to use the access token lifetime or 14 days if a refresh token is present
    postLogoutRedirectURI: string          # optional
    extraAuthorizationParameters: map[string]string  # optional, default={}
      "string": "string"

    ## OAuth Client settings when `grantType: "AuthorizationCode"/"Password"`
    clientID: string                       # required
    secret: string                         # required (unless secretName is set)
    secretName: string                     # required (unless secret is set)
    secretNamespace: string                # optional, default is the same namespace as the Filter

    #------------------------------------------------------------------#
    # OAuth Resource Server settings                                   #
    #------------------------------------------------------------------#
    allowMalformedAccessToken: bool        # optional, default=false
    accessTokenValidation: Enum            # optional, default="auto"
    accessTokenJWTFilter:                  # optional
      name: string                         # required
      namespace: string                    # optional, default is the same namespace as the Filter
      inheritScopeArgument: bool           # optional, default=false
      stripInheritedScope: bool            # optional, default=false
      arguments: JWTFilterArguments        # optional
    injectRequestHeaders:                  # optional
    - name: string                         # required
      value: string                        # required

    #------------------------------------------------------------------#
    # HTTP client settings for talking with the identity provider      #
    #------------------------------------------------------------------#
    insecureTLS: bool                      # optional, default=false
    renegotiateTLS: Enum                   # optional, default="never"
    maxStale: Duration                     # optional, default="0"
```

### OAuth2Filter

| **Field**                     | **Type**                      | **Description**                                                                                                                                                  |
|-------------------------------|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `authorizationURL`            | `string`                      | Identity Provider Issuer URL which hosts the OpenID provider well-known configurartion. The URL must be an absolute URL. Per [OpenID Connect Discovery 1.0][] the configuration must be provided in a json document at the path `/.well-known/openid-configuration`. This is used by the OAuth2 Filter for determining things like the AuthorizationEndpoint, TokenEndpoint, JWKs endpint, etc... |
| `expirationSafetyMargin`      | [Duration][]                  | Sets a buffer to check if the Token is expired or is going to expire within the safety margin. This is to ensure the application has enough time to reauthenticate to adjust for clock skew and network latency. By default, no safety margin is added. If a token is received with an expiration less than this field, then the token is considered to already be expired. |
| `grantType`                   | `Enum`(`"AuthorizationCode"`,`"ClientCredentials"`,`"Password"`,`"ResourceOwner"`) | Sets the Authorization Flow that the filter will use to authenticate the incoming request. |
| `clientAuthentication`        | [ClientAuthentication][]      | Defines how the OAuth2 Filter will authenticate with the iDP token endpoint. By default, it will pass it along as password in the Authentication header. Depending on how your iDP is configured it might require a JWTAssertion or passing the password. |
| `protectedOrigins`            | \[\][ProtectedOrigin][]       | (You determine these, and must register them with your identity provider) Identifies hostnames that can appropriately set cookies for the application.  Only the scheme (`https://`) and authority (`example.com:1234`) parts are used; the path part of the URL is ignored |
| `useSessionCookies`           | [SessionCookies][]             | By default, any cookies set by $productName$ will be set to expire when the session expires naturally. `useSessionCookies` may be used to cause session cookies to be used instead |
| `clientSessionMaxIdle`        | [Duration][]                  | Controls how long the session held by $productName$'s OAuth client will last until we automatically expire it. $productName$ creates a new session when submitting requests to the upstream backend server and sets a cookie containing the sessionID. When a user makes a request to a backend service protected by the OAuth2 Filter, the OAuth Client in Ambassador Edge Stack will use the sessionID contained in the cookie to fetch the access token (and optional refresh token) for the current session so that it can be used when submitting a request to the upstream backend service. This session has a limited lifetime before it expires or extended, prompting the user to log back in. Setting a `clientSessionMaxIdle` duration is useful when your IdP is configured to return a refresh token along with an access token from your IdP's authorization server. `clientSessionMaxIdle` can be set to match Ambassador Edge Stack OAuth client's session lifetime to the lifetime of the refresh token configured within the IdP. If this is not set, then we tie the OAuth client's session lifetime to the lifetime of the access token received from the IdP's authorization server when no refresh token is also provided. If there is a refresh token, then by default we set it to be 14 days |
| `postLogoutRedirectURI`       | `string`                      | Set this field to a valid URL to have $productName$ redirect there upon a successful logout. You must register the following endpoint with your IDP as the Post Logout Redirect `{{ORIGIN}}/.ambassador/oauth2/post-logout-redirect`. This informs your IDP to redirect back to $productName$ once the IDP has cleared the session data. Once the IDP has redirected back to $productName$, this clears the local $productName$ session information before redirecting to the destination specified by the `postLogoutRedirectURI` value. If Post Logout Redirect is configured in your IDP to `{{ORIGIN}}/.ambassador/oauth2/post-logout-redirect` then, after a successful logout, a redirect is issued to the URL configured in `postLogoutRedirectURI`. If `{{ORIGIN}}/.ambassador/oauth2/post-logout-redirect` is configured as the Post Logout Redirect in your IDP, but `postLogoutRedirectURI` is not configured in $productName$, then your IDP will error out as it will be expecting specific instructions for the post logout behavior. Refer to your IDP’s documentation to verify if it supports Post Logout Redirects. For more information on `post_logout_redirect_uri functionality`, refer to the [OpenID Connect RP-Initiated Logout 1.0 specs](https://openid.net/specs/openid-connect-rpinitiated-1_0.html) |
| `extraAuthorizationParameters`| `map`\[`string`\]`string`     | Extra (non-standard or extension) OAuth authorization parameters to use.  It is not valid to specify a parameter used by OAuth itself ("response_type", "client_id", "redirect_uri", "scope", or "state") |
| `clientID`                    | `string`                      | The Client ID you get from your identity provider |
| `secret`                      | `string`                      | The client secret you get from your identity provider as a string. It is invalid to configure both `secret` and `secretName` |
| `secretName`                  | `string`                      | The client secret you get from your identity provider as a Kubernetes `generic` Secret, named by `secretName`/`secretNamespace`.  The Kubernetes secret must of the `generic` type, with the value stored under the key`oauth2-client-secret`.  If `secretNamespace` is not given, it defaults to the namespace of the Filter resource. It is invalid to configure both `secret` and `secretName` |
| `secretNamespace`             | `string`                      | The client secret you get from your identity provider as a Kubernetes `generic` Secret, named by `secretName`/`secretNamespace`.  The Kubernetes secret must of the `generic` type, with the value stored under the key`oauth2-client-secret`.  If `secretNamespace` is not given, it defaults to the namespace of the Filter resource. It is invalid to configure both `secret` and `secretName` |
| `allowMalformedAccessToken`   | `bool`                        | Allow any access token, even if they are not RFC 6750-compliant. |
| `accessTokenValidation`       | `Enum`(`"jwt"`,`"userinfo"`,`"auto"`)     | How to verify the liveness and scope of Access Tokens issued by the identity provider. Empty or unset is equivalent to `"auto"` |
| `accessTokenJWTFilter`        | [AccessTokenJWTFilter][]      | Used to identify a JWT Filter to use for validating access token JWTs.  It is an error to point at a Filter that is not a JWT filter |
| `injectRequestHeaders`        | \[\][AddHeaderTemplate][]         | injects HTTP header fields in to the request before sending it to the upstream service; where the header value can be set based on the JWT value. If an OAuth2 filter is chained with a JWT filter with `injectRequestHeaders` configured, both sets of headers will be injected. If the same header is injected in both filters, the OAuth2 filter will populate the value. The value is specified as a Go `text/template` string |
| `insecureTLS`                 | `bool`                        | disables TLS verification when speaking to an identity provider with an `https://` `authorizationURL`.  This is discouraged in favor of either using plain `http://` or [installing a self-signed certificate][] |
| `renegotiateTLS`              | `Enum`(`"never"`,`"onceAsClient"`,`"freelyAsClient"`) | Allows a remote server to request TLS renegotiation |
| `maxStale`                    | [Duration][]                  | How long to keep stale cached OIDC replies for. This sets the `max-stale` Cache-Control directive on requests, and also **ignores the `no-store` and `no-cache` Cache-Control directives on responses**.  This is useful for maintaining good performance when working with identity providers with misconfigured Cache-Control. Setting to 0 means that it will default back to the identity provider's default cache settings as specified by the Cache-Control directives on responses which may include no caching depending if the identity provider sets the `no-cache` and `no-store` directives. Note that if you are reusing the same `authorizationURL` and `jwksURI` across different OAuth and JWT filters respectively, then you MUST set `maxStale` as a consistent value on each filter to get predictable caching behavior |

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

Duration is a field that accepts a string that will be parsed as a sequence of decimal numbers ([metav1.Duration][]), each with optional fraction
and a unit suffix, such as `"300ms"`, `"1.5h"` or `"2h45m"`. Valid time units are `"ns"`, `"us"` (or `"µs"`), `"ms"`, `"s"`,
`"m"`, `"h"`. See [Go time.ParseDuration][].

### ClientAuthentication

Configures how Ambassador uses the `clientID` and `secret` to authenticate itself to the identity provider

| **Field**      | **Type**                         | **Description**                                                                                         |
|----------------|----------------------------------|---------------------------------------------------------------------------------------------------------|
| `method`       | `Enum`(`"HeaderPassword"`,`"BodyPassword"`,`"JWTAssertion"`) | Defines the type of client authentication that will be used |
| `jwtAssertion` | [JWTAssertion][] | This field is only used when `method: "JWTAssertion"`. Allows setting a [JWT Filter][] with custom settings on how to verify JWT obtained via the OAuth2 flow. |

`method` options:

- `"HeaderPassword"`: Treat the client secret as a password, and pack that in to an HTTP header for HTTP Basic authentication.
- `"BodyPassword"`: Treat the client secret as a password, and put that in the HTTP request bodies submitted to the identity provider. This is NOT RECOMMENDED by RFC 6749, and should only be used when using `HeaderPassword` isn't possible.
- `"JWTAssertion"`: Treat the client secret as a password, and put that in the HTTP request bodies submitted to the identity provider. This is NOT RECOMMENDED by RFC 6749, and should only be used when using `HeaderPassword` isn't possible.

### JWTAssertion

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

### ProtectedOrigin

You determine these, and must register them with your identity provider. Identifies hostnames that can
appropriately set cookies for the application.  Only the scheme (`https://`) and authority (`example.com:1234`) parts are used; the
path part of the URL is ignored. You will need to register each origin in `protectedOrigins` as an authorized callback endpoint with your identity provider. The URL
will look like `{{ORIGIN}}/.ambassador/oauth2/redirection-endpoint`.
<!-- If you're looking at the above sentence and thinking "that's
not correct!" (as I was): Yes, it's a lie that you need to register
each one; you only need to register the first one, but support has
the strong opinion that it's much simpler to just tell people
register all of them.  Plus that gives us more flexibility for
future changes.  So leave the lie.  -->

<br />

If you provide more than one `protectedOrigin`, all share the same
authentication system, so that logging into one origin logs you
into all origins; to have multiple domains that have separate
logins, use separate `Filter`s.

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
that traffic to $productName$ with the name `example.internal`, you might write:

```yaml
- origin: https://myservice.example.com
  allowedInternalOrigins:
  - http://example.internal
```

or, to avoid being fragile to renaming example.internal to something else, since there are not multiple origins that the `Filter` must
distinguish between, you could instead write:

```yaml
- origin: https://myservice.example.com
  allowedInternalOrigins:
  - "*://*"
```

### AddHeaderTemplate

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

### SessionCookies

By default, any cookies set by the $productName$ will be set to expire when the session expires naturally. The
`useSessionCookies` setting may be used to cause session cookies to be used instead.

<br />

- Normally cookies are set to be deleted at a specific time; session cookies are deleted whenever the user closes their web
browser.  This may mean that the cookies are deleted sooner than normal if the user closes their web browser; conversely, it may
mean that cookies persist for longer than normal if the use does not close their browser.
- The cookies being deleted sooner may or may not affect user-perceived behavior, depending on the behavior of the identity provider.
- Any cookies persisting longer will not affect behavior of the system; Ambassador Edge Stack validates whether the session is expired when considering the cookie.

If `useSessionCookies` is non-`null`, then:

- By default it will have the cookies for all requests be session cookies or not according to the `useSessionCookies.value` sub-argument.
- Setting the `useSessionCookies.ifRequestHeader` sub-argument tells it to use `useSessionCookies.value` for requests that match the condition, and `!useSessionCookies.value` for requests don't match.

When determining if a request matches, it looks at the HTTP header field named by `useSessionCookies.ifRequestHeader.name` (case-insensitive), and checks if it is either set to (if `useSessionCookies.ifRequestHeader.negate: false`) or not set to (if `useSessionCookies.ifRequestHeader.negate: true`)...

- a non-empty string (if neither `useSessionCookies.ifRequestHeader.value` nor `useSessionCookies.ifRequestHeader.valueRegex` are set)
- the exact string `value` (case-sensitive) (if `useSessionCookies.ifRequestHeader.value` is set)
- a string that matches the regular expression `useSessionCookies.ifRequestHeader.valueRegex` (if `valueRegex` is set).  This uses [RE2][] syntax (always, not obeying `regex_type` in the `Module`) but does not support the `\C` escape sequence.
- (it is invalid to have both `value` and `valueRegex` set)

| **Field**         | **Type**                  | **Description**                                                                   |
|-------------------|---------------------------|-----------------------------------------------------------------------------------|
| `value`           | `bool`                    |
| `ifRequestHeader` | [HTTPHeaderMatch][]       |

### HTTPHeaderMatch

Checks if exact or regular expression matches a value in a request Header to determine if an individual Filter is executed or not.

| **Field**    | **Type**                                | **Description**                                                                   |
|--------------|-----------------------------------------|-----------------------------------------------------------------------------------|
| `name`       | `string`                                | Name of the header to match. Matching MUST be case insensitive. (See [https://tools.ietf.org/html/rfc7230][]). Valid examples: `"Authorization"`/`"Set-Cookie"`. Invalid examples: `":method"` - `:` is an invalid character. This means that HTTP/2 pseudo headers are not currently supported by this type. `"/invalid"` - `/` is an invalid character. |
| `value`      | `string`                                | Value of the HTTP Header to be matched. Only one of `value` or `valueRegex` can be configured |
| `valueRegex` | `string`                                | Regex expression for matching the value of the HTTP Header. Only one of `value` or `valueRegex` can be configured. This uses [RE2][] syntax (always, not obeying `regex_type` in the `ambassador Module`) but does not support the `\C` escape sequence. |
| `negate`     | `bool`                                  | Allows the match criteria to be negated or flipped. For example, you can have a regex that checks for any non-empty string which would indicate would translate to if header exists on request then match on it. With negate turned on this would translate to match on any request that doesn't have a header. |

### AccessTokenJWTFilter

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

Defines the input arguments that can be set for a JWTFilter.

| **Field**  | **Type**    | **Description**                                                                                         |
|------------|-------------|---------------------------------------------------------------------------------------------------------|
| `scope`    | `[]string`  | A list of OAuth scope values to include in the scope of the authorization request. If one of the scope values for a path is not granted, then access to that resource is forbidden; if the `scope` argument lists `foo`, but the authorization response from the provider does not include `foo` in the scope, then it will be taken to mean that the authorization server forbade access to this path, as the authenticated user does not have the `foo` resource scope. |

**Some notes about `scope`**:

- If `grantType: "AuthorizationCode"`, then the `openid` scope value is always included in the requested scope, even if it is not listed.
- If `grantType: "ClientCredentials"` or `grantType: "Password"`, then the default scope is empty. If your identity provider does not have a default scope, then you will need to configure one here.
- As a special case, if the `offline_access` scope value is requested, but not included in the response then access is not forbidden. With many identity providers, requesting the `offline_access` scope is necessary to receive a Refresh Token.
- The ordering of scope values does not matter, and is ignored.

[AddHeaderTemplate]: #addheadertemplate
[Oauth2Filter]: #oauth2filter
[AccessTokenJWTFilter]: #accesstokenjwtfilter
[ClientAuthentication]: #clientauthentication
[JWTArguments]: #jwtarguments
[HTTPHeaderMatch]: #httpheadermatch
[JWTAssertion]: #jwtassertion
[ValidAlgorithms]: #validalgorithms
[ProtectedOrigin]: #protectedorigin
[SessionCookies]: #sessioncookies
[Duration]: #duration
[installing a self-signed certificate]: ../../../../topics/using/filters/#filters-using-self-signed-certificates
[JWT Filter]: ../filter-jwt
[the v1alpha1 OAuth2 Filter api reference]: ../../../gateway-getambassador/v1alpha1/filter-oauth2
[Go time.ParseDuration]: https://pkg.go.dev/time#ParseDuration
[OpenID Connect Discovery 1.0]: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
[metav1.Duration]: https://pkg.go.dev/k8s.io/apimachinery/pkg/apis/meta/v1#Duration
[OIDC Discovery]: https://openid.net/specs/openid-connect-discovery-1_0.html
[https://tools.ietf.org/html/rfc7230]: https://tools.ietf.org/html/rfc7230
[RE2]: https://github.com/google/re2/wiki/Syntax
