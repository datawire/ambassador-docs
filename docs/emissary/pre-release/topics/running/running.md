# Running and deployment

This section is intended for operators running $productName$, and covers various aspects of deploying and configuring the $productName$ in production.

## $productName$ and Kubernetes

$productName$ relies on Kubernetes for reliability, availability, and scalability. This means that features such as Kubernetes readiness and liveness probes, rolling updates, and the Horizontal Pod Autoscaling should be utilized to manage $productName$.

## Default configuration

The default configuration of $productName$ includes default [resource limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-requests-and-limits-of-pod-and-container), as well as [readiness and liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/). These values should be adjusted for your specific environment.

## Running as non-root

Starting with $productName$ 0.35, we support running $productName$ as non-root. This is the recommended configuration, and will be the default configuration in future releases. We recommend you configure $productName$ to run as non-root as follows:

* Have Kubernetes run $productName$ as non-root. This may happen by default (e.g., OpenShift) or you can set a `securityContext` in your Deployment as shown below in this abbreviated example:

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ambassador
spec:
  replicas: 1
  selector:
    matchLabels:
      service: ambassador
  template:
    metadata:
      labels:
        service: ambassador
    spec:
      containers:
        image: docker.io/datawire/aes:$version$
        name: ambassador
     restartPolicy: Always
     securityContext:
       runAsUser: 8888
     serviceAccountName: ambassador
```

* Set the `service_port` element in the `ambassador Module` to 8080 (cleartext) or 8443 (TLS). This is the port that $productName$ will use to listen to incoming traffic. Note that any port number above 1024 will work; $productName$ will use 8080/8443 as its defaults in the future.

* Make sure that incoming traffic to $productName$ is configured to route to the `service_port`. If you're using the default $productName$ configuration, this means configuring the `targetPort` to point to the `service_port` above.

* If you are using `redirect_cleartext_from`, change the value of this field to point to your cleartext port (e.g., 8080) and set `service_port` to be your TLS port (e.g., 8443).

## Changing the configuration directory

While running, $productName$ needs to use a directory within its container for generated configuration data. Normally this is `/ambassador`, but in some situations - especially if running as non-root - it may be necessary to change to a different directory. To do so, set the environment variable `AMBASSADOR_CONFIG_BASE_DIR` to the full pathname of the directory to use, as shown below in this abbreviated example:

```yaml
env:
- name: AMBASSADOR_CONFIG_BASE_DIR
  value: /tmp/ambassador-config
```

With `AMBASSADOR_CONFIG_BASE_DIR` set as above, $productName$ will create and use the directory `/tmp/ambassador-config` for its generated data. (Note that, while the directory will be created if it does not exist, attempts to turn an existing file into a directory will fail.)

## Running as DaemonSet

$productName$ can be deployed as a DaemonSet to have one pod per node in a Kubernetes cluster. This setup is especially helpful when you have a Kubernetes cluster running on a private cloud.

* In an ideal example scenario, you are running containers on Kubernetes alongside with your non-containerized applications running exposed via VIP using BIG-IP or similar products. In such cases, east-west traffic is routed based on iRules to certain a set of application pools consisting of application or web servers. In this setup, alongside traditional application servers, two or more $productName$ pods can also be part of the application pools. In case of failure there is at least one $productName$ pod available to BIG-IP that can take care of routing traffic to the Kubernetes cluster.

* In manifest files `kind: Deployment` needs to be updated to `kind: DaemonSet`  and  `replicas` should be removed in `spec` section.

## Namespaces

$productName$ supports multiple namespaces within Kubernetes. To make this work correctly, you need to set the `AMBASSADOR_NAMESPACE` environment variable in $productName$'s container. By far the easiest way to do this is using Kubernetes' downward API (this is included in the YAML files from `getambassador.io`):

```yaml
env:
- name: AMBASSADOR_NAMESPACE
  valueFrom:
    fieldRef:
      fieldPath: metadata.namespace
