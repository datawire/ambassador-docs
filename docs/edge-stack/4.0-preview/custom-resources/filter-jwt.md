import Alert from '@material-ui/lab/Alert';

# The **JWT Filter** Type

The `JWT Filter` performs JWT validation on a [bearer token][] present in the HTTP header. If the bearer token JWT doesn't validate,
or has insufficient scope, an RFC 6750-complaint error response with a `www-authenticate` header is returned. The list of acceptable
signing keys is loaded from a JWK Set that is loaded over HTTP, as specified in the `Filter` configuration. Only RSA and `none`
algorithms are supported.

This doc is an overview of all the fields on the JWT `Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
Tutorials and guides for the JWT `Filter` Resource can be found in the [usage guides section][]

## JWT Filter API Reference

To create a JWT Filter, the `spec.type` must be set to `jwt`, and the `jwt` field must contain configuration for your
JWT Filter.

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: Filter
metadata:
  name: "example-jwt-filter"
  namespace: "example-namespace"
spec:
  type: "jwt"                                   # required
  jwt: JWTFilter                                # required when `type: "jwt"`
    jwksURI: string                             # optional, required unless `validAlgorithms: ["none"]`
    validAlgorithms: []Enum                     # optional, default is all supported algos except for `"none"`
    audience: string                            # optional (unless requireAudience: `true`)
    requireAudience: bool                       # optional, default: `false`
    issuer: string                              # optional (unless requireIssuer: `true`)
    requireIssuer: bool                         # optional, default: `false`
    requireExpiresAt: bool                      # optional, default: `false`
    leewayForExpiresAt: Duration                # optional
    requireNotBefore: bool                      # optional, default: `false`
    leewayForNotBefore: Duration                # optoinal
    requireIssuedAt: bool                       # optional, default: `false`
    leewayForIssuedAt: Duration                 # optional
    injectRequestHeaders: []AddHeaderTemplate   # optional
    - name: string                              # required
      value: string (GoLang Template)           # required
    maxStale: Duration                          # optional
    insecureTLS: bool                           # optional, default: `false`
    renegotiateTLS: Enum                        # optional, default: `"never"`
    errorResponse: CustomErrorResponse          # optional
      realm: string                             # optional, default is {name}.{namespace} of the JWT Filter
      bodyTemplate: string (GoLang Template)    # optional
      headers: []AddHeaderTemplate              # optional, max 16 items
      - name: string                            # required
        value: string (GoLang Template)         # required
status: []metav1.Condition                      # field managed by controller
```

### JWTFilter

