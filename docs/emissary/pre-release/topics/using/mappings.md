# Advanced AmbassadorMapping configuration

$productName$ is designed so that the author of a given Kubernetes service can easily and flexibly configure how traffic gets routed to the service. The core abstraction used to support service authors is a mapping, which maps a target backend service to a given host or prefix. For Layer 7 protocols such as HTTP, gRPC, or WebSockets, the `AmbassadorMapping` resource is used. For TCP, the `AmbassadorTCPMapping` resource is used.

$productName$ _must_ have one or more mappings defined to provide access to any services at all. The name of the mapping must be unique.

## System-wide defaults for AmbassadorMappings

Certain aspects of mappings can be set system-wide using the `defaults` element of the `ambassador Module`:
see [using defaults](../../using/defaults) for more information. The `AmbassadorMapping` element will look first in
the `httpmapping` default class.

## AmbassadorMapping evaluation order

$productName$ sorts mappings such that those that are more highly constrained are evaluated before those less highly constrained. The prefix length, the request method, constraint headers, and query parameters are all taken into account.

If absolutely necessary, you can manually set a `precedence` on the mapping (see below). In general, you should not need to use this feature unless you're using the `regex_headers` or `host_regex` matching features. If there's any question about how $productName$ is ordering rules, the diagnostic service is a good first place to look: the order in which mappings appear in the diagnostic service is the order in which they are evaluated.

## Optional fallback AmbassadorMapping

$productName$ will respond with a `404 Not Found` to any request for which no mapping exists. If desired, you can define a fallback "catch-all" mapping so all unmatched requests will be sent to an upstream service.

For example, defining a mapping with only a `/` prefix will catch all requests previously unhandled and forward them to an external service:

```yaml
---
apiVersion: x.getambassador.io/v3alpha1
kind:  AmbassadorMapping
metadata:
  name:  catch-all
spec:
  prefix: /
  service: https://www.getambassador.io
```

### Using `precedence`

$productName$ sorts mappings such that those that are more highly constrained are evaluated before those less highly constrained. The prefix length, the request method, and the constraint headers are all taken into account. These mechanisms, however, may not be sufficient to guarantee the correct ordering when regular expressions or highly complex constraints are in play.

For those situations, an `AmbassadorMapping` can explicitly specify the `precedence`. An `AmbassadorMapping` with no `precedence` is assumed to have a `precedence` of 0; the higher the `precedence` value, the earlier the `AmbassadorMapping` is attempted.

If multiple `AmbassadorMapping`s have the same `precedence`, $productName$'s normal sorting determines the ordering within the `precedence`; however, there is no way that $productName$ can ever sort an `AmbassadorMapping` with a lower `precedence` ahead of one at a higher `precedence`.

### Using `tls`

In most cases, you won't need the `tls` attribute: just use a `service` with an `https://` prefix. However, note that if the `tls` attribute is present and `true`, $productName$ will originate TLS even if the `service` does not have the `https://` prefix.

If `tls` is present with a value that is not `true`, the value is assumed to be the name of a defined TLS context, which will determine the certificate presented to the upstream service. TLS context handling is a beta feature of $productName$ at present; please [contact us on Slack](https://a8r.io/Slack) if you need to specify TLS origination certificates.

### Using `cluster_tag`

If the `cluster_tag` attribute is present, its value will be prepended to cluster names generated from
the `AmbassadorMapping`. This provides a simple mechanism for customizing the `cluster` name when working with metrics.

## Using `dns_type`

If the `dns_type` attribute is present, its value will determine how the DNS is used when locating the upstream service. Valid values are:

- `strict_dns` (the default): The DNS result is assumed to define the exact membership of the cluster. For example, if DNS returns three IP addresses, the cluster is assumed to have three distinct upstream hosts. If a successful DNS query returns no hosts, the cluster is assumed to be empty. `strict_dns` makes sense for situations like a Kubernetes service, where DNS resolution is fast and returns a relatively small number of IP addresses.

- `logical_dns`: Instead of assuming that the DNS result defines the full membership of the cluster, every new connection simply uses the first IP address returned by DNS. `logical_dns` makes sense for a service with a large number of IP addresses using round-robin DNS for upstream load balancing: typically each DNS query returns a different first result, and it is not necessarily possible to know the full membership of the cluster. With `logical_dns`, no attempt is made to garbage-collect connections: they will stay open until the upstream closes them.

If `dns_type` is not given, `strict_dns` is the default, as this is the most conservative choice. When interacting with large web services with many IP addresses, switching to `logical_dns` may be a better choice. For more on the different types of DNS, see the [`strict_dns` Envoy documentation] or the [`logical_dns` Envoy documentation].

[`strict_dns` Envoy documentation]: https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/service_discovery#strict-dns
[`logical_dns` Envoy documentation]: https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/service_discovery#logical-dns


## Namespaces and Mappings

If `AMBASSADOR_NAMESPACE` is correctly set, $productName$ can map to services in other namespaces by taking advantage of Kubernetes DNS:

- `service: servicename` will route to a service in the same namespace as $productName$, and
- `service: servicename.namespace` will route to a service in a different namespace.

### Linkerd interoperability (`add_linkerd_headers`)

When using Linkerd, requests going to an upstream service need to include the `l5d-dst-override` header to ensure that Linkerd will route them correctly. Setting `add_linkerd_headers` does this automatically, based on the `service` attribute in the `AmbassadorMapping`.

If `add_linkerd_headers` is not specified for a given `AmbassadorMapping`, the default is taken from the `ambassador`[Module](../../running/ambassador). The overall default is `false`: you must explicitly enable `add_linkerd_headers` for $productName$ to add the header for you (although you can always add it yourself with `add_request_headers`, of course).

### "Upgrading" to non-HTTP protocols (`allow_upgrade`)

HTTP has [a mechanism][upgrade-mechanism] where the client can say
`Connection: upgrade` / `Upgrade: PROTOCOL` to switch ("upgrade") from
the current HTTP version to a different one, or even a different
protocol entirely.  $productName$ itself understands and can handle the
different HTTP versions, but for other protocols you need to tell
$productName$ to get out of the way, and let the client speak that
protocol directly with your upstream service.  You can do this by
setting the `allow_upgrade` field to a case-insensitive list of
protocol names $productName$ will allow switching to from HTTP.  After
the upgrade, $productName$ does not interpret the traffic, and behaves
similarly to how it does for `AmbassadorTCPMapping`s.

[upgrade-mechanism]: https://tools.ietf.org/html/rfc7230#section-6.7

This "upgrade" mechanism is a useful way of adding HTTP-based
authentication and access control to another protocol that might not
support authentication; for this reason the designers of the WebSocket
protocol made this "upgrade" mechanism the *only* way of initiating a
WebSocket connection.  In an AmbassadorMapping for an upstream service that
supports WebSockets, you would write

```yaml
allow_upgrade:
- websocket
```

The Kubernetes apiserver itself uses this "upgrade" mechanism to
perform HTTP authentication before switching to SPDY for endpoint used
by `kubectl exec`; if you wanted to use $productName$ to expose the
Kubernetes apiserver such that `kubectl exec` functions, you would
write

```yaml
---
apiVersion: x.getambassador.io/v3alpha1
kind: AmbassadorMapping
metadata:
  name: apiserver
spec:
  hostname: "*"
  service: https://kubernetes.default
  prefix: /
  allow_upgrade:
  - spdy/3.1
```

There is a deprecated setting `use_websocket`; setting `use_websocket:
true` is equivalent to setting `allow_upgrade: ["websocket"]`.