```

Given that `AMBASSADOR_NAMESPACE` is set, $productName$ [`Mappings`](../../using/mappings) can operate within the same namespace, or across namespaces. **Note well** that `Mappings` will have to explicitly include the namespace with the service to cross namespaces; see the [`Mapping`](../../using/mappings) documentation for more information.

If you want $productName$ to only work within a single namespace, set `AMBASSADOR_SINGLE_NAMESPACE` as an environment variable.

```yaml
env:
- name: AMBASSADOR_NAMESPACE
  valueFrom:
    fieldRef:
      fieldPath: metadata.namespace
- name: AMBASSADOR_SINGLE_NAMESPACE
  value: "true"
```

With $productName$, if you set `AMBASSADOR_NAMESPACE` or `AMBASSADOR_SINGLE_NAMESPACE`, set it in the deployment container.

If you want to set a certificate for your `TLScontext` from another namespace, you can use the following:

```yaml
env:
- name: AMBASSADOR_SINGLE_NAMESPACE
  value: "YES"
- name: AMBASSADOR_CERTS_SINGLE_NAMESPACE
  value: "YES"
- name: AMBASSADOR_NAMESPACE
  valueFrom:
    fieldRef:
      apiVersion: v1
      fieldPath: metadata.namespace
```

## `AMBASSADOR_ID`

$productName$ supports running multiple $productNamePlural$ in the same cluster, without restricting a given $productName$ to a single namespace. This is done with the `AMBASSADOR_ID` setting. In the `ambassador Module`, set the `ambassador_id`, e.g.,

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Module
metadata:
  name:  ambassador
spec:
  ambassador_id: [ "ambassador-1" ]
  config:
    ...
```

Then, assign each $productName$ pod a unique `AMBASSADOR_ID` with the environment variable as part of your deployment:

```yaml
env:
- name: AMBASSADOR_ID
  value: ambassador-1
```

With $productName$, if you set `AMBASSADOR_ID`, you will need to set it in the deployment container.

$productName$ will then only use YAML objects that include an appropriate `ambassador_id` attribute. For example, if $productName$ is given the ID `ambassador-1` as above, only the first two YAML objects below will be used:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  mapping-used
spec:
  ambassador_id: [ "ambassador-1" ]
  prefix: /demo1/
  service: demo1
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  mapping-used-2
spec:
  ambassador_id: [ "ambassador-1", "ambassador-2" ]
  prefix: /demo2/
  service: demo2
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  mapping-skipped
spec:
  prefix: /demo3/
  service: demo3
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  mapping-skipped-2
spec:
  ambassador_id: [ "ambassador-2" ]
  prefix: /demo4/
  service: demo4
```

`ambassador_id` is always a list, and may (as shown in `mapping-used-2` above) include multiple IDs to allow a given object in the configuration for multiple $productName$ instances. In this case, `mapping-used-2` will be included in the configuration for `ambassador-1` and also for `ambassador-2`.

**Note well that _any_ $productName$ configuration resource can have an `ambassador_id` included** so, for example, it is _fully supported_ to use `ambassador_id` to qualify the `ambassador Module`, `TLSContext`, and `AuthService` objects. You will need to set `ambassador_id` in all resources you want to use for $productName$.

If no `AMBASSADOR_ID` is assigned to an $productName$, it will use the ID `default`. If no `ambassador_id` is present in a YAML object, it will also use the ID `default`.

## `AMBASSADOR_ENVOY_BASE_ID`

$productName$ supports running side-by-side with other envoy-based projects in a single pod. An example of this is running with an `istio` sidecar. This is done with the `AMBASSADOR_ENVOY_BASE_ID` environment variable as part of your deployment:

```yaml
env:
- name: AMBASSADOR_ENVOY_BASE_ID
  value: 1
