import Alert from '@material-ui/lab/Alert';

# The Ext_Authz Protocol

By design, the Ext_Authz protocol used by [External Filters][] is highly flexible. This allows the `External Filter` to defer filtering and processing of requests to an "External Service" running in the Kubernetes cluster or anywhere else reachable via an absolute URL. Because the logic of authentication is encapsulated in the External Service, you can use this to support a wide variety of use cases. For example:

- Supporting traditional SSO authentication protocols, e.g., OAuth, OpenID Connect, etc.
  - (Note that OAuth2 and OpenID Connect have out-of-the-box support via the [Oauth2 Filter Resource][])
- Supporting HTTP basic authentication
- Adding custom business logic, processing, and authentication on incoming requests not covered by $productName$'s [OAuth2 Filter][], [JWT Filter][], [APIKey Filter][], or [Web Application Firewalls][].

For each incoming request, the External Service may either:

- Deny the incoming request from being forwarded to the upstream Service by returning a direct HTTP response to the downstream client.
- Allow the request to be forwarded to the upstream Service (with modifications to the headers if desired)

**Note:** External Services cannot modify the path of the incoming request before allowing it to be forwarded to the upstream Service or otherwise change the destination of where the incoming request will be forwarded to.

The External Service receives information about the incoming request from $productName$ and must indicate whether the request is to be allowed or not. If not, the External Service provides the HTTP response, which is to be handed back to the client. A potential control flow for Authentication is shown in the image below.

Giving the External Service the ability to control the response allows many different types of auth mechanisms, for example:

- The External Service can simply return an error page or response with an `HTTP 4xx` response.
- The External Service can choose to return an `HTTP 401` response with a `www-authenticate` header and ask the client to perform HTTP Basic Auth.
- The External Service can issue a `301 Redirect` to divert the client into an OAuth or OIDC authentication sequence. The control flow of this is shown below.

![Authentication flow](../../images/auth-flow.png)

## There are two variants of the ExtAuth Protocol: gRPC and plain HTTP

### The gRPC protocol

When using an `External Filter` with `protocol: "grpc"`, the External Service must implement the Authorization gRPC interface, defined in [Envoy's external_auth.proto][].

### The HTTP protocol

External Services for `protocol: "http"` are slightly easier to implement but have several limitations compared to `protocol: "grpc"`.

- The list of headers that the External Service is interested in reading must be known ahead of time and configured in the `External Filter's` `allowedRequestHeaders` field. Inspecting headers that are not known ahead of time requires instead using a `protocol: "grpc"` External Service.
- The list of headers that the External Service would like to set or modify must also be known ahead of time and configured in the `External Filter's` `allowedAuthorizationHeaders` field. Setting headers that are not known ahead of time requires instead using `protocol: "grpc"`.
- When returning a direct HTTP response to the downstream client, the HTTP status code cannot be `200` or in the `5XX` range. Doing so requires instead using `protocol: "grpc"`.

## The Request from $productName$ to the External Service

When an `External Filter` is executed against an incoming request, a similar request is made to the External Service specified by the `External Filter`. The request to the External Service mimics the following properties of the incoming request:

- HTTP request method
- HTTP request path, (potentially modified by the `External Filter's` `pathPrefix` field)
- HTTP request headers (`protocol: "grpc"` External Services always have access to all headers, while `protocol: "http"` is limited to headers specified in the `External Filter's` `allowedRequestHeaders` field)
- First `include_body`.`maxBytes` of the HTTP request body.
- The `content-length` HTTP header is always included and is set to the number of bytes in the body of the request sent to the External Service. It will always be `0` if `include_body` is not set.

<Alert severity="info">
  Filtering actions of all types in $productName$ are only ever executed on incoming requests and not on responses from your upstream Services.
</Alert>

<Alert severity="warning">
  ALL request methods will be proxied, which implies that the External Service must be able to handle any request that any client could make. This is a concern mainly for <code>protocol: "http"</code> External Services and not those with <code>protocol: "grpc"</code>.
</Alert>

## The Response from the External Service to $productName$

- If the HTTP response returned from the External service to Ambassador Edge Stack has an HTTP status code of `200`, then the request is allowed through to the upstream backend service. Only `200` indicates this; all other status codes will prevent the request from being forwarded to the upstream Service.

- HTTP `200` responses should not contain anything in the body but may contain arbitrary headers. Any header present in the External Service's response that is also either listed in the `allowedAuthorizationHeaders` attribute of the `External Filter` resource or in the fixed list of headers that are always included will be copied from the External Service's response into the request going to the upstream Service. This allows the External Service to inject tokens or other information into the request or to modify headers coming from the client.

- If $productName$ cannot reach the External Service at all, if the External Service does not return a valid response, or if the response has an HTTP status code in the `5XX` range, then the communication with the External Service is considered to have failed, and the behavior specified by the `statusOnError` or `failureModeAllow` field of the `External Filter` is triggered.

[Envoy's external_auth.proto]: https://github.com/emissary-ingress/emissary/blob/master/api/envoy/service/auth/v3/external_auth.proto
[External Filters]: ../external
[Oauth2 Filter Resource]: ../../../custom-resources/filter-oauth2
[OAuth2 Filter]:  ../../sso/oauth2-sso
[JWT Filter]:  ../../auth/jwt
[APIKey Filter]: ../../auth/apikey
[Web Application Firewalls]: ../../web-application-firewalls/setup
