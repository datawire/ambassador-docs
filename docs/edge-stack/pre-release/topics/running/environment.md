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
| [`AES_RATELIMIT_PREVIEW`](#aes_ratelimit_preview)                                                          | `false`                                             | Boolean; [Go `strconv.ParseBool`][] |
| [`AES_AUTH_TIMEOUT`](#aes_auth_timeout)                                                                    | `4s`                                                | Duration; [Go `time.ParseDuration`][]
| [`REDIS_SOCKET_TYPE`](#redis_socket_type)                                                                  | `tcp`                                               | Go network such as `tcp` or `unix`; see [Go `net.Dial`][] |
| [`REDIS_URL`](#redis_url)                                                                                  | None, must be set explicitly                        | Go network address; for TCP this is a `host:port` pair; see [Go `net.Dial`][] |
| [`REDIS_TLS_ENABLED`](#redis_tls_enabled)                                                                  | `false`                                             | Boolean; [Go `strconv.ParseBool`][] |
| [`REDIS_TLS_INSECURE`](#redis_tls_insecure)                                                                | `false`                                             | Boolean; [Go `strconv.ParseBool`][] |
| [`REDIS_USERNAME`](#redis_username)                                                                        | Empty                                               | Plain string |
| [`REDIS_PASSWORD`](#redis_password)                                                                        | Empty                                               | Plain string |
| [`REDIS_AUTH`](#redis_auth)                                                                                | Empty                                               | Requires AES_RATELIMIT_PREVIEW; Plain string |
| [`REDIS_POOL_SIZE`](#redis_pool_size)                                                                      | `10`                                                | Integer |
| [`REDIS_PING_INTERVAL`](#redis_ping_interval)                                                              | `10s`                                               | Duration; [Go `time.ParseDuration`][] |
| [`REDIS_TIMEOUT`](#redis_timeout)                                                                          | `0s`                                                | Duration; [Go `time.ParseDuration`][] |
| [`REDIS_SURGE_LIMIT_INTERVAL`](#redis_surge_limit_interval)                                                | `0s`                                                | Duration; [Go `time.ParseDuration`][] |
| [`REDIS_SURGE_LIMIT_AFTER`](#redis_surge_limit_after)                                                      | The value of `REDIS_POOL_SIZE`                      | Integer |
| [`REDIS_SURGE_POOL_SIZE`](#redis_surge_pool_size)                                                          | `0`                                                 | Integer |
| [`REDIS_SURGE_POOL_DRAIN_INTERVAL`](#redis_surge_pool_drain_interval)                                      | `1m`                                                | Duration; [Go `time.ParseDuration`][] |
| [`REDIS_PIPELINE_WINDOW`](#redis_pipeline_window)                                                          | `0`                                                 | Requires AES_RATELIMIT_PREVIEW; Duration; [Go `time.ParseDuration`][] |
| [`REDIS_PIPELINE_LIMIT`](#redis_pipeline_limit)                                                            | `0`                                                 | Requires AES_RATELIMIT_PREVIEW; Integer; [Go `strconv.ParseInt`][] |
| [`REDIS_TYPE`](#redis_type)                                                                                | `SINGLE`                                            | Requires AES_RATELIMIT_PREVIEW; String; SINGLE, SENTINEL, or CLUSTER |
| [`REDIS_PERSECOND`](#redis_persecond)                                                                      | `false`                                             | Boolean; [Go `strconv.ParseBool`][] |
| [`REDIS_PERSECOND_SOCKET_TYPE`](#redis_persecond_socket_type)                                              | None, must be set explicitly (if `REDIS_PERSECOND`) | Go network such as `tcp` or `unix`; see [Go `net.Dial`][] |
| [`REDIS_PERSECOND_URL`](#redis_persecond_url)                                                              | None, must be set explicitly (if `REDIS_PERSECOND`) | Go network address; for TCP this is a `host:port` pair; see [Go `net.Dial`][] |
| [`REDIS_PERSECOND_TLS_ENABLED`](#redis_persecond_tls_enabled)                                              | `false`                                             | Boolean; [Go `strconv.ParseBool`][] |
| [`REDIS_PERSECOND_TLS_INSECURE`](#redis_persecond_tls_insecure)                                            | `false`                                             | Boolean; [Go `strconv.ParseBool`][] |
| [`REDIS_PERSECOND_USERNAME`](#redis_persecond_username)                                                    | Empty                                               | Plain string |
| [`REDIS_PERSECOND_PASSWORD`](#redis_persecond_password)                                                    | Empty                                               | Plain string |
| [`REDIS_PERSECOND_AUTH`](#redis_persecond_auth)                                                            | Empty                                               | Requires AES_RATELIMIT_PREVIEW; Plain string |
| [`REDIS_PERSECOND_POOL_SIZE`](#redis_persecond_pool_size)                                                  | `10`                                                | Integer |
| [`REDIS_PERSECOND_PING_INTERVAL`](#redis_persecond_ping_interval)                                          | `10s`                                               | Duration; [Go `time.ParseDuration`][] |
| [`REDIS_PERSECOND_TIMEOUT`](#redis_persecond_timeout)                                                      | `0s`                                                | Duration; [Go `time.ParseDuration`][] |
| [`REDIS_PERSECOND_SURGE_LIMIT_INTERVAL`](#redis_persecond_surge_limit_interval)                            | `0s`                                                | Duration; [Go `time.ParseDuration`][] |
| [`REDIS_PERSECOND_SURGE_LIMIT_AFTER`](#redis_persecond_surge_limit_after)                                  | The value of `REDIS_PERSECOND_POOL_SIZE`            | Integer |
| [`REDIS_PERSECOND_SURGE_POOL_SIZE`](#redis_persecond_surge_pool_size)                                      | `0`                                                 | Integer |
| [`REDIS_PERSECOND_SURGE_POOL_DRAIN_INTERVAL`](#redis_persecond_surge_pool_drain_interval)                  | `1m`                                                | Duration; [Go `time.ParseDuration`][] |
| [`REDIS_PERSECOND_TYPE`](#redis_persecond_type)                                                            | `SINGLE`                                            | Requires AES_RATELIMIT_PREVIEW; String; SINGLE, SENTINEL, or CLUSTER |
| [`REDIS_PERSECOND_PIPELINE_WINDOW`](#redis_persecond_pipeline_window)                                      | `0`                                                 | Requires AES_RATELIMIT_PREVIEW; Duration; [Go `time.ParseDuration`][] |
| [`REDIS_PERSECOND_PIPELINE_LIMIT`](#redis_persecond_pipeline_limit)                                        | `0`                                                 | Requires AES_RATELIMIT_PREVIEW; Integer |
| [`EXPIRATION_JITTER_MAX_SECONDS`](#expiration_jitter_max_seconds)                                          | `300`                                               | Integer |
| [`USE_STATSD`](#use_statsd)                                                                                | `false`                                             | Boolean; [Go `strconv.ParseBool`][] |
| [`STATSD_HOST`](#statsd_host)                                                                              | `localhost`                                         | Hostname |
| [`STATSD_PORT`](#statsd_port)                                                                              | `8125`                                              | Integer |
| [`GOSTATS_FLUSH_INTERVAL_SECONDS`](#gostats_flush_interval_seconds)                                        | `5`                                                 | Integer |
| [`LOCAL_CACHE_SIZE_IN_BYTES`](#local_cache_size_in_bytes)                                                  | `0`                                                 | Requires AES_RATELIMIT_PREVIEW; Integer |
| [`NEAR_LIMIT_RATIO`](#near_limit_ratio)                                                                    | `0.8`                                               | Requires AES_RATELIMIT_PREVIEW; Float; [Go `strconv.ParseFloat`][] || Developer Portal | `AMBASSADOR_URL` | `https://api.example.com` | URL |
| [`DEVPORTAL_CONTENT_URL`](#devportal_content_url)                                                          | `https://github.com/datawire/devportal-content`     | git-remote URL |
| [`DEVPORTAL_CONTENT_DIR`](#devportal_content_dir)                                                          | `/`                                                 | Rooted Git directory |
| [`DEVPORTAL_CONTENT_BRANCH`](#devportal_content_branch)                                                    | `master`                                            | Git branch name |
| [`DEVPORTAL_DOCS_BASE_PATH`](#devportal_docs_base_path)                                                    | `/doc/`                                            | Git branch name |
| [`POLL_EVERY_SECS`](#poll_every_secs)                                                                      | `60`                                                | Integer |
| [`AES_ACME_LEADER_DISABLE`](#aes_acme_leader_disable)                                                      | `false`                                             | Boolean; [Go `strconv.ParseBool`][] |
| [`AES_REPORT_DIAGNOSTICS_TO_CLOUD`](#aes_report_diagnostics_to_cloud)                                      | `true`                                              | Boolean; [Go `strconv.ParseBool`][] |
| [`AES_SNAPSHOT_URL`](#aes_snapshot_url)                                                                    | `http://emissary-ingress-admin.default:8005/snapshot-external`                                              | hostname |
| [`ENV_AES_SECRET_NAME`](#env_aes_secret_name)                                                              | `ambassador-edge-stack`                                              | String |
| [`ENV_AES_SECRET_NAMESPACE`](#env_aes_secret_namespace)                                                    | $productName$'s Namespace                                              | String |


## Feature Flag Environment Variables

| Variable                                                                                 | Default value                                       | Value type |
|----------------------------------------------------------------------------------------- |-----------------------------------------------------|-------------------------------------------------------------------------------|
| [`AMBASSADOR_EDS_BYPASS`](#ambassador_eds_bypass)                                        | `false`                                             | Boolean; Python `value.lower() == "true"` |
| [`AMBASSADOR_FORCE_SECRET_VALIDATION`](#ambassador_force_secret_validation)              | `false`                                             | Boolean: `true`=true, any other value=false |
| [`AMBASSADOR_KNATIVE_SUPPORT`](#ambassador_knative_support)                              | `false`                                             | Boolean; non-empty=true, empty=false |
| [`AMBASSADOR_UPDATE_MAPPING_STATUS`](#ambassador_update_mapping_status)                  | `false`                                             | Boolean; `true`=true, any other value=false |
| [`ENVOY_CONCURRENCY`](#envoy_concurrency)                                                | Empty                                               | Integer |
| [`DISABLE_STRICT_LABEL_SELECTORS`](#disable_strict_label_selectors)                      | `false`                                             | Boolean: `true`=true, any other value=false |

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

[More information](../../running/running#ambassador-edge-stack-update-checks-scout)

### `AMBASSADOR_CONFIG_BASE_DIR`

Controls where $productName$ will store snapshots. By default, the latest configuration will be in `/ambassador/snapshots`. If you have overridden it, $productName$ saves configurations in `$AMBASSADOR_CONFIG_BASE_DIR/snapshots`.

[More information](../../running/debugging#examine-pod-and-container-contents)

### `AMBASSADOR_DISABLE_FEATURES`

To completely disable feature reporting, set the environment variable `AMBASSADOR_DISABLE_FEATURES` to any non-empty value.

[More information](../../running/running/#ambassador-edge-stack-update-checks-scout)

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

Configures $productName$ (envoy) to send metrics to the Agent which are then relayed to the Cloud. If not set then we don’t configure envoy to send metrics to the agent. If set with a bad address:port then we log an error message. In either scenario, it just stops metrics from being sent to the Agent which has no negative effect on general routing or $productName$ uptime.

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

We do not recommend you disable Scout. This check can be disabled by setting
the environment variable `SCOUT_DISABLE` to `1` in your $productName$ deployment.

[More information](../../running/running#ambassador-edge-stack-usage-telemetry-scout)

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

### `AES_RATELIMIT_PREVIEW`

Enables support for redis clustering, local caching, and an upgraded redis client with improved scalability in
preview mode.

[More information](../aes-redis/#aes_ratelimit_preview)

### `AES_AUTH_TIMEOUT`

Configures the default timeout in the authentication extension.

[More information](../aes-extensions/authentication/#timeout-variables)

### `REDIS_SOCKET_TYPE`

Redis currently support three different deployment methods. $productName$ can now support using a Redis deployed in any of these ways for rate
limiting when `AES_RATELIMIT_PREVIEW=true`.

[More information](../aes-redis#socket_type)

### `REDIS_URL`

The URL to dial to talk to Redis.

This will be either a hostname:port pair or a comma separated list of
hostname:port pairs depending on the [`REDIS_TYPE`](#redis_type) you are using.

[More information](../aes-redis#url)

### `REDIS_TLS_ENABLED`

Specifies whether to use TLS when talking to Redis.

[More information](../aes-redis#tls_enabled)

### `REDIS_TLS_INSECURE`

Specifies whether to skip certificate verification when using TLS to talk to Redis.

[More information](../aes-redis#tls_insecure)

### `REDIS_USERNAME`

`REDIS_USERNAME` and `REDIS_PASSWORD` handle all Redis authentication that is separate from Rate Limit Preview so failing to set them when using `REDIS_AUTH` will result in Ambassador not being able to authenticate with Redis for all of its other functionality.

[More information](../aes-redis#username)

### `REDIS_PASSWORD`

`REDIS_USERNAME` and `REDIS_PASSWORD` handle all Redis authentication that is separate from Rate Limit Preview so failing to set them when using `REDIS_AUTH` will result in Ambassador not being able to authenticate with Redis for all of its other functionality.

[More information](../aes-redis#password)

### `REDIS_AUTH`

If you configure `REDIS_AUTH`, then `REDIS_USERNAME` cannot be changed from the value `default`, and
`REDIS_PASSWORD` should contain the same value as `REDIS_AUTH`.

[More information](../aes-redis#auth)

### `REDIS_POOL_SIZE`

The number of connections to keep around when idle. The total number of connections may go lower than this if there are errors.
The total number of connections may go higher than this during a load surge.

[More information](../aes-redis#pool_size)

### `REDIS_PING_INTERVAL`

The rate at which Ambassador will ping the idle connections in the normal pool
(not extra connections created for a load surge).

[More information](../aes-redis#ping_interval)

### `REDIS_TIMEOUT`

Sets 4 different timeouts:

   1. `(*net.Dialer).Timeout` for establishing connections
   2. `(*redis.Client).ReadTimeout` for reading a single complete response
   3. `(*redis.Client).WriteTimeout` for writing a single complete request
   4. The timeout when waiting for a connection to become available from the pool (not including the dial time, which is timed out separately)

A value of "0" means "no timeout".

[More information](../aes-redis#timeout)

### `REDIS_SURGE_LIMIT_INTERVAL`

During a load surge, if the pool is depleted, then Ambassador may create new
connections to Redis in order to fulfill demand, at a maximum rate of one new
connection per `REDIS_SURGE_LIMIT_INTERVAL`.

[More information](../aes-redis#surge_limit_interval)

### `REDIS_SURGE_LIMIT_AFTER`

The number of connections that can be created _after_ the normal pool is
depleted before `REDIS_SURGE_LIMIT_INTERVAL` kicks in.

[More information](../aes-redis#surge_limit_after)

### `REDIS_SURGE_POOL_SIZE`

Normally during a surge, excess connections beyond `REDIS_POOL_SIZE` are
closed immediately after they are done being used, instead of being returned
to a pool.

`REDIS_SURGE_POOL_SIZE` configures a "reserve" pool for excess connections
created during a surge.

[More information](../aes-redis#surge_pool_size)

### `REDIS_SURGE_POOL_DRAIN_INTERVAL`

How quickly to drain connections from the surge pool after a surge is over.

[More information](../aes-redis#surge_pool_drain_interval)

### `REDIS_PIPELINE_WINDOW`

The duration after which internal pipelines will be flushed.

[More information](../aes-redis#pipeline_window)

### `REDIS_PIPELINE_LIMIT`

The maximum number of commands that can be pipelined before flushing.

[More information](../aes-redis#pipeline_limit)

### `REDIS_TYPE`

Redis currently support three different deployment methods. $productName$ can now support using a Redis deployed in any of these ways for rate
limiting when `AES_RATELIMIT_PREVIEW=true`.

[More information](../aes-redis#type)

### `REDIS_PERSECOND`

If true, a second Redis connection pool is created (to a potentially different Redis instance) that is only used for per-second
RateLimits; this second connection pool is configured by the `REDIS_PERSECOND_*` variables rather than the usual `REDIS_*` variables.

[More information](../aes-redis#redis_persecond)

### `REDIS_PERSECOND_SOCKET_TYPE`

Configures the [REDIS_SOCKET_TYPE](#redis_socket_type) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#socket_type)

### `REDIS_PERSECOND_URL`

Configures the [REDIS_URL](#redis_url) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#url)

### `REDIS_PERSECOND_TLS_ENABLED`

Configures [REDIS_TLS_ENABLED](#redis_tls_enabled) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#tls_enabled)

### `REDIS_PERSECOND_TLS_INSECURE`

Configures [REDIS_TLS_INSECURE](#redis_tls_insecure) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#tls_insecure)

### `REDIS_PERSECOND_USERNAME`

Configures the [REDIS_USERNAME](#redis_username) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#username)

### `REDIS_PERSECOND_PASSWORD`

Configures the [#REDIS_PASSWORD](#redis_password) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#password)

### `REDIS_PERSECOND_AUTH`

Configures [REDIS_AUTH](#redis_auth) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#auth)

### `REDIS_PERSECOND_POOL_SIZE`

Configures the [REDIS_POOL_SIZE](#redis_pool_size) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#pool_size)

### `REDIS_PERSECOND_PING_INTERVAL`

Configures the [REDIS_PING_INTERVAL](#redis_ping_interval) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#ping_interval)

### `REDIS_PERSECOND_TIMEOUT`

Configures the [REDIS_TIMEOUT](#redis_timeout) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#timeout)

### `REDIS_PERSECOND_SURGE_LIMIT_INTERVAL`

Configures the [REDIS_SURGE_LIMIT_INTERVAL](#redis_surge_limit_interval) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#surge_limit_interval)

### `REDIS_PERSECOND_SURGE_LIMIT_AFTER`

Configures [REDIS_SURGE_LIMIT_AFTER](#redis_surge_limit_after) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#surge_limit_after)

### `REDIS_PERSECOND_SURGE_POOL_SIZE`

Configures the [REDIS_SURGE_POOL_SIZE](#redis_surge_pool_size) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#surge_pool_size)

### `REDIS_PERSECOND_SURGE_POOL_DRAIN_INTERVAL`

Configures the [REDIS_SURGE_POOL_DRAIN_INTERVAL](#redis_surge_pool_drain_interval) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#surge_pool_drain_interval)

### `REDIS_PERSECOND_TYPE`

Configures the [REDIS_TYPE](#redis_type) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#type)

### `REDIS_PERSECOND_PIPELINE_WINDOW`

Configures the [REDIS_PIPELINE_WINDOW](#redis_pipeline_window) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#pipeline_window)

### `REDIS_PERSECOND_PIPELINE_LIMIT`

Configures the [REDIS_PIPELING_LIMIT](#redis_pipeline_limit) for the second [REDIS_PERSECOND](#redis_persecond) connection pool.

[More information](../aes-redis#pipeline_limit)

### `EXPIRATION_JITTER_MAX_SECONDS`

### `USE_STATSD`

The `RateLimitService` reports to statsd, and attempts to do so by default (`USE_STATSD`, `STATSD_HOST`, `STATSD_PORT`, `GOSTATS_FLUSH_INTERVAL_SECONDS`).

### `GOSTATS_FLUSH_INTERVAL_SECONDS`

Configures the flush interval in seconds for the go statistics.

### `LOCAL_CACHE_SIZE_IN_BYTES`

Only available if `AES_RATELIMIT_PREVIEW: "true`. The AES rate limit extension can optionally cache over-the-limit keys so it does
not need to read the redis cache again for requests with labels that are already over the limit.

Setting `LOCAL_CACHE_SIZE_IN_BYTES` to a non-zero value with enable local caching.

[More information](../aes-extensions/ratelimit#local_cache_size_in_bytes)

### `NEAR_LIMIT_RATIO`

Only available if `AES_RATELIMIT_PREVIEW: "true"`. Adjusts the ratio used by the `near_limit` statistic for tracking requests that
are "near the limit". Defaults to `0.8` (80%) of the limit defined in the `RateLimit` rule.

[More information](../aes-extensions/ratelimit#near_limit_ratio)

### `DEVPORTAL_CONTENT_URL`

Default URL to the repository hosting the content for the Portal

[More information](../../using/dev-portal)

### `DEVPORTAL_CONTENT_DIR`

Default content subdirectory within the `DEVPORTAL_CONTENT_URL` the devportal content is located at (defaults to `/`)

[More information](../../using/dev-portal)

### `DEVPORTAL_CONTENT_BRANCH`

Default content branch within the repo at `DEVPORTAL_CONTENT_URL` to use for the devportal content (defaults to `master`)

[More information](../../using/dev-portal)

### `DEVPORTAL_DOCS_BASE_PATH`

Base path for each api doc (defaults to `/doc/`)

[More information](../../using/dev-portal)

### `POLL_EVERY_SECS`

Interval for polling OpenAPI docs; default 60 seconds. Set to 0 to disable devportal polling.

[More information](../../using/dev-portal)

### `AES_ACME_LEADER_DISABLE`

This prevents $productName$ from trying to manage ACME. When enabled, `Host` resources will be unable to use ACME to manage their tls secrets
regardless of the config on the `Host` resource.

### `AES_REPORT_DIAGNOSTICS_TO_CLOUD`

By setting `AES_REPORT_DIAGNOSTICS_TO_CLOUD` to false, you can disable the feature where diagnostic information about your installation of $productName$
will be sent to Ambassador cloud. If this variable is disabled, you will be unable to access cluster diagnostic information in the cloud.

### `AES_SNAPSHOT_URL`

Configures the default endpoint where config snapshots are stored and accessed.

### `ENV_AES_SECRET_NAME`

Use to override the name of the secret that $productName$ attempts to find licensing information in.

### `ENV_AES_SECRET_NAMESPACE`

Use to override the namespace of the secret that $productName$ attempts to find licensing information in.
By default, $productName$ will look for the secret in the same namespace that $productName$ was installed in.

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

In $productName$ version `3.2`, a bug with how `Hosts` are associated with `Mappings` was fixed and with how `Listeners` are associated with `Hosts`. The `mappingSelector`\\`selector` fields in `Hosts` and `Listeners` were not
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
