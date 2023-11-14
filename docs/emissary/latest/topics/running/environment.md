# $productName$ Environment variables

Use the following variables for the environment of your $productName$ container:

| Variable                                                                                                   | Default value                                       | Value type |
|----------------------------------------------------------------------------------------------------------- |-----------------------------------------------------|-------------------------------------------------------------------------------|
| [`AMBASSADOR_ID`](#ambassador_id)                                                                          | `[ "default" ]`                                     | List of strings |
| [`AES_LOG_LEVEL`](#aes_log_level)                                                                          | `warn`                                              | Log level |
| [`AGENT_CONFIG_RESOURCE_NAME`](#agent_config_resource_name)                                                | `ambassador-agent-cloud-token`                      | String |
| [`AMBASSADOR_AMBEX_NO_RATELIMIT`](#ambassador_ambex_no_ratelimit)                                          | `false`                                             | Boolean: `true`=true, any other value=false |
| [`AMBASSADOR_AMBEX_SNAPSHOT_COUNT`](#ambassador_ambex_snapshot_count)                                      | `30`                                                | Integer |
| [`AMBASSADOR_CLUSTER_ID`](#ambassador_cluster_id)                                                          | Empty                                               | String |
| [`AMBASSADOR_CONFIG_BASE_DIR`](#ambassador_config_base_dir)                                                | `/ambassador`                                       | String |
| [`AMBASSADOR_DISABLE_FEATURES`](#ambassador_disable_features)                                              | Empty                                               | Any |
| [`AMBASSADOR_DRAIN_TIME`](#ambassador_drain_time)                                                          | `600`                                               | Integer |
| [`AMBASSADOR_ENVOY_API_VERSION`](#ambassador_envoy_api_version)                                            | `V3`                                                | String Enum; `V3` or `V2` |
| [`AMBASSADOR_GRPC_METRICS_SINK`](#ambassador_grpc_metrics_sink)                                            | Empty                                               | String (address:port) |
| [`AMBASSADOR_HEALTHCHECK_BIND_ADDRESS`](#ambassador_healthcheck_bind_address)| `0.0.0.0`        | String   |
| [`AMBASSADOR_HEALTHCHECK_BIND_PORT`](#ambassador_healthcheck_bind_port)| `8877`                  | Integer |
| [`AMBASSADOR_HEALTHCHECK_IP_FAMILY`](#ambassador_healthcheck_ip_family)| `ANY`        | String Enum; `IPV4_ONLY` or `IPV6_ONLY`|
| [`AMBASSADOR_ISTIO_SECRET_DIR`](#ambassador_istio_secret_dir)                                              | `/etc/istio-certs`                                  | String |
| [`AMBASSADOR_JSON_LOGGING`](#ambassador_json_logging)                                                      | `false`                                             | Boolean; non-empty=true, empty=false |
| [`AMBASSADOR_READY_PORT`](#ambassador_ready_port)                                                          | `8006`                                              | Integer |
| [`AMBASSADOR_READY_LOG`](#ambassador_ready_log)                                                            | `false`                                             | Boolean; [Go `strconv.ParseBool`] |
| [`AMBASSADOR_LABEL_SELECTOR`](#ambassador_label_selector)                                                  | Empty                                               | String (label=value) |
| [`AMBASSADOR_NAMESPACE`](#ambassador_namespace)                                                            | `default` ([^1])                                    | Kubernetes namespace |
| [`AMBASSADOR_RECONFIG_MAX_DELAY`](#ambassador_reconfig_max_delay)                                          | `1`                                                 | Integer |
| [`AMBASSADOR_SINGLE_NAMESPACE`](#ambassador_single_namespace)                                              | Empty                                               | Boolean; non-empty=true, empty=false |
| [`AMBASSADOR_SNAPSHOT_COUNT`](#ambassador_snapshot_count)                                                  | `4`                                                 | Integer |
| [`AMBASSADOR_VERIFY_SSL_FALSE`](#ambassador_verify_ssl_false)                                              | `false`                                             | Boolean; `true`=true, any other value=false |
| [`DD_ENTITY_ID`](#dd_entity_id)                                                                            | Empty                                               | String |
| [`DOGSTATSD`](#dogstatsd)                                                                                  | `false`                                             | Boolean; Python `value.lower() == "true"` |
| [`SCOUT_DISABLE`](#scout_disable)                                                                          | `false`                                             | Boolean; `false`=false, any other value=true |
| [`STATSD_ENABLED`](#statsd_enabled)                                                                        | `false`                                             | Boolean; Python `value.lower() == "true"` |
| [`STATSD_PORT`](#statsd_port)                                                                              | `8125`                                              | Integer |
| [`STATSD_HOST`](#statsd_host)                                                                              | `statsd-sink`                                       | String |
| [`STATSD_FLUSH_INTERVAL`](#statsd_flush_interval)                                                          | `1`                                                 | Integer |
| [`_AMBASSADOR_ID`](#_ambassador_id)                                                                        | Empty                                               | String |
| [`_AMBASSADOR_TLS_SECRET_NAME`](#_ambassador_tls_secret_name)                                              | Empty                                               | String |
| [`_AMBASSADOR_TLS_SECRET_NAMESPACE`](#_ambassador_tls_secret_namespace)                                    | Empty                                               | String |
| [`_CONSUL_HOST`](#_consul_host)                                                                            | Empty                                               | String |
| [`_CONSUL_PORT`](#_consul_port)                                                                            | Empty                                               | Integer |
| [`AMBASSADOR_DISABLE_SNAPSHOT_SERVER`](#ambassador_disable_snapshot_server)                                | `false`                                             | Boolean; non-empty=true, empty=false |
| [`AMBASSADOR_ENVOY_BASE_ID`](#ambassador_envoy_base_id)                                                    | `0`                                                 | Integer |                                                                 | `false`                                             | Boolean; Python `value.lower() == "true"` |


## Feature Flag Environment Variables

| Variable                                                                                 | Default value                                       | Value type |
|----------------------------------------------------------------------------------------- |-----------------------------------------------------|-------------------------------------------------------------------------------|
| [`AMBASSADOR_EDS_BYPASS`](#ambassador_eds_bypass)                                        | `false`                                             | Boolean; Python `value.lower() == "true"` |
| [`AMBASSADOR_FORCE_SECRET_VALIDATION`](#ambassador_force_secret_validation)              | `false`                                             | Boolean: `true`=true, any other value=false |
| [`AMBASSADOR_KNATIVE_SUPPORT`](#ambassador_knative_support)                              | `false`                                             | Boolean; non-empty=true, empty=false |
| [`AMBASSADOR_UPDATE_MAPPING_STATUS`](#ambassador_update_mapping_status)                  | `false`                                             | Boolean; `true`=true, any other value=false |
| [`ENVOY_CONCURRENCY`](#envoy_concurrency)                                                | Empty                                               | Integer |
| [`DISABLE_STRICT_LABEL_SELECTORS`](#disable_strict_label_selectors)                      | `false`                                             | Boolean; `true`=true, any other value=false |

### `AMBASSADOR_ID`

$productName$ supports running multiple installs in the same cluster without restricting a given instance of $productName$ to a single namespace.
The resources that are visible to an installation can be limited with the `AMBASSADOR_ID` environment variable.

[More information](../../running/running#ambassador_id)

### `AES_LOG_LEVEL`

Adjust the log level by setting the `AES_LOG_LEVEL` environment variable; from least verbose to most verbose, the valid values are `error`, `warn`/`warning`, `info`, `debug`, and `trace`. The default is `info`.
Log level names are case-insensitive.

[More information](../../running/running#log-levels-and-debugging)

### `AGENT_CONFIG_RESOURCE_NAME`

Allows overriding the default config_map/secret that is used for extracting the CloudToken for connecting with Ambassador cloud. It allows all
components (and not only the Ambassador Agent) to authenticate requests to Ambassador Cloud.
If unset it will just fallback to searching for a config map or secret with the name of `ambassador-agent-cloud-token`. Note: the secret will take precedence if both a secret and config map are set.

### `AMBASSADOR_AMBEX_NO_RATELIMIT`

Completely disables ratelimiting Envoy reconfiguration under memory pressure. This can help performance with the endpoint or Consul resolvers, but could make OOMkills more likely with large configurations.
The default is `false`, meaning that the rate limiter is active.

[More information](../../../topics/concepts/rate-limiting-at-the-edge/)

### `AMBASSADOR_AMBEX_SNAPSHOT_COUNT`

Envoy-configuration snapshots get saved (as `ambex-#.json`) in `/ambassador/snapshots`. The number of snapshots is controlled by the `AMBASSADOR_AMBEX_SNAPSHOT_COUNT` environment variable.
Set it to 0 to disable.

[More information](../../running/debugging#examine-pod-and-container-contents)

### `AMBASSADOR_CLUSTER_ID`

Each $productName$ installation generates a unique cluster ID based on the UID of its Kubernetes namespace and its $productName$ ID: the resulting cluster ID is a UUID which cannot be used
to reveal the namespace name nor $productName$ ID itself. $productName$ needs RBAC permission to get namespaces for this purpose, as shown in the default YAML files provided by Datawire;
if not granted this permission it will generate a UUID based only on the $productName$ ID. To disable cluster ID generation entirely, set the environment variable
`AMBASSADOR_CLUSTER_ID` to a UUID that will be used for the cluster ID.

[More information](../../running/running#emissary-ingress-usage-telemetry-scout)

### `AMBASSADOR_CONFIG_BASE_DIR`

Controls where $productName$ will store snapshots. By default, the latest configuration will be in `/ambassador/snapshots`. If you have overridden it, $productName$ saves configurations in `$AMBASSADOR_CONFIG_BASE_DIR/snapshots`.

[More information](../../running/debugging#examine-pod-and-container-contents)

### `AMBASSADOR_DISABLE_FEATURES`

To completely disable feature reporting, set the environment variable `AMBASSADOR_DISABLE_FEATURES` to any non-empty value.

[More information](../../running/running#emissary-ingress-usage-telemetry-scout)

### `AMBASSADOR_DRAIN_TIME`

At each reconfiguration, $productName$ keeps around the old version of it's envoy config for the duration of the configured drain time.
The `AMBASSADOR_DRAIN_TIME` variable controls how much of a grace period $productName$ provides active clients when reconfiguration happens.
Its unit is seconds and it defaults to 600 (10 minutes). This can impact memory usage because $productName$ needs to keep around old versions of its configuration
for the duration of the drain time.

[More information](../../running/scaling#ambassador_drain_time)

### `AMBASSADOR_ENVOY_API_VERSION`

By default, $productName$ will configure Envoy using the [V3 Envoy API](https://www.envoyproxy.io/docs/envoy/latest/api-v3/api).
In $productName$ 2.0, you were able switch back to Envoy V2 by setting the `AMBASSADOR_ENVOY_API_VERSION` environment variable to "V2".
$productName$ 3.0 has removed support for the V2 API and only the V3 API is used. While this variable cannot be set to another value in 3.0, it may
be used when introducing new API versions that are not yet available in $productName$ such as V4.

### `AMBASSADOR_GRPC_METRICS_SINK`

Configures Edgissary (envoy) to send metrics to the Agent which are then relayed to the Cloud. If not set then we don’t configure envoy to send metrics to the agent. If set with a bad address:port then we log an error message. In either scenario, it just stops metrics from being sent to the Agent which has no negative effect on general routing or Edgissary uptime.

### `AMBASSADOR_HEALTHCHECK_BIND_ADDRESS`

Configures $productName$ to bind its health check server to the provided address. If not set $productName$ will bind to all addresses (`0.0.0.0`).

### `AMBASSADOR_HEALTHCHECK_BIND_PORT`

Configures $productName$ to bind its health check server to the provided port. If not set $productName$ will listen on the admin port(`8877`).

### `AMBASSADOR_HEALTHCHECK_IP_FAMILY`

Allows the IP Family used by health check server to be overriden. By default, the health check server will listen for both IPV4 and IPV6 addresses. In some clusters you may want to force `IPV4_ONLY` or `IPV6_ONLY`.

### `AMBASSADOR_ISTIO_SECRET_DIR`

$productName$ will read the mTLS certificates from `/etc/istio-certs` unless configured to use a different directory with the `AMBASSADOR_ISTIO_SECRET_DIR`
environment variable and create a secret in that location named `istio-certs`.

[More information](../../../howtos/istio#configure-an-mtls-tlscontext)

### `AMBASSADOR_JSON_LOGGING`

When `AMBASSADOR_JSON_LOGGING` is set to `true`, JSON format will be used for most of the control plane logs.
Some (but few) logs from `gunicorn` and the Kubernetes `client-go` package will still be in text only format.

[More information](../../running/running#log-format)

### `AMBASSADOR_READY_PORT`

A dedicated Listener is created for non-blocking readiness checks. By default, the Listener will listen on the loopback address
and port `8006`. `8006` is part of the reserved ports dedicated to $productName$. If their is a conflict then setting
`AMBASSADOR_READY_PORT` to a valid port will configure Envoy to Listen on that port.

### `AMBASSADOR_READY_LOG`

When `AMBASSADOR_READY_LOG` is set to `true`, the envoy `/ready` endpoint will be logged. It will honor format
provided in the `Module` resource or default to the standard log line format.

### `AMBASSADOR_LABEL_SELECTOR`

Restricts $productName$'s configuration to only the labelled resources. For example, you could apply a `version-two: true` label
to all resources that should be visible to $productName$, then set `AMBASSADOR_LABEL_SELECTOR=version-two=true` in its Deployment.
Resources without the specified label will be ignored.

### `AMBASSADOR_NAMESPACE`

Controls namespace configuration for Amabssador.

[More information](../../running/running#namespaces)

### `AMBASSADOR_RECONFIG_MAX_DELAY`

Controls up to how long Ambassador will wait to receive changes before doing an Envoy reconfiguration. The unit is
in seconds and must be > 0.

### `AMBASSADOR_SINGLE_NAMESPACE`

When set, configures $productName$ to only work within a single namespace.

[More information](../../running/running#namespaces)

### `AMBASSADOR_SNAPSHOT_COUNT`

The number of snapshots that $productName$ should save.

### `AMBASSADOR_VERIFY_SSL_FALSE`

By default, $productName$ will verify the TLS certificates provided by the Kubernetes API. In some situations, the cluster may be
deployed with self-signed certificates. In this case, set `AMBASSADOR_VERIFY_SSL_FALSE` to `true` to disable verifying the TLS certificates.

[More information](../../running/running#ambassador_verify_ssl_false)

### `DD_ENTITY_ID`

$productName$ supports setting the `dd.internal.entity_id` statitics tag using the `DD_ENTITY_ID` environment variable. If this value
is set, statistics will be tagged with the value of the environment variable. Otherwise, this statistics tag will be omitted (the default).

[More information](../../running/statistics/envoy-statsd#using-datadog-dogstatsd-as-the-statsd-sink)

### `DOGSTATSD`

If you are a user of the [Datadog](https://docs.datadoghq.com/) monitoring system, pulling in the Envoy statistics from $productName$ is very easy.
Because the DogStatsD protocol is slightly different than the normal StatsD protocol, in addition to setting $productName$'s
`STATSD_ENABLED=true` environment variable, you also need to set the`DOGSTATSD=true` environment variable.

[More information](../../running/statistics/envoy-statsd#using-datadog-dogstatsd-as-the-statsd-sink)

### `SCOUT_DISABLE`

$productName$ integrates Scout, a service that periodically checks with Ambassador Labs servers to sends anonymized usage data and the $productName$ version. This information is important to us as we prioritize test coverage, bug fixes, and feature development. Note that the $productName$ will run regardless of the status of Scout.

We do not recommend you disable Scout. This check can be disabled by setting the environment variable `SCOUT_DISABLE` to `1` in your $productName$ deployment.

[More information](../../running/running#emissary-ingress-usage-telemetry-scout)

### `STATSD_ENABLED`

If enabled, then $productName$ has Envoy expose metrics information via the ubiquitous and well-tested [StatsD](https://github.com/etsy/statsd)
protocol.  To enable this, you will simply need to set the environment variable `STATSD_ENABLED=true` in $productName$'s deployment YAML

[More information](../../running/statistics/envoy-statsd#envoy-statistics-with-statsd)

### `STATSD_HOST`

When this variable is set, $productName$ by default sends statistics to a Kubernetes service named `statsd-sink` on UDP port 8125 (the usual
port of the StatsD protocol).  You may instead tell $productName$ to send the statistics to a different StatsD server by setting the
`STATSD_HOST` environment variable.  This can be useful if you have an existing StatsD sink available in your cluster.

[More information](../../running/statistics/envoy-statsd#envoy-statistics-with-statsd)

### `STATSD_PORT`

Allows for configuring StatsD on a port other than the default (8125)

[More information](../../running/statistics/envoy-statsd#envoy-statistics-with-statsd)

### `STATSD_FLUSH_INTERVAL`

How often, in seconds, to submit statsd reports (if `STATSD_ENABLED`)

[More information](../../running/statistics/envoy-statsd#envoy-statistics-with-statsd)

### `_AMBASSADOR_ID`

Used with the Ambassador Consul connector. Sets the Ambassador ID so multiple instances of this integration can run per-Cluster when there are multiple $productNamePlural$ (Required if `AMBASSADOR_ID` is set in your $productName$ `Deployment`

[More information](../../../howtos/consul#environment-variables)

### `_AMBASSADOR_TLS_SECRET_NAME`

Used with the Ambassador Consul connector. Sets the name of the Kubernetes `v1.Secret` created by this program that contains the Consul-generated TLS certificate.

[More information](../../../howtos/consul#environment-variables)

### `_AMBASSADOR_TLS_SECRET_NAMESPACE`

Used with the Ambassador Consul connector. Sets the namespace of the Kubernetes `v1.Secret` created by this program.

[More information](../../../howtos/consul#environment-variables)

### `_CONSUL_HOST`

Used with the Ambassador Consul connector. Sets the IP or DNS name of the target Consul HTTP API server

[More information](../../../howtos/consul#environment-variables)

### `_CONSUL_PORT`

Used with the Ambassador Consul connector. Sets the port number of the target Consul HTTP API server.

[More information](../../../howtos/consul#environment-variables)

### `AMBASSADOR_DISABLE_SNAPSHOT_SERVER`

Disables the built-in snapshot server

### `AMBASSADOR_ENVOY_BASE_ID`

Base ID of the Envoy process

### `AMBASSADOR_EDS_BYPASS`

Bypasses EDS handling of endpoints and causes endpoints to be inserted to clusters manually. This can help resolve with `503 UH`
caused by certification rotation relating to a delay between EDS + CDS.

### `AMBASSADOR_FORCE_SECRET_VALIDATION`

If you set the `AMBASSADOR_FORCE_SECRET_VALIDATION` environment variable, invalid Secrets will be rejected,
and a `Host` or `TLSContext` resource attempting to use an invalid certificate will be disabled entirely.

[More information](../../running/tls#certificates-and-secrets)

### `AMBASSADOR_KNATIVE_SUPPORT`

Enables support for knative

### `AMBASSADOR_UPDATE_MAPPING_STATUS`

If `AMBASSADOR_UPDATE_MAPPING_STATUS` is set to the string `true`, $productName$ will update the `status` of every `Mapping`
CRD that it accepts for its configuration. This has no effect on the proper functioning of $productName$ itself, and can be a
performance burden on installations with many `Mapping`s. It has no effect for `Mapping`s stored as annotations.

The default is `false`. We recommend leaving `AMBASSADOR_UPDATE_MAPPING_STATUS` turned off unless required for external systems.

[More information](../../running/running#ambassador_update_mapping_status)

### `ENVOY_CONCURRENCY`

Configures the optional [--concurrency](https://www.envoyproxy.io/docs/envoy/latest/operations/cli#cmdoption-concurrency) command line option when launching Envoy.
This controls the number of worker threads used to serve requests and can be used to fine-tune system resource usage.

### `DISABLE_STRICT_LABEL_SELECTORS`

In $productName$ version `3.2`, a bug with how `Hosts` are associated with `Mappings` was fixed and with how `Listeners` are assocaited with `Hosts`. The `mappingSelector`\\`selector` fields in `Hosts` and `Listeners` were not
properly being enforced in prior versions. If any single label from the selector was matched then the resources would be associated with each other instead
of requiring all labels in the selector to be present. Additonally, if the `hostname` of a `Mapping` matched the `hostname` of a `Host` then they would be associated
regardless of the configuration of `mappingSelector`\\`selector`.

In version `3.2` this bug was fixed and resources that configure a selector will only be associated if **all** labels required by the selector are present.
This brings the `mappingSelector` and `selector` fields in-line with how label selectors are used throughout Kubernetes. To avoid unexpected behavior after the upgrade,
add all labels that configured in any `mappingSelector`\\`selector` to `Mappings` you want to associate with the `Host` or the `Hosts` you want to be associated with the `Listener`. You can opt-out of this fix and return to the old
association behavior by setting the environment variable `DISABLE_STRICT_LABEL_SELECTORS` to `"true"` (default: `"false"`). A future version of
$productName$ may remove the ability to opt-out of this bugfix.

> **Note:** The `mappingSelector` field is only configurable on `v3alpha1` CRDs. In the `v2` CRDs the equivalent field is `selector`.
either `selector` or `mappingSelector` may be configured in the `v3alpha1` CRDs, but `selector` has been deprecated in favour of `mappingSelector`.

See The [Host documentation](../../running/host-crd#controlling-association-with-mappings) for more information about `Host` / `Mapping` association.

## Port assignments

$productName$ uses the following ports to listen for HTTP/HTTPS traffic automatically via TCP:

| Port | Process  | Function                                                |
|------|----------|---------------------------------------------------------|
| 8001 | envoy    | Internal stats, logging, etc.; not exposed outside pod  |
| 8002 | watt     | Internal watt snapshot access; not exposed outside pod  |
| 8003 | ambex    | Internal ambex snapshot access; not exposed outside pod |
| 8004 | diagd    | Internal `diagd` access; not exposed outside pod        |
| 8005 | snapshot | Exposes a scrubbed $productName$ snapshot outside of the pod |
| 8080 | envoy    | Default HTTP service port                               |
| 8443 | envoy    | Default HTTPS service port                              |
| 8877 | diagd    | Direct access to diagnostics UI; provided by `busyambassador entrypoint` |

[^1]: This may change in a future release to reflect the Pods's
      namespace if deployed to a namespace other than `default`.
      https://github.com/emissary-ingress/emissary/issues/1583

[Go `net.Dial`]: https://golang.org/pkg/net/#Dial
[Go `strconv.ParseBool`]: https://golang.org/pkg/strconv/#ParseBool
[Go `time.ParseDuration`]: https://pkg.go.dev/time#ParseDuration
[Redis 6 ACL]: https://redis.io/topics/acl
