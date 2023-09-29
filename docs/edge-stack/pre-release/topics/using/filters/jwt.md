import Alert from '@material-ui/lab/Alert';

# Using The JWT Filter

The JWT filter type performs JWT validation on a [bearer token](https://tools.ietf.org/html/rfc6750) present in the HTTP header.
If the bearer token JWT doesn't validate, or has insufficient scope, an RFC 6750-complaint error response with a `WWW-Authenticate`
header is returned.  The list of acceptable signing keys is loaded from a JWK Set that is loaded over HTTP, as specified in
`jwksURI`.  Only RSA and `none` algorithms are supported.

<br />

See the [JWT Filter API reference][] for an overview of all the supported fields.

## JWT path-specific arguments

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: FilterPolicy
metadata:
  name: "example-filter-policy"
  namespace: "example-namespace"
spec:
  rules:
  - host: "*"
    path: "*"
    filters:
    - name: "example-jwt-filter"
      arguments:
        scope:                    # optional; default is []
        - "scope-value-1"
        - "scope-value-2"
```

`scope` is a list of OAuth scope values that Edge Stack will require to be listed in the [`scope` claim](https://tools.ietf.org/html/draft-ietf-oauth-token-exchange-19#section-4.2).  In addition to the normal values of the `scope` claim (a JSON string containing a space-separated list of values), the JWT Filter also accepts a JSON array of values.

## Example configuration

```yaml
# Example results are for the JWT:
#
#    eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwiZXh0cmEiOiJzbyBtdWNoIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
#
# To save you some time decoding that JWT:
#
#   header = {
#     "alg": "none",
#     "typ": "JWT",
#     "extra": "so much"
#   }
#   claims = {
#     "sub": "1234567890",
#     "name": "John Doe",
#     "iat": 1516239022
#   }
---
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: example-jwt-filter
  namespace: example-namespace
spec:
  JWT:
    jwksURI: "https://getambassador-demo.auth0.com/.well-known/jwks.json"
    validAlgorithms:
      - "none"
    audience: "myapp"
    requireAudience: false
    injectRequestHeaders:
      - name: "X-Fixed-String"
        value: "Fixed String"
        # result will be "Fixed String"
      - name: "X-Token-String"
        value: "{{ .token.Raw }}"
        # result will be "eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwiZXh0cmEiOiJzbyBtdWNoIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."
      - name: "X-Token-H-Alg"
        value: "{{ .token.Header.alg }}"
        # result will be "none"
      - name: "X-Token-H-Typ"
        value: "{{ .token.Header.typ }}"
        # result will be "JWT"
      - name: "X-Token-H-Extra"
        value: "{{ .token.Header.extra }}"
        # result will be "so much"
      - name: "X-Token-C-Sub"
        value: "{{ .token.Claims.sub }}"
        # result will be "1234567890"
      - name: "X-Token-C-Name"
        value: "{{ .token.Claims.name }}"
        # result will be "John Doe"
      - name: "X-Token-C-Optional-Empty"
        value: "{{ .token.Claims.optional }}"
        # result will be "<no value>"; the header field will be set
        # even if the "optional" claim is not set in the JWT.
      - name: "X-Token-C-Optional-Unset"
        value: "{{ if hasKey .token.Claims \"optional\" | not }}{{ doNotSet }}{{ end }}{{ .token.Claims.optional }}"
        # Similar to "X-Token-C-Optional-Empty" above, but if the
        # "optional" claim is not set in the JWT, then the header
        # field won't be set either.
        #
        # Note that this does NOT remove/overwrite a client-supplied
        # header of the same name.  In order to distrust
        # client-supplied headers, you MUST use a Lua script to
        # remove the field before the Filter runs (see below).
      - name: "X-Token-C-Iat"
        value: "{{ .token.Claims.iat }}"
        # result will be "1.516239022e+09" (don't expect JSON numbers
        # to always be formatted the same as input; if you care about
        # that, specify the formatting; see the next example)
      - name: "X-Token-C-Iat-Decimal"
        value: "{{ printf \"%.0f\" .token.Claims.iat }}"
        # result will be "1516239022"
      - name: "X-Token-S"
        value: "{{ .token.Signature }}"
        # result will be "" (since "alg: none" was used in this example JWT)
      - name: "X-Authorization"
        value: "Authenticated {{ .token.Header.typ }}; sub={{ .token.Claims.sub }}; name={{ printf \"%q\" .token.Claims.name }}"
        # result will be: "Authenticated JWT; sub=1234567890; name="John Doe""
      - name: "X-UA"
        value: "{{ .httpRequestHeader.Get \"User-Agent\" }}"
        # result will be: "curl/7.66.0" or
        # "Mozilla/5.0 (X11; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0"
        # or whatever the requesting HTTP client is
    errorResponse:
      headers:
      - name: "Content-Type"
        value: "application/json"
      - name: "X-Correlation-ID"
        value: "{{ .httpRequestHeader.Get \"X-Correlation-ID\" }}"
      # Regarding the "altErrorMessage" below:
      #   ValidationErrorExpired = 1<<4 = 16
      # https://godoc.org/github.com/dgrijalva/jwt-go#StandardClaims
      bodyTemplate: |-
        {
            "errorMessage": {{ .message | json "    " }},
            {{- if .error.ValidationError }}
            "altErrorMessage": {{ if eq .error.ValidationError.Errors 16 }}"expired"{{ else }}"invalid"{{ end }},
            "errorCode": {{ .error.ValidationError.Errors | json "    "}},
            {{- end }}
            "httpStatus": "{{ .status_code }}",
            "requestId": {{ .request_id | json "    " }}
        }
---
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
spec:
  config:
    lua_scripts: |
      function envoy_on_request(request_handle)
        request_handle:headers():remove("x-token-c-optional-unset")
      end
```

[JWT Filter API reference]: ../../../../custom-resources/getambassador.io/v3alpha1/filter-jwt