```

If no `AMBASSADOR_ENVOY_BASE_ID` is provided then it will use the ID `0`. For more information on the Envoy base-id option please see the [Envoy command line documentation](https://www.envoyproxy.io/docs/envoy/latest/operations/cli.html?highlight=base%20id#cmdoption-base-id).

## `AMBASSADOR_VERIFY_SSL_FALSE`

By default, $productName$ will verify the TLS certificates provided by the Kubernetes API. In some situations, the cluster may be deployed with self-signed certificates. In this case, set `AMBASSADOR_VERIFY_SSL_FALSE` to `true` to disable verifying the TLS certificates.

## `AMBASSADOR_UPDATE_MAPPING_STATUS`

If `AMBASSADOR_UPDATE_MAPPING_STATUS` is set to the string `true`, $productName$ will update the `status` of every `Mapping` CRD that it accepts for its configuration. This has no effect on the proper functioning of $productName$ itself, and can be a performance burden on installations with many `Mapping`s. It has no effect for `Mapping`s stored as annotations.

The default is `false`. We recommend leaving `AMBASSADOR_UPDATE_MAPPING_STATUS` turned off unless required for external systems.

## `AMBASSADOR_LEGACY_MODE`

Setting `AMBASSADOR_LEGACY_MODE` to `true` will result in $productName$ disabling certain features
and reverting to older codepaths which may be better preserve certain older behaviors. Legacy mode
currently has the following effects:

- $productName$ will switch back to the $productName$ 1.6 input-resource validator (which can significantly
increase configuration latency for $productName$ installations with many resources).
- $productName$ will use the shell boot sequence that was the default up through 1.9.1, rather than the Golang boot sequence that became the default in 1.10.0.
- `AMBASSADOR_FAST_RECONFIGURE` (see below) is not supported in legacy mode.

## `AMBASSADOR_FAST_RECONFIGURE`

Setting `AMBASSADOR_FAST_RECONFIGURE` to "true" enables incremental reconfiguration. When enabled, $productName$ will track deltas from one configuration to the next and recalculate only what is necessary to follow the change. When disabled (the default), $productName$ will recompute the entire configuration at every change.

**`AMBASSADOR_FAST_RECONFIGURE` is not supported when `AMBASSADOR_LEGACY_MODE` is active.**

## `AMBASSADOR_ENVOY_API_VERSION`

By default, $productName$ will configure Envoy using the Envoy V3 API. Setting `AMBASSADOR_ENVOY_API_VERSION` to `V2` tells Ambassador to use the Envoy V2 API instead. Since the Envoy V2 API is deprecated in the upstream Envoy project, we strongly recommend using V3 and, as always, providing feedback and bug reports in the $productName$ GitHub repo!

## Configuration from the filesystem

If desired, $productName$ can be configured from YAML files in the directory `$AMBASSADOR_CONFIG_BASE_DIR/ambassador-config` (by default, `/ambassador/ambassador-config`, which is empty in the images built by Datawire). You could volume mount an external configuration directory here, for example, or use a custom Dockerfile to build configuration directly into a Docker image.

Note well that while $productName$ will read its initial configuration from this directory, configuration loaded from Kubernetes annotations will _replace_ this initial configuration. If this is not what you want, you will need to set the environment variable `AMBASSADOR_NO_KUBEWATCH` so that $productName$ will not try to update its configuration from Kubernetes resources.

Also note that the YAML files in the configuration directory must contain the $productName$ resources, not Kubernetes resources with annotations.

## Log levels and debugging

The $OSSproductName$ and $AESproductName$ support more verbose debugging levels. If using $OSSproductName$, the [diagnostics](../diagnostics) service has a button to enable debug logging. Be aware that if you're running $productName$ on multiple pods, the debug log levels are not enabled for all pods -- they are configured on a per-pod basis.

If using $AESproductName$, you can adjust the log level by setting the `AES_LOG_LEVEL` environment variable; from least verbose to most verbose, the valid values are `error`, `warn`/`warning`, `info`, `debug`, and `trace`; the default is `info`.

## Log format

By default, $productName$ writes its own logs in a plain text format. To produce logs as JSON instead, set the `AMBASSADOR_JSON_LOGGING` environment variable:

```yaml
env:
- name: AMBASSADOR_JSON_LOGGING
  value: "true"
