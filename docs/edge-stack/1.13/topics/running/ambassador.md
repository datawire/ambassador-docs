import Alert from '@material-ui/lab/Alert';

# Global Configuration

<div class="docs-article-toc">
<h3>Contents</h3>

* [The Ambassador Module](#the-ambassador-module)
* [General](#general)
* [Envoy](#envoy)
* [Header behavior](#header-behavior)
* [Security](#security)
* [Traffic management](#traffic_management)
* [gRPC](#grpc)
* [Service health / timeouts](#service-health--timeouts)
* [Protocols](#protocols)
* [Observability](#observability)
* [Misc](#misc)


</div>

## The Ambassador Module

If present, the Module defines system-wide configuration. This module can be applied to any Kubernetes service (the `ambassador` service itself is a common choice). **You may very well not need this Module.** To apply the Module to an Ambassador Service, it MUST be named 'ambassador', otherwise it will be ignored.  To create multiple `ambassador` Modules in the same namespace, they should be put in the annotations of each separate Ambassador Service.

The defaults in the Module are:

```yaml
apiVersion: getambassador.io/v2
kind:  Module
metadata:
  name:  ambassador
spec:
# Use ambassador_id only if you are using multiple instances of Edge Stack in the same cluster.
# See below for more information.
  # ambassador_id: "<ambassador_id>"
  config:
  # Use the items below for config fields
```

There are many config field items that can be configured on the Module, they are listed below with examples and grouped by category.


## General

##### Ambassador ID (`ambassador_id`)
Use only if you are using multiple ambassadors in the same cluster. See [this page](../running/#ambassador_id) for more information.

```yaml
ambassador_id: "<ambassador_id>"
```

##### Defaults

The `defaults` element is a dictionary of default values that will be applied to various Ambassador resources. 

See [using defaults](../../using/defaults) for more information.

```yaml
error_response_overrides:
 - on_status_code: 404
   body:
     text_format: "File not found"
```
---

## Envoy

##### Time to validate envoy configuration
Defines the timeout, in seconds, for validating a new Envoy configuration. The default is 10; a value of 0 disables Envoy configuration validation. Most installations will not need to use this setting.

```yaml
envoy_validation_timeout: 30
```

##### Error response overrides

Defines error response overrides for 4XX and 5XX response codes with `error_response_overrides`. By default, Ambassador will pass through error responses without modification, and errors generated locally will use Envoy's default response body, if any. 

See [using error response overrides](../custom-error-responses) for usage details.

##### Server name

By default Envoy sets server_name response header to `envoy`. Override it with this variable.

```yaml
server_name: envoy
```

##### Suppress Envoy headers

If true, Ambassador will not emit certain additional headers to HTTP requests and responses. 

For the exact set of headers covered by this config, see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#config-http-filters-router-headers-set)

```yaml
suppress_envoy_headers: true
```

##### Set current client cert details
Specify how to handle the `X-Forwarded-Client-Cert` header. 

See the Envoy documentation on [X-Forwarded-Client-Cert](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers.html?highlight=xfcc#x-forwarded-client-cert) and [SetCurrentClientCertDetails](https://www.envoyproxy.io/docs/envoy/latest/api-v2/config/filter/network/http_connection_manager/v2/http_connection_manager.proto.html?highlight=xfcc#envoy-api-enum-config-filter-network-http-connection-manager-v2-httpconnectionmanager-forwardclientcertdetails) for more information.

```yaml
set_current_client_cert_details: SANITIZE
```

##### Forward client cert details
Add the `X-Forwarded-Client-Cert` header on upstream requests, which contains information about the TLS client certificate verified by Ambassador. 

See the Envoy documentation on [X-Forwarded-Client-Cert](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers.html?highlight=xfcc#x-forwarded-client-cert) and [SetCurrentClientCertDetails](https://www.envoyproxy.io/docs/envoy/latest/api-v2/config/filter/network/http_connection_manager/v2/http_connection_manager.proto#envoy-api-msg-config-filter-network-http-connection-manager-v2-httpconnectionmanager-setcurrentclientcertdetails) for more information.

```yaml
forward_client_cert_details: true
```

##### Envoy access logs

`envoy_log_path` defines the path of log Envoy will use. By default this is standard output.

`envoy_log_type` defines the type of log envoy will use, currently only support json or text.

`envoy_log_format` defines the envoy log line format. 

See [this page](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/access_log) for a complete list of operators and [this page](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#default-format-string) for the standard log format.

These logs can be formatted using [Envoy operators](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#command-operators) to display specific information about an incoming request. The example below will show only the protocol and duration of a request:

```
envoy_log_path: /dev/fd/1
envoy_log_type: json
envoy_log_format:
  {
    "protocol": "%PROTOCOL%",
    "duration": "%DURATION%"
  }
```

---

## Header behavior

##### Max request headers size

Sets the maximum allowed request header size in kilobytes. If not set, the default value from Envoy of 60 KB will be used. 

See [Envoy documentation](https://www.envoyproxy.io/docs/envoy/latest/api-v2/config/filter/network/http_connection_manager/v2/http_connection_manager.proto) for more information.

```yaml
max_request_headers_kb: None
```

##### Preserve external request ID
Controls whether to override the `X-REQUEST-ID` header or keep it as it is coming from incoming request. The default value is false.

```yaml
preserve_external_request_id: true
```

##### Prune unreachable routes
If true, routes with `:authority` matches will be removed from consideration for `Host`s that don't match the `:authority` header. The default is false.

```yaml
prune_unreachable_routes: false
```

##### Strip matching host port
If true, Ambassador will strip the port from host/authority headers before processing and routing the request. This only applies if the port matches the underlying Envoy listener port.

```yaml
strip_matching_host_port: true
```

#### Linkerd interoperability

When using Linkerd, requests going to an upstream service need to include the `l5d-dst-override` header to ensure that Linkerd will route them correctly. Setting `add_linkerd_headers` does this automatically; see the [Mapping](../../using/mappings) documentation for more details.

```yaml
add_linkerd_headers: false
```

#### Header case

Enables upper casing of response headers by proper casing words: the first character and any character following a special character will be capitalized if it’s an alpha character. For example, “content-type” becomes “Content-Type”. 

Please see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/protocol.proto#envoy-api-msg-core-http1protocoloptions-headerkeyformat)

```yaml
proper_case: false
```

#### Overriding header case

Array of header names whose casing should be forced, both when proxied to upstream services and when returned downstream to clients. For every header that matches (case insensitively) to an element in this array, the resulting header name is forced to the provided casing in the array. Cannot be used together with 'proper_case'. This feature provides overrides for Envoy's normal [header casing rules](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/header_casing). | `header_case_overrides: []` |

Enables overriding the case of response headers returned by Ambassador. The `header_case_overrides` field is an array of header names. When Ambassador handles response headers that match any of these headers, matched case-insensitively, they will be rewritten to use their respective case-sensitive names. For example, the following configuration will force response headers that match `X-MY-Header` and `X-EXPERIMENTAL` to use that exact casing, regardless of the original case in the upstream response.

```yaml
header_case_overrides:
- X-MY-Header
- X-EXPERIMENTAL
```

If the upstream service responds with `x-my-header: 1`, Ambasasdor will return `X-MY-Header: 1` to the client. Similarly, if the upstream service responds with `X-Experimental: 1`, Ambasasdor will return `X-EXPERIMENTAL: 1` to the client. Finally, if the upstream service responds with a header for which there is no header case override, Ambassador will return the default, lowercase header.

This configuration is helpful when dealing with clients that are sensitive to specific HTTP header casing. In general, this configuration should be avoided, if possible, in favor of updating clients to work correctly with HTTP headers in a case-insensitive way.

---

## Security

##### Cross origin resource sharing (CORS)

Sets the default CORS configuration for all mappings in the cluster. See the [CORS syntax](../../using/cors).

```yaml
cors:
  origins: http://foo.example,http://bar.example
  methods: POST, GET, OPTIONS
  ...
```

##### IP allow and deny

Defines HTTP source IP address ranges to allow or deny.  Traffic not matching a range set to allow will be denied and vice versa. A list of ranges to allow and a separate list to deny may not both be specified.

Both take a list of IP address ranges with a keyword specifying how to interpret the address, for example:

```yaml
ip_allow:
- peer: 127.0.0.1
- remote: 99.99.0.0/16
```

The keyword `peer` specifies that the match should happen using the IP address of the other end of the network connection carrying the request: `X-Forwarded-For` and the `PROXY` protocol are both ignored. Here, our example specifies that connections originating from the Ambassador pod itself should always be allowed.

The keyword `remote` specifies that the match should happen using the IP address of the HTTP client, taking into account `X-Forwarded-For` and the `PROXY` protocol if they are allowed (if they are not allowed, or not present, the peer address will be used instead). This permits matches to behave correctly when, for example, Ambassador is behind a layer 7 load balancer. Here, our example specifies that HTTP clients from the IP address range `99.99.0.0` - `99.99.255.255` will be allowed.

You may specify as many ranges for each kind of keyword as desired.

#### Trust downstream client IP

Controls whether Envoy will trust the remote address of incoming connections or rely exclusively on the X-Forwarded-For header.

```yaml
use_remote_address: true
```

In Ambassador 0.50 and later, the default value for `use_remote_address` is set to `true`. When set to `true`, Ambassador Edge Stack will append to the `X-Forwarded-For` header its IP address so upstream clients of Ambassador Edge Stack can get the full set of IP addresses that have propagated a request.  You may also need to set `externalTrafficPolicy: Local` on your `LoadBalancer` as well to propagate the original source IP address.  

See the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers) and the [Kubernetes documentation](https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/#preserving-the-client-source-ip) for more details.

<Alert severity="warning">
  If you need to use `x_forwarded_proto_redirect`, you **must** set `use_remote_address` to `false`. Otherwise, unexpected behavior can occur.
</Alert>

##### `x_forwarded_proto` redirect

Ambassador lets through only the HTTP requests with `X-FORWARDED-PROTO: https` header set, and redirects all the other requests to HTTPS if this field is set to true. Note that `use_remote_address` must be set to false for this feature to work as expected.

```yaml
x_forwarded_proto_redirect: false
```

##### `X-Forwarded-For` trusted hops

Controls the how Envoy sets the trusted client IP address of a request. If you have a proxy in front of Ambassador, Envoy will set the trusted client IP to the address of that proxy. To preserve the original client IP address, setting `x_num_trusted_hops: 1` will tell Envoy to use the client IP address in `X-Forwarded-For`. 

Please see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/v1.11.2/configuration/http_conn_man/headers#x-forwarded-for) for more information.

```yaml
xff_num_trusted_hops: 1
```

The value of `xff_num_trusted_hops` indicates the number of trusted proxies in front of Ambassador Edge Stack. The default setting is 0 which tells Envoy to use the immediate downstream connection's IP address as the trusted client address. The trusted client address is used to populate the `remote_address` field used for rate limiting and can affect which IP address Envoy will set as `X-Envoy-External-Address`.

`xff_num_trusted_hops` behavior is determined by the value of `use_remote_address` (which is `true` by default).

* If `use_remote_address` is `false` and `xff_num_trusted_hops` is set to a value N that is greater than zero, the trusted client address is the (N+1)th address from the right end of XFF. (If the XFF contains fewer than N+1 addresses, Envoy falls back to using the immediate downstream connection’s source address as a trusted client address.)

* If `use_remote_address` is `true` and `xff_num_trusted_hops` is set to a value N that is greater than zero, the trusted client address is the Nth address from the right end of XFF. (If the XFF contains fewer than N addresses, Envoy falls back to using the immediate downstream connection’s source address as a trusted client address.)

Refer to [Envoy's documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers.html#x-forwarded-for) for some detailed examples of this interaction.

<Alert severity="info">
  This value is not dynamically configurable in Envoy. A restart is required changing the value of `xff_num_trusted_hops` for Envoy to respect the change.
</Alert>

---

## Traffic management

##### Circuit breaking

Sets the global circuit breaking configuration that Ambassador will use for all mappings, unless overridden in a mapping. 

More information at the [circuit breaking reference](../../using/circuit-breakers).

```yaml
circuit_breakers
  max_connections: 2048
  ...
```

##### Default label domain and labels

Set a default domain and request labels to every request for use by rate limiting. 

For more on how to use these, see the [Rate Limit reference](../../using/rate-limits/rate-limits##an-example-with-global-labels-and-groups).

##### Load balancer

Sets the global load balancing type and policy that Ambassador will use for all mappings unless overridden in a mapping. Defaults to round-robin with Kubernetes. 

More information at the [load balancer reference](../load-balancer).

```yaml
load_balancer:
  policy: round_robin
```

---

## gRPC

#### gRPC HTTP/1.1 bridge 

Enable the gRPC-http11 bridge

```yaml
enable_grpc_http11_bridge: true
```

Ambassador supports bridging HTTP/1.1 clients to backend gRPC servers. When an HTTP/1.1 connection is opened and the request content type is `application/grpc`, Ambassador will buffer the response and translate into gRPC requests. 

For more details on the translation process, see the [Envoy gRPC HTTP/1.1 bridge documentation](https://www.envoyproxy.io/docs/envoy/v1.11.2/configuration/http_filters/grpc_http1_bridge_filter.html). This setting can be enabled by setting `enable_grpc_http11_bridge: true`.

#### gRPC-Web

Enable the gRPC-Web protocol? 

```yaml
enable_grpc_web: true
```

gRPC is a binary HTTP/2-based protocol. While this allows high performance, it is problematic for any programs that cannot speak raw HTTP/2 (such as JavaScript in a browser). gRPC-Web is a JSON and HTTP-based protocol that wraps around the plain gRPC to alleviate this problem and extend benefits of gRPC to the browser, at the cost of performance.

The gRPC-Web specification requires a server-side proxy to translate between gRPC-Web requests and gRPC backend services. Ambassador can serve as the service-side proxy for gRPC-Web when `enable_grpc_web: true` is set. 

Find more on the gRPC Web client [GitHub](https://github.com/grpc/grpc-web).

#### gRPC statistics

Enables telemetry of gRPC calls using Envoy's [gRPC Statistics Filter](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/grpc_stats_filter).

```yaml
---
apiVersion: getambassador.io/v2
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

Use the Envoy filter to enable telemetry of gRPC calls. 

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

`all_methods`: If set to true, emit stats for all service/method names.
If set to false, emit stats for all service/message types to the same stats without including the service/method in the name.
**This option is only safe if all clients are trusted. If this option is enabled with untrusted clients, the clients could cause unbounded growth in the number
of stats in Envoy, using unbounded memory and potentially slowing down stats pipelines.**

`services`: If set, specifies an allow list of service/methods that will have individual stats emitted for them. Any call that does not match the allow list will be counted in a stat with no method specifier (generic metric).

<Alert severity="warning">
  If both <code>all_methods</code> and <code>services</code> are present, <code>all_methods</code> will be ignored.
</Alert>

`upstream_stats`: If true, the filter will gather a histogram for the request time of the upstream.



---

## Service health / timeouts

##### Keepalive

`keepalive` sets the global keepalive settings. Ambassador will use for all mappings unless overridden in a mapping. No default value is provided by Ambassador. More information at https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/address.proto#envoy-api-msg-core-tcpkeepalive.

```
keepalive:
  time: 2
  interval: 2
  probes: 100
...
```

#### Upstream idle timeout (`cluster_idle_timeout_ms`)


Set the default upstream-connection idle timeout. Default is 1 hour. | `cluster_idle_timeout_ms: 30000`

If set, `cluster_idle_timeout_ms` specifies the timeout (in milliseconds) after which an idle connection upstream is closed. If `cluster_idle_timeout` is disabled by setting it to 0, you risk upstream connections never getting closed due to idling if you do not set [`idle_timeout_ms` on each `Mapping`](../../using/timeouts/).

#### Upstream max lifetime (`cluster_max_connection_lifetime_ms`)


Set the default maximum upstream-connection lifetime. Default is 0 which means unlimited. | `cluster_max_connection_lifetime_ms: 0` |

If set, `cluster_max_connection_lifetime_ms` specifies the maximum amount of time (in milliseconds) after which an upstream connection is drained and closed, regardless of whether it is idle or not. Connection recreation incurs additional overhead when processing requests. The overhead tends to be nominal for plaintext (HTTP) connections within the same cluster, but may be more significant for secure HTTPS connections or upstreams with high latency. For this reason, it is generally recommended to set this value to at least 10000ms to minimize the amortized cost of connection recreation while providing a reasonable bound for connection lifetime.

If `cluster_max_connection_lifetime_ms` is not set (or set to zero), then upstream connections may remain open for arbitrarily long. This can be set on a per-Mapping basis by setting [`cluster_max_connection_lifetime_ms` on the `Mapping`](../../using/timeouts/).

#### Request timeout (`cluster_request_timeout_ms`)


Set the default end-to-end timeout for requests. Default is 3000ms.  | `cluster_request_timeout_ms: 3000`

If set, `cluster_request_timeout_ms` specifies the default end-to-end timeout for the requests. This can be set on a per-Mapping basis by setting [`timeout_ms` on the `Mapping`](../../using/timeouts/).

##### Retry policy

`retry_policy` lets you add resilience to your services in case of request failures by performing automatic retries.

```
retry_policy:
  retry_on: "5xx"
  ...
```
#### Listener idle timeout (`listener_idle_timeout_ms`)


| `listener_idle_timeout_ms` | Controls how Envoy configures the tcp idle timeout on the http listener. Default is 1 hour. | `listener_idle_timeout_ms: 30000` |

Controls how Envoy configures the tcp idle timeout on the http listener. Default is no timeout (TCP connection may remain idle indefinitely). This is useful if you have proxies and/or firewalls in front of Ambassador and need to control how Ambassador initiates closing an idle TCP connection. Please see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/v1.12.2/api-v2/api/v2/core/protocol.proto#envoy-api-msg-core-httpprotocoloptions) for more information.

#### Readiness and liveness probes (`readiness_probe` and `liveness_probe`)

The default liveness and readiness probes map `/ambassador/v0/check_alive` and `ambassador/v0/check_ready` internally to check Envoy itself. If you'd like to, you can change these to route requests to some other service. For example, to have the readiness probe map to the quote application's health check, you could do

```yaml
readiness_probe:
  enabled: true
  service: quote
  rewrite: /backend/health
```

The liveness and readiness probes both support `prefix`, `rewrite`, and Module, with the same meanings as for [mappings](../../using/mappings). Additionally, the `enabled` boolean may be set to `false` to disable API support for the probe.  It will, however, remain accessible on port 8877.

---

## Protocols

#### HTTP/1.0 support (`enable_http10`)


| `enable_http10` | Should we enable http/1.0 protocol? | `enable_http10: false` |

Enable/disable the handling of incoming HTTP/1.0 and HTTP 0.9 requests.

#### `enable_ivp4` and `enable_ipv6`


| `enable_ipv4`| Should we do IPv4 DNS lookups when contacting services? Defaults to true, but can be overridden in a [`Mapping`](../../using/mappings). | `enable_ipv4: true` |
| `enable_ipv6` | Should we do IPv6 DNS lookups when contacting services? Defaults to false, but can be overridden in a [`Mapping`](../../using/mappings). | `enable_ipv6: false` |

If both IPv4 and IPv6 are enabled, Ambassador Edge Stack will prefer IPv6. This can have strange effects if Ambassador Edge Stack receives `AAAA` records from a DNS lookup, but the underlying network of the pod doesn't actually support IPv6 traffic. For this reason, the default is IPv4 only.

A `Mapping` can override both `enable_ipv4` and `enable_ipv6`, but if either is not stated explicitly in a `Mapping`, the values here are used. Most Ambassador Edge Stack installations will probably be able to avoid overriding these settings in `Mapping`s.

#### Allow proxy protocol (`use_proxy_proto`)


| `use_proxy_proto` | Controls whether Envoy will honor the PROXY protocol on incoming requests. | `use_proxy_proto: false` |

Many load balancers can use the [PROXY protocol](https://www.haproxy.org/download/1.8/doc/proxy-protocol.txt) to convey information about the connection they are proxying. In order to support this in Ambassador Edge Stack, you'll need to set `use_proxy_protocol` to `true`; this is not the default since the PROXY protocol is not compatible with HTTP.

---

## Observability

| `statsd` | Configures Ambassador statistics. These values can be set in the Ambassador module or in an environment variable. For more information, see the [Statistics reference](../statistics#exposing-statistics-via-statsd). | None |

#### Diagnostics (`diagnostics`)


Enable or disable the [Edge Policy Console](../../using/edge-policy-console) and `/ambassador/v0/diag/` endpoints.  See below for more details. | None |

- Both the API Gateway and the Edge Stack provide low-level diagnostics at `/ambassador/v0/diag/`.
- The Ambassador Edge Stack also provides the higher-level Edge Policy Console at `/edge_stack/admin/`.

By default, both services are enabled:

```
diagnostics:
  enabled: true
```

Setting `diagnostics.enabled` to `false` will disable the routes for both services:

```
diagnostics:
  enabled: false
```

With the routes disabled, `/ambassador/v0/diag` and `/edge_stack/admin/` will respond with 404 -- however, the services themselves are still running, and are reachable from inside the Ambassador pod on localhost port 8877. You can use Kubernetes port forwarding to set up remote access temporarily:

```
kubectl port-forward -n ambassador deploy/ambassador 8877
```

Alternately, you can expose the diagnostics page but control them via `Host` based routing: set `diagnostics.enabled` to false and create mappings as specified in the [FAQ](../../../about/faq#how-do-i-disable-the-default-admin-mappings), using `localhost:8877` as the `service` of the `Mapping`.

You can also allow connections from anywhere in your cluster on port 8877 with `diagnostics.allow_non_local`:

```
diagnostics:
  enabled: false
  allow_non_local: true
```

Note that this will bypass Ambassador's security checks, and _any_ pod in your cluster will be able to reach the diagnostics services.

#### Diagnostics - allow non local

Whether or not to allow connections to the [Edge Policy Console](../../using/edge-policy-console) and `/ambassador/v0/diag/` endpoints from the entire cluster.

```
diagnostics:
  allow_non_local: true
```



---

## Misc

##### Lua scripts (`lua_scripts`)


| `lua_scripts` | Run a custom lua script on every request. see below for more details. | None |

Ambassador Edge Stack supports the ability to inline Lua scripts that get run on every request. This is useful for simple use cases that mutate requests or responses, e.g., add a custom header. Here is a sample:

```yaml
lua_scripts: |
  function envoy_on_response(response_handle)
    response_handle:headers():add("Lua-Scripts-Enabled", "Processed")
  end
```

For more details on the Lua API, see the [Envoy Lua filter documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/lua_filter.html).

**Some caveats around the embedded scripts:**

* They run in-process, so any bugs in your Lua script can break every request
* They're inlined in the Ambassador Edge Stack YAML, so you likely won't want to write complex logic in here
* They're run on every request/response to every URL

If you need more flexible and configurable options, Ambassador Edge Stack supports a [pluggable Filter system](../../using/filters/).


#### `use_ambassador_namespace_for_service_resolution`

Controls whether Ambassador will resolve upstream services assuming they are in the same namespace as the element referring to them, e.g. a Mapping in namespace `foo` will look for its service in namespace `foo`. If `true`, Ambassador will resolve the upstream services assuming they are in the same namespace as Ambassador, unless the service explicitly mentions a different namespace. | `use_ambassador_namespace_for_service_resolution: false` |

#### Regular expressions (`regex_type`)

| `regex_type` | (deprecated) Set which regular expression engine to use. See the "Regular Expressions" section below. | `regex_type: safe` |

| `regex_max_size` | (deprecated) This field controls the RE2 "program size" which is a rough estimate of how complex a compiled regex is to evaluate. A regex that has a program size greater than the configured value will fail to compile.    | `regex_max_size: 200` |

If `regex_type` is unset (the default), or is set to any value other than `unsafe`, Ambassador Edge Stack will use the [RE2](https://github.com/google/re2/wiki/Syntax) regular expression engine. This engine is designed to support most regular expressions, but keep bounds on execution time. **RE2 is the recommended regular expression engine.**

If `regex_type` is set to `unsafe`, Ambassador Edge Stack will use the [modified ECMAScript](https://en.cppreference.com/w/cpp/regex/ecmascript) regular expression engine. **This feature is deprecated**. Please migrate your regular expressions to be compatible with RE2.

#### Overriding default ports (`service_port`)

| `service_port` | If present, service_port will be the port Ambassador listens on for microservice access. If not present, Ambassador will use 8443 if TLS is configured, 8080 otherwise. | `service_port: 8080` |

By default, Ambassador Edge Stack listens for HTTP or HTTPS traffic on ports 8080 or 8443 respectively. This value can be overridden by setting the `service_port` in the Ambassador Module:

```yaml
service_port: 4567
```

This will configure Ambassador Edge Stack to listen for traffic on port 4567 instead of 8080.

#### Envoy's admin port (`admin_port`)

The port where Ambassador's Envoy will listen for low-level admin requests. You should almost never need to change this.

```yaml
admin_port: 8001
```
