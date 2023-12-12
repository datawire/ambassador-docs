import Alert from '@material-ui/lab/Alert';

# The **Ambassador** **Module** Resource

<div class="docs-article-toc">
<h3>Contents</h3>

* [Envoy](#envoy)
* [General](#general)
* [gRPC](#grpc)
* [Header behavior](#header-behavior)
* [Misc](#miscellaneous)
* [Observability](#observability)
* [Protocols](#protocols)
* [Security](#security)
* [Service health / timeouts](#service-health--timeouts)
* [Traffic management](#traffic-management)


</div>

If present, the `ambassador` `Module` defines system-wide configuration for $productName$. **You may very well not need this resource.** To use the `ambassador` `Module` to configure $productName$, it MUST be named `ambassador`, otherwise it will be ignored.  To create multiple `ambassador` `Module`s in the same Kubernetes namespace, you will need to apply them as annotations with separate `ambassador_id`s: you will not be able to use multiple CRDs.

The defaults in the `ambassador` `Module` are:

```yaml
apiVersion: getambassador.io/v3alpha1
kind:  Module
metadata:
  name:  ambassador
spec:
# Use ambassador_id only if you are using multiple instances of $productName$ in the same cluster.
# See below for more information.
  ambassador_id: [ "<ambassador_id>" ]
  config:
  # Use the items below for config fields
```

There are many config field items that can be configured on the `ambassador` `Module`. They are listed below with examples and grouped by category.

## Envoy

##### Content-Length headers

* `allow_chunked_length: true` tells Envoy to allow requests or responses with both `Content-Length` and `Transfer-Encoding` headers set.

By default, messages with both `Content-Length` and `Content-Transfer-Encoding` are rejected. If `allow_chunked_length` is `true`, $productName$ will remove the `Content-Length` header and process the message. See the [Envoy documentation for more details](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/core/v3/protocol.proto.html?highlight=allow_chunked_length#config-core-v3-http1protocoloptions).

##### Envoy access logs

* `envoy_log_path` defines the path of Envoy's access log. By default this is standard output.
* `envoy_log_type` defines the type of access log Envoy will use. Currently, only `json` or `text` are supported.
* `envoy_log_format` defines the Envoy access log line format.

These logs can be formatted using [Envoy operators](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#command-operators) to display specific information about an incoming request. The example below will show only the protocol and duration of a request:

```yaml
envoy_log_path: /dev/fd/1
envoy_log_type: json
envoy_log_format:
  {
    "protocol": "%PROTOCOL%",
    "duration": "%DURATION%"
  }
```

See the Envoy documentation for the [standard log format](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#default-format-string) and a [complete list of log format operators](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/access_log).

##### Envoy validation timeout

* `envoy_validation_timeout` defines the timeout, in seconds, for validating a new Envoy configuration.

The default is 10; a value of 0 disables Envoy configuration validation. Most installations will not need to use this setting.

For example:

```yaml
envoy_validation_timeout: 30
```

would allow 30 seconds to validate the generated Envoy configuration.

##### Error response overrides

* `error_response_overrides` permits changing the status code and body text for 4XX and 5XX response codes.

By default, $productName$ will pass through error responses without modification, and errors generated locally will use Envoy's default response body, if any.

See [using error response overrides](../custom-error-responses) for usage details. For example, this configuration:

```yaml
error_response_overrides:
 - on_status_code: 404
   body:
     text_format: "File not found"
```

would explicitly modify the body of 404s to say "File not found".

##### Forwarding client cert details

Two attributes allow providing information about the client's TLS certificate to upstream certificates:

* `forward_client_cert_details: true` will tell Envoy to add the `X-Forwarded-Client-Cert` to upstream
  requests.
* `set_current_client_cert_details` will tell Envoy what information to include in the
  `X-Forwarded-Client-Cert` header.

$productName$ will not forward information about a certificate that it cannot validate.

See the Envoy documentation on [X-Forwarded-Client-Cert](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers.html?highlight=xfcc#x-forwarded-client-cert) and [SetCurrentClientCertDetails](https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/network/http_connection_manager/v3/http_connection_manager.proto.html#extensions-filters-network-http-connection-manager-v3-httpconnectionmanager-setcurrentclientcertdetails) for more information.

```yaml
forward_client_cert_details: true
set_current_client_cert_details: SANITIZE
```

##### Server name

* `server_name` allows overriding the server name that Envoy sends with responses to clients.

By default, Envoy uses a server name of `envoy`.

##### Suppress Envoy headers

* `suppress_envoy_headers: true` will prevent $productName$ from emitting certain additional
  headers to HTTP requests and responses.

For the exact set of headers covered by this config, see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#config-http-filters-router-headers-set)

---
## General

##### Ambassador ID

* `ambassador_id` allows using multiple instances of $productName$ in the same cluster.

We recommend _not_ setting `ambassador_id` if you are running only one instance of $productName$ in your cluster. For more information, see the [Running and Deployment documentation](../running/#ambassador_id).

If used, the `ambassador_id` value must be an array, for example:

```yaml
ambassador_id: [ "test_environment" ]
```

##### Defaults

* `defaults` provides a dictionary of default values that will be applied to various $productName$ resources.

See [Using `ambassador` `Module` Defaults](../../using/defaults) for more information.

---

## gRPC

##### Bridges

* `enable_grpc_http11_bridge: true` will enable the gRPC-HTTP/1.1 bridge.
* `enable_grpc_web: true` will enable the gRPC-Web bridge.

gRPC is a binary HTTP/2-based protocol. While this allows high performance, it can be problematic for clients that are unable to speak HTTP/2 (such as JavaScript in many browsers, or legacy clients in difficult-to-update environments).

The gRPC-HTTP/1.1 bridge can translate HTTP/1.1 calls with `Content-Type: application/grpc` into gRPC calls: $productName$ will perform buffering and translation as necessary. For more details on the translation process, see the [Envoy gRPC HTTP/1.1 bridge documentation](https://www.envoyproxy.io/docs/envoy/v1.11.2/configuration/http_filters/grpc_http1_bridge_filter.html).

Likewise, gRPC-Web is a JSON and HTTP-based protocol that allows browser-based clients to take advantage of gRPC protocols. The gRPC-Web specification requires a server-side proxy to translate between gRPC-Web requests and gRPC backend services, and $productName$ can fill this role when the gRPC-Web bridge is enabled. For more details on the translation process, see the [Envoy gRPC HTTP/1.1 bridge documentation](https://www.envoyproxy.io/docs/envoy/v1.11.2/configuration/http_filters/grpc_http1_bridge_filter.html); for more details on gRPC-Web itself, see the [gRPC-Web client GitHub repo](https://github.com/grpc/grpc-web).

##### Statistics

* `grpc_stats` allows enabling telemetry for gRPC calls using Envoy's [gRPC Statistics Filter](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/grpc_stats_filter).

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Module
metadata:
  name: ambassador
spec:
  config:
    grpc_stats:
      upstream_stats: true
      services:
        - name: <package>.<service>
          method_names: [<method>]
```

Supported parameters:
* `all_methods`
* `services`
* `upstream_stats`

Available metrics:
* `envoy_cluster_grpc_<service>_<status_code>`
* `envoy_cluster_grpc_<service>_request_message_count`
* `envoy_cluster_grpc_<service>_response_message_count`
* `envoy_cluster_grpc_<service>_success`
* `envoy_cluster_grpc_<service>_total`
* `envoy_cluster_grpc_upstream_<stats>` - **only when `upstream_stats: true`**

Please note that `<service>` will only be present if `all_methods` is set or the service and the method are present under `services`. If `all_methods` is false or the method is not on the list, the available metrics will be in the format `envoy_cluster_grpc_<stats>`.

* `all_methods`: If set to true, emit stats for all service/method names.
If set to false, emit stats for all service/message types to the same stats without including the service/method in the name.
**This option is only safe if all clients are trusted. If this option is enabled with untrusted clients, the clients could cause unbounded growth in the number
of stats in Envoy, using unbounded memory and potentially slowing down stats pipelines.**

* `services`: If set, specifies an allow list of service/methods that will have individual stats emitted for them. Any call that does not match the allow list will be counted in a stat with no method specifier (generic metric).

<Alert severity="warning">
  If both <code>all_methods</code> and <code>services</code> are present, <code>all_methods</code> will be ignored.
</Alert>

* `upstream_stats`: If true, the filter will gather a histogram for the request time of the upstream.

---

## Header behavior

##### Header case

* `proper_case: true` forces headers to have their "proper" case as shown in RFC7230.
* `header_case_overrides` allows forcing certain headers to have specific casing.

<Alert severity="info"><code>proper_case</code> and <code>header_case_overrides</code> are mutually exclusive.</Alert>

RFC7230 specifies that HTTP header names are case-insensitive, but always shows and refers to headers as starting with a capital letter, continuing in lowercase, then repeating the single capital letter after each non-alpha character. This has become an established convention when working with HTTP:

- `Host`, not `host` or `HOST`
- `Content-Type`, not `content-type`, `Content-type`, or `cOnTeNt-TyPe`

Internally, Envoy typically uses [all lowercase](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/header_casing) for header names. This is fully compliant with RFC7230, but some services and clients may require headers to follow the stricter casing rules implied by RFC7230 section headers: in that situation, setting `proper_case: true` will tell Envoy to force all headers to use the casing above.

Alternately, it is also possible - although less common - for services or clients to require some other specific casing for specific headers. `header_case_overrides` specifies an array of header names: if a case-insensitive match for a header is found in the list, the matching header will be replaced with the one in the list. For example, the following configuration will force headers that match `X-MY-Header` and `X-EXPERIMENTAL` to use that exact casing, regardless of the original case used in flight:

```yaml
header_case_overrides:
- X-MY-Header
- X-EXPERIMENTAL
```

If the upstream service responds with `x-my-header: 1`, $productName$ will return `X-MY-Header: 1` to the client. Similarly, if the client includes `x-ExperiMENTAL: yes` in its request, the request to the upstream service will include `X-EXPERIMENTAL: yes`. Other headers will not be altered; $productName$ will use its default lowercase header.

Please see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/core/v3/protocol.proto.html#config-core-v3-http1protocoloptions-headerkeyformat) for more information. Note that in general, we recommend updating clients and services rather than relying on `header_case_overrides`.

##### Linkerd interoperability

* `add_linkerd_headers: true` will force $productName$ to include the `l5d-dst-override` header for Linkerd.

When using older Linkerd installations, requests going to an upstream service may need to include the `l5d-dst-override` header to ensure that Linkerd will route them correctly. Setting `add_linkerd_headers` does this automatically.  See the [Mapping](../../using/mappings#linkerd-interoperability-add_linkerd_headers) documentation for more details.

##### Max request headers size

* `max_request_headers_kb` sets the maximum allowed request header size in kilobytes. If not set, the default is 60 KB.

See [Envoy documentation](https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/network/http_connection_manager/v3/http_connection_manager.proto.html) for more information.

##### Preserve external request ID

* `preserve_external_request_id: true` will preserve any `X-Request-Id` header presented by the client. The default is `false`, in which case Envoy will always generate a new `X-Request-Id` value.

##### Strip matching host port

* `strip_matching_host_port: true` will tell $productName$ to strip any port number from the host/authority header before processing and routing the request if that port number matches the port number of Envoy's listener. The default is `false`, which will preserve any port number.

In the default installation of $productName$ the public port is 443, which then maps internally to 8443, so this only works in custom installations where the public Service port and Envoy listener port match.

A common reason to try using this property is if you are using gRPC with TLS and your client library appends the port to the Host header (i.e. `myurl.com:443`). We have an alternative solution in our [gRPC guide](../../../../../emissary/3.1/howtos/grpc#working-with-host-headers-that-include-the-port) that uses a [Lua script](#lua-scripts) to remove all ports from every Host header for that use case.

---

## Miscellaneous


##### Envoy's admin port

* `admin_port` specifies the port where $productName$'s Envoy will listen for low-level admin requests. The default is 8001; it should almost never need changing.

##### Lua scripts

* `lua_scripts` allows defining a custom Lua script to run on every request.

This is useful for simple use cases that mutate requests or responses, for example to add a custom header:

```yaml
lua_scripts: |
  function envoy_on_response(response_handle)
    response_handle:headers():add("Lua-Scripts-Enabled", "Processed")
  end
```

For more details on the Lua API, see the [Envoy Lua filter documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/lua_filter.html).

Some caveats around the embedded scripts:

* They run in-process, so any bugs in your Lua script can break every request.
* They're run on every request/response to every URL.
* They're inlined in the $productName$ YAML; as such, we do not recommend using Lua scripts for long, complex logic.

If you need more flexible and configurable options, $AESproductName$ supports a [pluggable Filter system](../../using/filters/).

##### Merge slashes

* `merge_slashes: true` will cause $productName$ to merge adjacent slashes in incoming paths when doing route matching and request filtering: for example, a request for `//foo///bar` would be matched to a `Mapping` with prefix `/foo/bar`.

##### Modify Default Buffer Size

By default, the Envoy that ships with $productName$ uses a defailt of 1MiB soft limit for an upstream service's read and write buffer limits. This setting allows you to configure that buffer limit. See the [Envoy docs](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/cluster/v3/cluster.proto.html?highlight=per_connection_buffer_limit_bytes) for more information.

```yaml
buffer_limit_bytes: 5242880 # Sets the default buffer limit to 5 MiB
```

##### Use $productName$ namespace for service resolution

* `use_ambassador_namespace_for_service_resolution: true` tells $productName$ to assume that unqualified services are in the same namespace as $productName$

By default, when $productName$ sees a service name without a namespace, it assumes that the namespace is the same as the resource referring to the service. For example, for this `Mapping`:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: mapping-1
  namespace: foo
spec:
  hostname: "*"
  prefix: /
  service: upstream
```

$productName$ would look for a Service named `upstream` in namespace `foo`.

However, if `use_ambassador_namespace_for_service_resolution` is `true`, this `Mapping` would look for a Service named `foo` in the namespace in which $productName$ is installed instead.

---

## Observability

##### Diagnostics

* `diagnostics` controls access to the diagnostics interface.

By default, $productName$ creates a `Mapping` that allows access to the diagnostic interface at `/ambassador/v0/diag` from anywhere in the cluster. To disable the `Mapping` entirely, set `diagnostics.enabled` to `false`:


```yaml
diagnostics:
  enabled: false
```

With diagnostics disabled, `/ambassador/v0/diag` will respond with 404; however, the service itself is still running, and `/ambassador/v0/diag/` is reachable from inside the $productName$ Pod at `https://localhost:8877`. You can use Kubernetes port forwarding to set up remote access to the diagnostics page temporarily:

```
kubectl port-forward -n ambassador deploy/ambassador 8877
```

Alternately, to leave the `Mapping` intact but restrict access to only the local Pod, set `diagnostics.allow_non_local` to `false`:

```yaml
diagnostics:
  allow_non_local: true
```

See [Protecting Access to the Diagnostics Interface](../../../howtos/protecting-diag-access) for more information.

---
## Protocols

##### Enable IPv4 and IPv6

* `enable_ipv4` determines whether IPv4 DNS lookups are enabled. The default is `true`.
* `enable_ipv6` determines whether IPv6 DNS lookups are enabled. The default is `false`.

If both IPv4 and IPv6 are enabled, $productName$ will prefer IPv6. This can have strange effects if $productName$ receives `AAAA` records from a DNS lookup, but the underlying network of the pod doesn't actually support IPv6 traffic. For this reason, the default is IPv4 only.

A [`Mapping`](../../using/mappings) can override both `enable_ipv4` and `enable_ipv6`, but if either is not stated explicitly in a `Mapping`, the values here are used. Most $productName$ installations will probably be able to avoid overriding these settings in Mappings.

##### HTTP/1.0 support

* `enable_http10: true` will enable handling incoming HTTP/1.0 and HTTP/0.9 requests. The default is `false`.

---
## Security

##### Cross origin resource sharing (CORS)

* `cors` sets the default CORS configuration for all mappings in the cluster. See the [CORS syntax](../../using/cors).

For example:

```yaml
cors:
  origins: http://foo.example,http://bar.example
  methods: POST, GET, OPTIONS
  ...
```

##### IP allow and deny

* `ip_allow` and `ip_deny` define HTTP source IP address ranges to allow or deny.

<Alert severity="info">Only one of <code>ip_allow</code> and <code>ip_deny</code> may be specified.</Alert>

The default is to allow all traffic.

If `ip_allow` is specified, any traffic not matching a range to allow will be denied. If `ip_deny` is specified, any traffic not matching a range to deny will be allowed. A list of ranges to allow and a separate list to deny may not both be specified.

Both take a list of IP address ranges with a keyword specifying how to interpret the address, for example:

```yaml
ip_allow:
- peer: 127.0.0.1
- remote: 99.99.0.0/16
```

The keyword `peer` specifies that the match should happen using the IP address of the other end of the network connection carrying the request: `X-Forwarded-For` and the `PROXY` protocol are both ignored. Here, our example specifies that connections originating from the $productName$ pod itself should always be allowed.

The keyword `remote` specifies that the match should happen using the IP address of the HTTP client, taking into account `X-Forwarded-For` and the `PROXY` protocol if they are allowed (if they are not allowed, or not present, the peer address will be used instead). This permits matches to behave correctly when, for example, $productName$ is behind a layer 7 load balancer. Here, our example specifies that HTTP clients from the IP address range `99.99.0.0` - `99.99.255.255` will be allowed.

You may specify as many ranges for each kind of keyword as desired.

##### Rejecting Client Requests With Escaped Slashes

* `reject_requests_with_escaped_slashes: true` will tell $productName$ to reject requests containing escaped slashes.

When set to `true`, $productName$ will reject any client requests that contain escaped slashes (`%2F`, `%2f`, `%5C`, or `%5c`) in their URI path by returning HTTP 400. By default, $productName$ will forward these requests unmodified.

  - **Envoy and $productName$ behavior**

  Internally, Envoy treats escaped and unescaped slashes distinctly for matching purposes. This means that an $productName$ mapping
  for path `/httpbin/status` will not be matched by a request for `/httpbin%2fstatus`.

  On the other hand, when using $productName$, escaped slashes will be treated like unescaped slashes when applying FilterPolicies. For example, a request to `/httpbin%2fstatus/200` will be matched against a FilterPolicy for `/httpbin/status/*`.

  - **Security Concern Example**

  With $productName$, this can become a security concern when combined with `bypass_auth` in the following scenario:

     - Use a `Mapping` for path `/prefix` with `bypass_auth` set to true. The intention here is to apply no FilterPolicies under this prefix, by default.

     - Use a `Mapping` for path `/prefix/secure/` without setting bypass_auth to true. The intention here is to selectively apply a FilterPolicy to this longer prefix.

     - Have an upstream service that receives both `/prefix` and `/prefix/secure/` traffic (from the Mappings above), but the upstream service treats escaped and unescaped slashes equivalently.

  In this scenario, when a client makes a request to `/prefix%2fsecure/secret.txt`, the underlying Envoy configuration will _not_ match the routing rule for `/prefix/secure/`, but will instead
  match the routing rule for `/prefix` which has `bypass_auth` set to true. $productName$ FilterPolicies will _not_ be enforced in this case, and the upstream service will receive
  a request that it treats equivalently to `/prefix/secure/secret.txt`, potentially leaking information that was assumed protected by an $productName$ FilterPolicy.

  One way to avoid this particular scenario is to avoid using `bypass_auth` and instead use a FilterPolicy that applies no filters when no authorization behavior is desired.

  The other way to avoid this scenario is to reject client requests with escaped slashes altogether to eliminate this class of path confusion security concerns. This is recommended when there is no known, legitimate reason to accept client requests that contain escaped slashes. This is especially true if it is not known whether upstream services will treat escaped and unescaped slashes equivalently.

  This document is not intended to provide an exhaustive set of scenarios where path confusion can lead to security concerns. As part of good security practice it is recommended to audit end-to-end request flow and the behavior of each component’s escaped path handling to determine the best configuration for your use case.

  - **Summary**

  Envoy treats escaped and unescaped slashes _distinctly_ for matching purposes. Matching is the underlying behavior used by $productName$ Mappings.

  $productName$ treats escaped and unescaped slashes _equivalently_ when selecting FilterPolicies. FilterPolicies are applied by $productName$ after Envoy has performed route matching.

  Finally, whether upstream services treat escaped and unescaped slashes equivalently is entirely dependent on the upstream service, and therefore dependent on your use case. Configuration intended to implement security policies will require audit with respect to escaped slashes. By setting reject_requests_with_escaped_slashes, this class of security concern can largely be eliminated.

##### Trust downstream client IP

* `use_remote_address: false` tells $productName$ that it cannot trust the remote address of incoming connections, and must instead rely exclusively on the `X-Forwarded-For` header.

When `true` (the default), $productName$ will append its own IP address to the `X-Forwarded-For` header so that upstream services of $productName$ can get the full set of IP addresses that have propagated a request.  You may also need to set `externalTrafficPolicy: Local` on your `LoadBalancer` to propagate the original source IP address.

See the [Envoy documentation on the `X-Forwarded-For header` ](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers) and the [Kubernetes documentation on preserving the client source IP](https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/#preserving-the-client-source-ip) for more details.

##### `X-Forwarded-For` trusted hops

* `xff_num_trusted_hops` sets how many L7 proxies ahead of $productName$ should be trusted.

<Alert severity="info">
  This value is not dynamically configurable in Envoy. A restart is required changing the value of <code>xff_num_trusted_hops</code> for Envoy to respect the change.
</Alert>

The value of `xff_num_trusted_hops` indicates the number of trusted proxies in front of $productName$. The default setting is 0 which tells Envoy to use the immediate downstream connection's IP address as the trusted client address. The trusted client address is used to populate the `remote_address` field used for rate limiting and can affect which IP address Envoy will set as `X-Envoy-External-Address`.

`xff_num_trusted_hops` behavior is determined by the value of `use_remote_address` (which is true by default).

* If `use_remote_address` is false and `xff_num_trusted_hops` is set to a value N that is greater than zero, the trusted client address is the (N+1)th address from the right end of XFF. (If the XFF contains fewer than N+1 addresses, Envoy falls back to using the immediate downstream connection’s source address as a trusted client address.)

* If `use_remote_address` is true and `xff_num_trusted_hops` is set to a value N that is greater than zero, the trusted client address is the Nth address from the right end of XFF. (If the XFF contains fewer than N addresses, Envoy falls back to using the immediate downstream connection’s source address as a trusted client address.)

Refer to [Envoy's documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers.html#x-forwarded-for) for some detailed examples of this interaction.

---

## Service health / timeouts

##### Incoming connection idle timeout

* `listener_idle_timeout_ms` sets the idle timeout for incoming connections.

If set, this specifies the length of time (in milliseconds) that an incoming connection is allowed to be idle before being dropped. This can useful if you have proxies and/or firewalls in front of $productName$ and need to control how $productName$ initiates closing an idle TCP connection.

If not set, the default is no timeout, meaning that incoming connections may remain idle forever.

Please see the [Envoy documentation on HTTP protocol options](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/core/v3/protocol.proto#config-core-v3-httpprotocoloptions) for more information.

##### Keepalive

* `keepalive` sets the global TCP keepalive settings.

$productName$ will use these settings for all `Mapping`s unless overridden in a `Mapping`'s configuration. Without `keepalive`, $productName$ follows the operating system defaults.

For example, the following configuration:

```yaml
keepalive:
  time: 2
  interval: 2
  probes: 100
```

would enable keepalives every two seconds (`interval`), starting after two seconds of idleness (`time`), with the connection being dropped if 100 keepalives are sent with no response (`probes`). For more information, see the [Envoy keepalive documentation](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/core/v3/address.proto.html#config-core-v3-tcpkeepalive).

##### Upstream idle timeout

* `cluster_idle_timeout_ms` sets the default idle timeout for upstream connections (by default, one hour).

If set, this specifies the timeout (in milliseconds) after which an idle connection upstream is closed. The idle timeout can be completely disabled by setting `cluster_idle_timeout_ms: 0`, which risks idle upstream connections never getting closed.

If not set, the default idle timeout is one hour.

You can override this setting with [`idle_timeout_ms` on a `Mapping`](../../using/timeouts/).

##### Upstream max lifetime

* `cluster_max_connection_lifetime_ms` sets the default maximum lifetime of an upstream connection.

If set, this specifies the maximum amount of time (in milliseconds) after which an upstream connection is drained and closed, regardless of whether it is idle or not. Connection recreation incurs additional overhead when processing requests. The overhead tends to be nominal for plaintext (HTTP) connections within the same cluster, but may be more significant for secure HTTPS connections or upstreams with high latency. For this reason, it is generally recommended to set this value to at least 10000 ms to minimize the amortized cost of connection recreation while providing a reasonable bound for connection lifetime.

If not set (or set to zero), then upstream connections may remain open for arbitrarily long.

You can override this setting with [`cluster_max_connection_lifetime_ms` on a `Mapping`](../../using/timeouts/).

##### Request timeout

* `cluster_request_timeout_ms` sets the default end-to-end timeout for a single request.

If set, this specifies the default end-to-end timeout for every request.

If not set, the default is three seconds.

You can override this setting with [`timeout_ms` on a `Mapping`](../../using/timeouts/).

##### Readiness and liveness probes

* `readiness_probe` sets whether `/ambassador/v0/check_ready` is automatically mapped
* `liveness_probe` sets whether `/ambassador/v0/check_alive` is automatically mapped

By default, $productName$ creates `Mapping`s that support readiness and liveness checks at `/ambassador/v0/check_ready` and `/ambassador/v0/check_alive`. To disable the readiness `Mapping` entirely, set `readiness_probe.enabled` to `false`:


```yaml
readiness_probe:
  enabled: false
```

Likewise, to disable the liveness `Mapping` entirely, set `liveness_probe.enabled` to `false`:


```yaml
liveness_probe:
  enabled: false
```

A disabled probe endpoint will respond with 404; however, the service is still running, and will be accessible on localhost port 8877 from inside the $productName$ Pod.

You can change these to route requests to some other service. For example, to have the readiness probe map to the `quote` application's health check:

```yaml
readiness_probe:
  enabled: true
  service: quote
  rewrite: /backend/health
```

The liveness and readiness probes both support `prefix` and `rewrite`, with the same meanings as for [Mappings](../../using/mappings).

##### Retry policy

This lets you add resilience to your services in case of request failures by performing automatic retries.

```yaml
retry_policy:
  retry_on: "5xx"
```

---

## Traffic management

##### Circuit breaking

* `circuit_breakers` sets the global circuit breaking configuration defaults

You can override the circuit breaker settings for individual `Mapping`s. By default, $productName$ does not configure any circuit breakers. For more information, see the [circuit breaking reference](../../using/circuit-breakers).

##### Default label domain and labels

* `default_labels` sets default domains and labels to apply to every request.

For more on how to use the default labels, , see the [Rate Limit reference](../../using/rate-limits/#attaching-labels-to-requests).

##### Default load balancer

* `load_balancer` sets the default load balancing type and policy

For example, to set the default load balancer to `least_request`:

```yaml
load_balancer:
  policy: least_request
```

If not set, the default is to use round-robin load balancing. For more information, see the [load balancer reference](../load-balancer).