| **Field**              | **Type**               | **Description**                                                                                                                                                  |
|------------------------|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  `jwksURI`              | `string`                                         | A URI that returns the JWK Set per RFC 7517. This is required unless validAlgorithms=["none"], in that case verifying the signature of the token is disabled. This is considered unsafe and is discouraged when receiving tokens from untrusted sources. |
  `validAlgorithms`      | \[\][ValidAlgorithms][](`Enum`)                  | The set of signing algorithms that can be considered when verifying tokens attached to requests. If the token is signed with an algorithm that is not in this list then it will be rejected. If not provided then all supported algorithms are allowed. The list should match the set configured in the iDP, as well as the full set of possible valid tokens maybe received. For example, if you may have previously supported RS256 & RS512 but you have decided to only receive tokens signed using RS512 now. This will cause existing tokens to be rejected. |
  `audience`             | `string`                                         | Identifies the recipient that the JWT is intended for and will be used to validate the provided token is intended for the configured audience. If not provided then `aud` claim on incoming token is not validated and will be considered valid. If `aud` is unset on the token by default it will be considered valid even if it doesn't match the audience value. To enforce that a token has the aud claim, then set `requireAudience: true`. |
  `requireAudience`      | `bool`                                           | Modifies the validation behavior for when the audience claim (aud) is unset on the incoming token. `false` (default) => if aud claim is unset then claim is considered valid. `true` => if aud claim is unset then claim/token are invalid |
  `issuer`               | `string`                                         | Identifies the expected AuthorizationServer that isssued the token. If not provided then the issuer claim will not be validated. If `issuer` is unset on the token by default it will be considered valid even if it doesn't match the expected issuer value. To enforce that a token has the issuer claim, then set `requireIssuer: true`. |
  `requireIssuer`        | `bool`                                           | Modifies the validation behavior for when the issuer claim (iss) is unset on the incoming token. `false` (default) => if aud claim is unset on incoming token then claim is considered valid `true` => if exp claim is unset then claim is invalid |
  `requireExpiresAt`     | `bool`                                           | Modifies the validation behavior for when the expiresAt claim (exp) is unset on the incoming token. `false` (default) => if exp claim is unset on incoming token then claim is valid `true` => if exp claim is unset then claim/token are invalid |
  `leewayForExpiresAt`   | [Duration][]                                     | Allows token expired by this much to still be considered valid. It is recommend that this is small, so that it only accounts for clock skew and network/application latency. |
  `requireNotBefore`     | `bool`                                           | Modifies the validation behavior for when the not before time claim (nbf) is unset on the incoming token. `false` (default) => if `nbf` claim is unset on incoming token then claim is valid `true` => if `nbf` claim is unset then claim/token are invalid |
  `leewayForNotBefore`   | [Duration][]                                     | Allows tokens that shouldn't be used until this much in the future to be considered valid. It is recommend that this is small, so that it only accounts for clock skew and network/application latency. |
  `requireIssuedAt`      | `bool`                                           | Modifies the validation behavior for when the issuedAt claim (iat) is unset on the incoming token. `false` (default) => if `iat` claim is unset on incoming token then claim is valid `true` => if `iat` claim is unset then claim/token are invalid |
  `leewayForIssuedAt`    | [Duration][]                                     | Allows tokens issued by this much into the future to be considered valid. It is recommend that this is small, so that it only accounts for clock skew and network/application latency. |
  `injectRequestHeaders` | \[\][AddHeaderTemplate][]                        | List of headers that will be injected into the upstream request if allowed through. The headers can pull information from the Token and downstream request headers as values. For example, attaching user email claim to a header from the token. |
  `maxStale`             | [Duration][]                                     | Sets the duration that JWKs keys and OIDC discovery responses will be cached, ignoring any caching headers when configured |
  `insecureTLS`          | `bool`                                           | Disables TLS verification for cases when jwksURI begins with `https://`. |
  `renegotiateTLS`       | `Enum` (`never`,`onceAsClient`,`freelyAsClient`) | Sets whether the JWTFilter will renegotiateTLS with the `jwksURI` server and if so what supported method of renegotiation will be used. |
  `errorResponse`        | [CustomErrorResponse][]                          | Allows setting a custom Response to the downstream client when an invalid JWT is received. |

### Duration

**Appears On**: [JWTFilter][]
Duration is a field that accepts a string that will be parsed as a sequence of decimal numbers ([metav1.Duration][]), each with optional fraction
and a unit suffix, such as `"300ms"`, `"1.5h"` or `"2h45m"`. Valid time units are `"ns"`, `"us"` (or `"µs"`), `"ms"`, `"s"`,
`"m"`, `"h"`. See [Go time.ParseDuration][].

### ValidAlgorithms

**Appears On**: [JWTFilter][]
The set of signing algorithms that can be considered when verifying tokens attached to requests. If the token is signed with an algorithm that is not
in this list then it will be rejected. If not provided then all supported algorithms are allowed. The list should match the set configured in the iDP,
as well as the full set of possible valid tokens maybe received. For example, if you may have previously supported RS256 & RS512 but you have decided
to only receive tokens signed using RS512 now. This will cause existing tokens to be rejected.

Valid Algorithms is an enum with quite a few entries, the possible values are:

- `"none"`
- **ECDSA Algorithms**: `"ES256"`, `"ES384"`, `"ES512"`
- **HMAC-SHA Algorithms**: `"HS256"`, `"HS384"`, `"HS512"`
- **RSA-PSS Algorithms**: `"PS256"`, `"PS384"`, `"PS512"`
- **RSA Algorithms**: `"RS256"`, `"RS384"`, `"RS512"`

### AddHeaderTemplate

**Appears On**: [JWTFilter][]
List of headers that will be injected into the upstream request if allowed through. The headers can pull information from the Token and downstream
request headers as values. For example, attaching user email claim to a header from the token.

| **Field**  | **Type**                       | **Description**                                                                                         |
|------------|--------------------------------|---------------------------------------------------------------------------------------------------------|
| `name`     | `string`                       | The name of the header to inject `value` into                                                           |
| `value`    | `string` (GoLang Template)     | A Golang template that can dynamically extract request information as the value of the injected header. |

`value` is the value of the header to set and is evaluated as a special GoLang Template.
This allows the header value to be set based on the JWT value. The value is specified as a [Go text/template string][],
with the following data made available to it:

