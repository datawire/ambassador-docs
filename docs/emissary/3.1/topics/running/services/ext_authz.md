# ExtAuth protocol

By design, the ExtAuth protocol used by [the AuthService](../auth-service) and by [External Filters](/docs/edge-stack/latest/topics/using/filters/external) is highly flexible. The authentication service is the first external service invoked on an incoming request (e.g., it runs before the rate limit filter). Because the logic of authentication is encapsulated in an external service, you can use this to support a wide variety of use cases. For example:

* Supporting traditional SSO authentication protocols, e.g., OAuth, OpenID Connect, etc.
* Supporting HTTP basic authentication ([see a sample implementation](https://github.com/datawire/ambassador-auth-httpbasic)).
* Only authenticating requests that are under a rate limit and rejecting authentication requests above the rate limit.
* Authenticating specific services (URLs), and not others.

For each request, the ExtAuth service may either:
 1. return a direct HTTP *response*, intended to be sent back to the requesting HTTP client (normally *denying* the request from being forwarded to the upstream backend service) or
 2. return a modification to make to the HTTP *request* before sending it to the upstream backend service (normally *allowing* the request to be forwarded to the upstream backend service with modifications).

The ExtAuth service receives information about every request through $productName$ and must indicate whether the request is to be allowed or not.  If not, the ExtAuth service provides the HTTP response which is to be handed back to the client.  A potential control flow for Authentication is shown in the image below.

Giving the ExtAuth service the ability to control the response allows many different types of auth mechanisms, for example:

- The ExtAuth service can simply return an error page with an HTTP 401 response.
- The ExtAuth service can choose to include a `WWW-Authenticate` header in the 401 response, to ask the client to perform HTTP Basic Auth.
- The ExtAuth service can issue a 301 `Redirect` to divert the client into an OAuth or OIDC authentication sequence.  The control flow of this is shown below.
<img src="../../../images/auth-flow.png" alt="Authentication flow" />

![Authentication flow](../../../images/auth-flow.png)

There are two variants of the ExtAuth: gRPC and plain HTTP.

### The gRPC protocol

When `proto: grpc` is set, the ExtAuth service must implement the `Authorization` gRPC interface, defined in [Envoy's `external_auth.proto`](https://github.com/emissary-ingress/emissary/blob/master/api/envoy/service/auth/v3/external_auth.proto).

### The HTTP protocol

External services for `proto: http` are often easier to implement, but have several limitations compared to `proto: grpc`.
 - The list of headers that the ExtAuth service is interested in reading must be known ahead of time, in order to set `allow_request_headers`.  Inspecting headers that are not known ahead of time requires instead using `proto: grpc`.
 - The list of headers that the ExtAuth service would like to set or modify must be known ahead of time, in order to set `allow_authorization_headers`.  Setting headers that are not known ahead of time requires instead using `proto: grpc`.
 - When returning a direct HTTP response, the HTTP status code cannot be 200 or in the 5XX range.  Intercepting with a 200 or 5XX response requires instead using `proto: grpc`.

#### The request From $productName$ to the ExtAuth service

For every incoming request, a similar request is made to the ExtAuth service that mimics the:
 - HTTP request method
 - HTTP request path, potentially modified by `path_prefix`
 - HTTP request headers that are either named in `allowed_request_headers` or in the fixed list of headers that are always included
 - first `include_body.max_bytes` of the HTTP request body.

The `Content-Length` HTTP header is set to the number of bytes in the body of the request sent to the ExtAuth service (`0` if `include_body` is not set).

**ALL** request methods will be proxied, which implies that the ExtAuth service must be able to handle any request that any client could make.

Take this incoming request for example:

```
PUT /path/to/service HTTP/1.1
Host: myservice.example.com:8080
User-Agent: curl/7.54.0
Accept: */*
Content-Type: application/json
Content-Length: 27

{ "greeting": "hello world!", "spiders": "OMG no" }
```

The request $productName$ will make of the auth service is:

```
PUT /path/to/service HTTP/1.1
Host: extauth.example.com:8080
User-Agent: curl/7.54.0
Accept: */*
Content-Type: application/json
Content-Length: 0
```

#### The response returned from the ExtAuth service to $productName$

 - If the HTTP response returned from the ExtAuth service to $productName$ has an HTTP status code of 200, then the request is allowed through to the upstream backend service.  **Only** 200 indicates this; other 2XX status codes will prevent the request from being allowed through.

   The 200 response should not contain anything in the body, but may contain arbitrary headers.  Any header present in the ExtAuth service' response that is also either listed in the `allow_authorization_headers` attribute of the AuthService resource or in the fixed list of headers that are always included will be copied from the ExtAuth service's response into the request going to the upstream backend service.  This allows the ExtAuth service to inject tokens or other information into the request, or to modify headers coming from the client.

   The big limitation here is that the list of headers to be set must be known ahead of time, in order to set `allow_request_headers`.  Setting headers that are not known ahead of time requires instead using `proto: grpc`.

 - If $productName$ cannot reach the ExtAuth service at all, if the ExtAuth service does not return a valid HTTP response, or if the HTTP response has an HTTP status code in the 5XX range, then the communication with the ExtAuth service is considered to have failed, and the `status_on_error` or `failure_mode_allow` behavior is triggered.

 - Any HTTP status code other than 200 or 5XX from the ExtAuth service tells $productName$ to **not** allow the request to continue to the upstream backend service, but that the ExtAuth service is instead intercepting the request.  The entire HTTP response from the ExtAuth service--including the status code, the headers, and the body--is handed back to the client verbatim. This gives the ExtAuth service **complete** control over the entire response presented to the client.

   The big limitation here is that you cannot directly return a 200 or 5XX response.  Intercepting with a 200 or 5XX response requires instead using `proto: grpc`.
