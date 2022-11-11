# Rate limit service
test-redirects

Rate limiting is a powerful technique to improve the [availability and
resilience of your
services](https://blog.getambassador.io/rate-limiting-a-useful-tool-with-distributed-systems-6be2b1a4f5f4).
In $productName$, each request can have one or more _labels_. These labels are
exposed to a third-party service via a gRPC API. The third-party service can
then rate limit requests based on the request labels.

**Note that `RateLimitService` is only applicable to $OSSproductName$,
and not $AESproductName$, as $AESproductName$ includes a
built-in rate limit service.**

## Request labels

See [Attaching labels to
requests](../../../using/rate-limits#attaching-labels-to-requests)
for how to configure the labels that are attached to a request.

## Domains

In $productName$, each engineer (or team) can be assigned its own _domain_. A
domain is a separate namespace for labels. By creating individual domains, each
team can assign their own labels to a given request, and independently set the
rate limits based on their own labels.

See [Attaching labels to
requests](../../../using/rate-limits/#attaching-labels-to-requests)
for how to labels under different domains.

## External rate limit service

In order for $productName$ to rate limit, you need to implement a
gRPC `RateLimitService`, as defined in [Envoy's `v3/rls.proto`]
interface. If you do not have the time or resources to implement your own rate
limit service, $AESproductName$ integrates a high-performance rate
limiting service.

[envoy's `v3/rls.proto`]: https://github.com/emissary-ingress/emissary/tree/master/api/envoy/service/ratelimit/v3/rls.proto

$productName$ generates a gRPC request to the external rate limit
service and provides a list of labels on which the rate limit service can base
its decision to accept or reject the request:

```
[
  {"source_cluster", "<local service cluster>"},
  {"destination_cluster", "<routed target cluster>"},
  {"remote_address", "<trusted address from x-forwarded-for>"},
  {"generic_key", "<descriptor_value>"},
  {"<some_request_header>", "<header_value_queried_from_header>"}
]
```

If $productName$ cannot contact the rate limit service, it will
allow the request to be processed as if there were no rate limit service
configuration.

It is the external rate limit service's responsibility to determine whether rate
limiting should take place, depending on custom business logic. The rate limit
service must simply respond to the request with an `OK` or `OVER_LIMIT` code:

- If Envoy receives an `OK` response from the rate limit service, then $productName$ allows the client request to resume being processed by
  the normal flow.
- If Envoy receives an `OVER_LIMIT` response, then $productName$
  will return an HTTP 429 response to the client and will end the transaction
  flow, preventing the request from reaching the backing service.

The headers injected by the [AuthService](../auth-service) can also be passed to
the rate limit service since the `AuthService` is invoked before the
`RateLimitService`.

## Configuring the rate limit service

A `RateLimitService` manifest configures $productName$ to use an
external service to check and enforce rate limits for incoming requests:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: RateLimitService
metadata:
  name: ratelimit
spec:
  service: 'example-rate-limit.default:5000'
  protocol_version: # default is v2, if upgrading from 2.x then you must set this to v3.
  failure_mode_deny: false # when set to true envoy will return 500 error when unable to communicate with RateLimitService
```

- `service` gives the URL of the rate limit service. If using a Kubernetes service, this should be the [namespace-qualified DNS name](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services) of that service.
- `protocol_version`  Allowed values are `v3` and `v2`(default). `protocol_version` was used in previous versions of $productName$ to control the protocol used by the gRPC service to communicate with the `RateLimitService`. $productName$ 3.x is running an updated version of Envoy that has dropped support for the `v2` protocol, so starting in 3.x, if `protocol_version` is not specified, the default  value of `v2` will cause an error to be posted and a static response will be returned. Therefore, you must set it to `protocol_version: v3`. If upgrading from a previous version, you will want  to set it to `v3` and ensure it is working before upgrading to Emissary-ingress 3.Y. The default value for `protocol_version` remains `v2` in the `getambassador.io/v3alpha1` CRD specifications to avoid making breaking changes outside of a CRD version change. Future versions of CRD's will deprecate it.
- `failure_mode_deny` By default, Envoy will fail open when unable to communicate with the service due to it becoming unvailable or due to timeouts. When this happens the upstream service that is being protected by a rate limit may be overloaded due to this behavior. When set to `true` Envoy will be configured to return a `500` status code when it is unable to communicate with the RateLimit service and will fail closed by rejecting request to the upstream service.

You may only use a single `RateLimitService` manifest.

## Rate limit service and TLS

You can tell $productName$ to use TLS to talk to your service by
using a `RateLimitService` with an `https://` prefix. However, you may also
provide a `tls` attribute: if `tls` is present and `true`, $productName$ will originate TLS even if the `service` does not have the `https://`
prefix.

If `tls` is present with a value that is not `true`, the value is assumed to be the name of a defined TLS context, which will determine the certificate presented to the upstream service.

## Example

The [$OSSproductName$ Rate Limiting
Tutorial](../../../../howtos/rate-limiting-tutorial) has a simple rate limiting
example. For a more advanced example, read the [advanced rate limiting
tutorial](../../../../../2.0/howtos/advanced-rate-limiting), which uses the rate limit
service that is integrated with $AESproductName$.

## Further reading

- [Rate limiting: a useful tool with distributed systems](https://blog.getambassador.io/rate-limiting-a-useful-tool-with-distributed-systems-6be2b1a4f5f4)
- [Rate limiting for API Gateways](https://blog.getambassador.io/rate-limiting-for-api-gateways-892310a2da02)
- [Implementing a Java Rate Limiting Service for $productName$](https://blog.getambassador.io/implementing-a-java-rate-limiting-service-for-the-ambassador-api-gateway-e09d542455da)
- [Designing a Rate Limit Service for $productName$](https://blog.getambassador.io/designing-a-rate-limiting-service-for-ambassador-f460e9fabedb)