```

## Port assignments

$productName$ uses some TCP ports in the range 8000-8499 internally, as well as port 8877. Third-party software integrating with $productName$ should not use ports in this range on the $productName$ pod.

## $productName$ update checks (Scout)

$productName$ integrates Scout, a service that periodically checks with Datawire servers to advise of available updates. Scout also sends anonymized usage data and the $productName$ version. This information is important to us as we prioritize test coverage, bug fixes, and feature development. Note that $productName$ will run regardless of the status of Scout (i.e., our uptime has zero impact on your uptime.)

We do not recommend you disable Scout, since we use this mechanism to notify users of new releases (including critical fixes and security issues). This check can be disabled by setting the environment variable `SCOUT_DISABLE` to `1` in your $productName$ deployment.

Each $productName$ installation generates a unique cluster ID based on the UID of its Kubernetes namespace and its $productName$ ID: the resulting cluster ID is a UUID which cannot be used to reveal the namespace name nor $productName$ ID itself. $productName$ needs RBAC permission to get namespaces for this purpose, as shown in the default YAML files provided by Datawire; if not granted this permission it will generate a UUID based only on the $productName$ ID. To disable cluster ID generation entirely, set the environment variable `AMBASSADOR_CLUSTER_ID` to a UUID that will be used for the cluster ID.

Unless disabled, $productName$ will also report the following anonymized information back to Datawire:

| Attribute                 | Type  | Description               |
| :------------------------ | :---- | :------------------------ |
| `cluster_count` | int | total count of clusters in use |
| `cluster_grpc_count` | int | count of clusters using GRPC upstream |
| `cluster_http_count` | int | count of clusters using HTTP or HTTPS upstream |
| `cluster_routing_envoy_rh_count` | int | count of clusters routing using Envoy `ring_hash` |
| `cluster_routing_envoy_maglev_count` | int | count of clusters routing using Envoy `maglev` |
| `cluster_routing_envoy_lr_count` | int | count of clusters routing using Envoy `least_request` |
| `cluster_routing_envoy_rr_count` | int | count of clusters routing using Envoy `round_robin` |
| `cluster_routing_kube_count` | int | count of clusters routing using Kubernetes |
| `cluster_tls_count` | int | count of clusters originating TLS |
| `custom_ambassador_id` | bool | has the `ambassador_id` been changed from 'default'? |
| `custom_listener_port` | bool | has the listener port been changed from 80/443? |
| `diagnostics` | bool | is the diagnostics service enabled? |
| `endpoint_grpc_count` | int | count of endpoints to which $productName$ will originate GRPC |
| `endpoint_http_count` | int | count of endpoints to which $productName$ will originate HTTP or HTTPS |
| `endpoint_routing` | bool | is endpoint routing enabled? |
| `endpoint_routing_envoy_rh_count` | int | count of endpoints being routed using Envoy `ring_hash` |
| `endpoint_routing_envoy_maglev_count` | int | count of endpoints being routed using Envoy `maglev` |
| `endpoint_routing_envoy_lr_count` | int | count of endpoints being routed using Envoy `least_request` |
| `endpoint_routing_envoy_rr_count` | int | count of endpoints being routed using Envoy `round_robin` |
| `endpoint_routing_kube_count` | int | count of endpoints being routed using Kubernetes |
| `endpoint_tls_count` | int | count of endpoints to which $productName$ will originate TLS |
| `extauth` | bool | is extauth enabled? |
| `extauth_allow_body` | bool | will $productName$ send the body to extauth? |
| `extauth_host_count` | int | count of extauth hosts in use |
| `extauth_proto` | str | extauth protocol in use ('http', 'grpc', or `null` if not active) |
| `group_canary_count` | int | count of Mapping groups that include more than one Mapping |
| `group_count` | int | total count of Mapping groups in use (length of the route table) |
| `group_header_match_count` | int | count of groups using header matching (including `host` and `method`) |
| `group_host_redirect_count` | int | count of groups using host_redirect |
| `group_host_rewrite_count` | int | count of groups using host_rewrite |
| `group_http_count` | int | count of HTTP Mapping groups |
| `group_precedence_count` | int | count of groups that explicitly set the precedence of the group |
| `group_regex_header_count` | int | count of groups using regex header matching |
| `group_regex_prefix_count` | int | count of groups using regex prefix matching |
| `group_resolver_consul` | int | count of groups using the Consul resolver |
| `group_resolver_kube_endpoint` | int | count of groups using the Kubernetes endpoint resolver |
| `group_resolver_kube_service` | int | count of groups using the Kubernetes service resolver |
| `group_shadow_count` | int | count of groups using shadows |
| `group_shadow_weighted_count` | int | count of groups using shadows but not shadowing all traffic |
| `group_tcp_count` | int | count of TCP Mapping groups |
| `host_count` | int | count of Host resources in use |
| `k8s_ingress_class_count` | int | count of IngressClass resources in use |
| `k8s_ingress_count` | int | count of Ingress resources in use |
| `listener_count` | int | count of active listeners (1 unless `redirect_cleartext_from` or TCP Mappings are in use) |
| `liveness_probe` | bool | are liveness probes enabled? |
| `managed_by` | string | tool that manages the $productName$ deployment, if any (e.g. helm, edgectl, etc.) |
| `mapping_count` | int | count of Mapping resources in use  |
| `ratelimit` | bool | is rate limiting in use? |
| `ratelimit_custom_domain` | bool | has the rate limiting domain been changed from 'ambassador'? |
| `ratelimit_data_plane_proto` | bool | is rate limiting using the data plane proto? |
| `readiness_probe` | bool | are readiness probes enabled? |
| `request_4xx_count` | int | lower bound for how many requests have gotten a 4xx response |
| `request_5xx_count` | int | lower bound for how many requests have gotten a 5xx response |
| `request_bad_count` | int | lower bound for how many requests have failed (either 4xx or 5xx) |
| `request_elapsed` | float | seconds over which the request_ counts are valid |
| `request_hr_elapsed` | string | human-readable version of `request_elapsed` (e.g. "3 hours 35 minutes 20 seconds" |
| `request_ok_count` | int | lower bound for how many requests have succeeded (not a 4xx or 5xx) |
| `request_total_count` | int | lower bound for how many requests were handled in total |
| `statsd` | bool | is StatsD enabled? |
| `server_name` | bool | is the `server_name` response header overridden? |
| `service_resource_total` | int | total count of service resources loaded from all discovery sources |
| `tls_origination_count` | int | count of TLS origination contexts |
| `tls_termination_count` | int | count of TLS termination contexts |
| `tls_using_contexts` | bool | are new TLSContext resources in use? ? |
| `tls_using_module` | bool |is the old TLS module in use |
| `tracing` | bool | is tracing in use? |
| `tracing_driver` | str | tracing driver in use ('zipkin', 'lightstep', 'datadog', or `null` if not active) |
| `use_proxy_proto` | bool | is the `PROXY` protocol in use? |
| `use_remote_address` | bool | is $productName$ honoring remote addresses? |
| `x_forwarded_proto_redirect` | bool | is $productName$ redirecting based on `X-Forwarded-Proto`? |
| `xff_num_trusted_hops` | int | what is the count of trusted hops for `X-Forwarded-For`? |

The `request_*` counts are always incremental: they contain only information about the last `request_elapsed` seconds. Additionally, they only provide a lower bound -- notably, if an $productName$ pod crashes or exits, no effort is made to ship out a final update, so it's very easy for counts to never be reported.

To completely disable feature reporting, set the environment variable `AMBASSADOR_DISABLE_FEATURES` to any non-empty value.
