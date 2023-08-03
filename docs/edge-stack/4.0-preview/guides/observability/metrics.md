
# Metrics in $productName$

Metrics are available from the [Edge Stack service][], [WAF service][], and [][]

## Edge Stack Metrics

$productName$'s Edge Stack service outputs metrics on port `8080`. Metrics about the go process, such as memory consumption and go routines,
are available along with the following metrics specific to the Edge Stack Service.

| Metric                              | Type          | Description                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|-------------------------------------|---------------|-----------------------------------------------------------------------------------------------|
| `edge_stack_hook_count`             | `counter`     | Number of gRPC hook requests edge stack received from Envoy Gateway to translate Envoy Config resources |
| `edge_stack_hook_errors`            | `counter`     | Number of errors edge stack encountered while handling gRPC hook requests |
| `edge_stack_hook_time_latest`       | `gauge`       | Latest time it took edge stack to process the most recent gRPC hook request |
| `edge_stack_hook_time_max`          | `gauge`       | Longest recorded time it took edge stack to process a gRPC hook request |
| `edge_stack_hook_time_min`          | `gauge`       | Shortest recorded time it took edge stack to process a gRPC hook request |

## Auth Service Metrics

$productName$'s Auth Service outputs metrics on port `8080` at the `/metrics` endpoint. The metrics contain info about the controller and the go process, such as memory consumption and go routines.

## WAF Service Metrics

$productName$'s WAF Service outputs metrics on port `8080` at the `/metrics` endpoint. The metrics track the Web Application Firewall activity, including the number of requests approved and denied and performance information.
A [sample dashboard][] that can be imported to [Grafana][] is also available. In addition, the dashboard has pre-built panels that
help visualize Web Application Firewall activity.

| Metric                              | Type                    | Description                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|-------------------------------------|-------------------------|-----------------------------------------------------------------------------------------------|
| `waf_created_wafs`                  | `Gauge`                 | Number of created web application firewall                                                    |
| `waf_managed_wafs_total`            | `Counter`               | Number of managed web application firewalls                                                   |
| `waf_added_latency_ms`              | `Histogram`             | Added latency in milliseconds                                                                 |
| `waf_total_denied_requests_total`   | `Counter` (with labels) | Number of requests denied by any web application firewall                                     |
| `waf_total_denied_responses_total`  | `Counter` (with labels) | Number of responses denied by any web application firewall                                    |
| `waf_denied_breakdown_total`        | `Counter` (with labels) | Breakdown of requests/responses denied and the web application firewall that denied them      |
| `waf_total_allowed_requests_total`  | `Counter` (with labels) | Number of requests allowed by any web application firewall                                    |
| `waf_total_allowed_responses_total` | `Counter` (with labels) | Number of responses allowed by any web application firewall                                   |
| `waf_allowed_breakdown_total`       | `Counter` (with labels) | Breakdown of requests/responses allowed and the web application firewall that allowed them    |
| `waf_errors`                        | `Counter` (with labels) | Tracker for any errors encountered by web application firewalls and the reason for the error  |

[sample dashboard]: https://grafana.com/grafana/dashboards/4698-ambassador-edge-stack/
[Grafana]: https://grafana.com/
