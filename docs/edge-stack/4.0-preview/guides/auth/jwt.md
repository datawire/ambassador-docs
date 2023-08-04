
# Using The JWT Filter

The `JWT Filter` performs JWT validation on a [bearer token][] present in the HTTP header. If the bearer token JWT doesn't validate
or has insufficient scope, an RFC 6750-complaint error response with a `www-authenticate` header is returned. The list of acceptable
signing keys is loaded from a JWK Set that is loaded over HTTP, as specified in the `Filter` configuration. Only RSA and `none`
algorithms are supported. The most common use case for `JWT Filter` is to run immediately after an [OAuth2 Filter][].
 See the [JWT Filter API reference][] for an overview of all the supported fields.

## Configure a JWT Filter and FilterPolicy

1. Create a [JWT Filter][]:

   The below JWT Filter uses an example endpoint for demonstration purposes along with the following JWT:

   ```bash
   eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwiZXh0cmEiOiJzbyBtdWNoIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.

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
   ```

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: jwt-filter
   spec:
     type: "jwt"
     jwt:
       jwksURI: "https://getambassador-demo.auth0.com/.well-known/jwks.json"
       validAlgorithms:
       - none
   EOF
   ```

2. Create a [FilterPolicy resource][] to use the `Filter` created above

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: FilterPolicy
   metadata:
     name: jwt-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filterRefs:
       - name: jwt-filter # Filter name from above
         namespace: default # Filter namespace from above
   EOF
   ```

3. Send a request without the token and watch it get denied

   ```console
   $ curl -kv http://34.123.30.63/backend/

   > GET /backend/ HTTP/1.1
   > Accept: */*
   >
   < HTTP/1.1 401 Unauthorized
   < content-type: application/json
   < content-length: 61
   < server: envoy
   <
   * Connection #0 to host 34.123.30.63 left intact
   {"message":"no Bearer token","requestId":"","statusCode":401}
   ```

4. Send the same request with the token

   ```console
   $ curl -kv http://34.123.30.63/backend/ -H "Authorization: bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwiZXh0cmEiOiJzbyBtdWNoIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."

   > GET /backend/ HTTP/1.1
   > Accept: */*
   > Authorization: bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwiZXh0cmEiOiJzbyBtdWNoIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
   >
   < HTTP/1.1 200 OK
   < content-type: application/json
   < content-length: 171
   < server: envoy
   <
   {
       "server": "buoyant-raspberry-ju848o1i",
       "quote": "Non-locality is the driver of truth. By summoning, we vibrate.",
       "time": "2023-08-04T04:48:49.119994222Z"
   }
   ```

   <Alert severity="success">
     <b>Success!</b> Your Services are now protected by Auth0 single sign-on using OAuth2 Filters!
   </Alert>

## Inject Request Headers From a JWT

1. Update the JWT Filter from the quickstart to add a bunch of request headers

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: jwt-filter
   spec:
     type: "jwt"
     jwt:
       jwksURI: "https://getambassador-demo.auth0.com/.well-known/jwks.json"
       validAlgorithms:
       - none
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
         # header of the same name.
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
   EOF
   ```

2. Make a request to the quote service's `/debug/` endpoint to see the request headers it gets:

   ```console
   $ curl -kv http://34.123.30.63/backend/debug/ -H "Authorization: bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwiZXh0cmEiOiJzbyBtdWNoIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."

     > GET /backend/debug/ HTTP/1.1
     > User-Agent: curl/8.1.1
     > Accept: */*
     > Authorization: bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwiZXh0cmEiOiJzbyBtdWNoIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
     >
     < HTTP/1.1 200 OK
     < content-type: application/json
     < server: envoy
     < transfer-encoding: chunked
     <
     {
         "server": "buoyant-raspberry-ju848o1i",
         "time": "2023-08-04T04:33:03.405944548Z",
         "method": "GET",
         "host": "34.123.30.63",
         "proto": "HTTP/1.1",
         "url": {
             "Scheme": "",
             "Opaque": "",
             "User": null,
             "Host": "",
             "Path": "/debug/",
             "RawPath": "",
             "ForceQuery": false,
             "RawQuery": "",
             "Fragment": ""
         },
         "remoteaddr": "10.128.0.52",
         "Headers": {
             "Accept": [
                 "*/*"
             ],
             "Authorization": [
                 "bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwiZXh0cmEiOiJzbyBtdWNoIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."
             ],
             "User-Agent": [
                 "curl/8.1.1"
             ],
             "X-Authorization": [
                 "Authenticated JWT; sub=1234567890; name=\"John Doe\""
             ],
             "X-Envoy-Expected-Rq-Timeout-Ms": [
                 "15000"
             ],
             "X-Envoy-Internal": [
                 "true"
             ],
             "X-Envoy-Original-Path": [
                 "/backend/debug/"
             ],
             "X-Fixed-String": [
                 "Fixed String"
             ],
             "X-Forwarded-For": [
                 "10.128.0.52"
             ],
             "X-Forwarded-Proto": [
                 "http"
             ],
             "X-Request-Id": [
                 "ac4c8073-af82-4525-9049-5659e507e7d5"
             ],
             "X-Token-C-Iat": [
                 "1.516239022e+09"
             ],
             "X-Token-C-Iat-Decimal": [
                 "1516239022"
             ],
             "X-Token-C-Name": [
                 "John Doe"
             ],
             "X-Token-C-Optional-Empty": [
                 "\u003cno value\u003e"
             ],
             "X-Token-C-Sub": [
                 "1234567890"
             ],
             "X-Token-H-Alg": [
                 "none"
             ],
             "X-Token-H-Extra": [
                 "so much"
             ],
             "X-Token-H-Typ": [
                 "JWT"
             ],
             "X-Token-S": [
                 ""
             ],
             "X-Token-String": [
                 "eyJhbGciOiJub25lIiwidHlwIjoiSldUIiwiZXh0cmEiOiJzbyBtdWNoIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."
             ],
             "X-Ua": [
                 "curl/8.1.1"
             ]
         },
         "Body": ""
     }
   ```

## Customize the error response

1. Update the JWT Filter from the quickstart to set a custom error response:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: jwt-filter
   spec:
     type: "jwt"
     jwt:
       jwksURI: "https://getambassador-demo.auth0.com/.well-known/jwks.json"
       validAlgorithms:
       - none
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
           }
   EOF
   ```

2. Send a curl without the header to trigger the error response

   ```console
     $ curl -kv http://34.123.30.63/backend/ -H "X-Correlation-ID: foo"

     > GET /backend/ HTTP/1.1
     > Accept: */*
     > X-Correlation-ID: foo
     >
     < HTTP/1.1 401 Unauthorized
     < content-type: application/json
     < x-correlation-id: foo
     < www-authenticate: Bearer realm="default.jwt-filter"
     < content-length: 96
     <
     {
         "errorMessage": "no Bearer token",
     }
   ```

[FilterPolicy resource]: ../../../custom-resources/filterpolicy
[JWT Filter API reference]: ../../../custom-resources/filter-jwt
[JWT Filter]: ../../../custom-resources/filter-jwt
[OAuth2 Filter]: ../../../custom-resources/filter-oauth2
[bearer token]: https://datatracker.ietf.org/doc/html/rfc6750