- `.token.Raw` → The raw JWT (`string`)
- `.token.Header` → The JWT header, as parsed JSON (`map[string]interface{}`)
- `.token.Claims` → The JWT claims, as parsed JSON (`map[string]interface{}`)
- `.token.Signature` → The token signature (`string`)
- `.httpRequestHeader` → `http.Header` a copy of the header of the incoming HTTP request. Any changes to `.httpRequestHeader` (such as by using using `.httpRequestHeader.Set`) have no effect. It is recommended to use `.httpRequestHeader.Get` instead of treating it as a map, in order to handle capitalization correctly.

Also available to the template are [the standard functions available to Go text/templates][], as well as:

- a `hasKey` function that takes the a string-indexed map as arg1, and returns whether it contains the key arg2. (This is the same as [the Sprig function of the same name][].)
- a `doNotSet` function that causes the result of the template to be discarded, and the header field to not be adjusted. This is useful for only conditionally setting a header field; rather than setting it to an empty string or `"<no value>"`. Note that this does not unset an existing header field of the same name and could be a potential security vulnerability depending on how this is used if an untrusted client spoofs these headers.

<Alert severity="info">
  Any headers listed will override (not append to) the original request header with that name.
</Alert>

### CustomErrorResponse

**Appears On**: [JWTFilter][]
Allows setting a custom Response to the downstream client when an invalid JWT is received.

| **Field**              | **Type**                    | **Description**                                                                                                                                                  |
|------------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `realm`                | `string`                    | Indicates the scope of protection or the application that is checking the token. By default, this is set to the fully qualified name of the `JWT Filter` as `"{name}.{namespace}"` to identify which filter rejected the error. This can be overriden to provide more relevant information to end-users. |
| `bodyTemplate`         | `string` (GoLang Template)  | Golang `text/template` string that will be evaluated and used to build the format returned. |
| `headers`              | \[\][AddHeaderTemplate][]   | Allows providing additional http response headers for the error response. The current maximum is 16 headers, which aligns with the Gateway-API and modified headers on HTTPRoutes. |

`bodyTemplate` specifies body of the error response returned to the downstream client; specified as a [Go text/template string][],
with the following data made available to it:

- `.status_code` → The HTTP status code to be returned (`int`)
- `.httpStatus` → An alias for .status_code (`int`, hidden from `{{ . | json "" }}`)
- `.message` → The error message (`string`)
- `.error` → The raw Go error object that generated .message (`error`, hidden from `{{ . | json "" }}`)
- `.error.ValidationError` → The JWT validation error, will be nil if the error is not purely JWT validation (`jwt.ValidationError` insufficient scope, malformed or missing Authorization header)
- `.request_id` → The Envoy request ID, for correlation (`string`, hidden from `{{ . | json "" }}` unless `.status_code` is in the `5xx` range)
- `.requestId` → An alias for .request_id (`string`, hidden from `{{ . | json "" }}`)

Also availabe to the template are [the standard functions available to Go text/templates][], as well as:

- A `json` function that formats arg2 as JSON, using the arg1 string as the starting indentation. For example, the template `{{ json "indent>" "value" }}` would yield the string `indent>"value"`.

## JWT Filter Usage Guides

- [Using JWT Filters][] - Use the JWT Filter to validate and process JWTs on requests
- [Chaining Oauth2 and JWT Filters][] - Learn how to combine Filters for Oauth2 and JWT processing

[JWTFilter]: #jwtfilter
[ValidAlgorithms]: #validalgorithms
[AddHeaderTemplate]: #addheadertemplate
[CustomErrorResponse]: #customerrorresponse
[usage guides section]: #jwt-filter-usage-guides
[Duration]: #duration
[Using JWT Filters]: ../../guides/auth/jwt
[Chaining Oauth2 and JWT Filters]: ../../guides/auth/oauth2-and-jwt
[bearer token]: https://datatracker.ietf.org/doc/html/rfc6750
[Go text/template string]: https://pkg.go.dev/text/template
[the standard functions available to Go text/templates]: https://pkg.go.dev/text/template#hdr-Functions
[the Sprig function of the same name]: https://masterminds.github.io/sprig/dicts.html#haskey
[metav1.Duration]: https://pkg.go.dev/k8s.io/apimachinery/pkg/apis/meta/v1#Duration
[Go time.ParseDuration]: https://pkg.go.dev/time#ParseDuration
