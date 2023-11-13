---
    Title: Protect your services with Edge Stack's Web Application Firewalls
    description: Quickly block common attacks in the OWASP Top 10 vulnerabilities like cross-site-scripting (XSS) and SQL injection with Edge Stack's self-service Web Application Firewalls (WAF)
---

# Using Web Application Firewalls in $productName$

[$productName$][] comes fully equipped with a Web Application Firewall solution (commonly referred to as WAF) that is easy to set up and can be configured to help protect your web applications by preventing and mitigating many common attacks. To accomplish this, the [Coraza Web Application Firewall library][] is used to check incoming requests against a user-defined configuration file containing rules and settings for the firewall to determine whether to allow or deny incoming  requests.

<br />

$productName$ also has additional authentication features such as [Filters][] and [Rate Limiting][]. When `Filters`, `Ratelimits`, and `WebApplicationFirewalls` are all used at the same time, the order of operations is as follows and is not currently configurable.

1. `WebApplicationFirewalls` are always executed first
2. `Filters` are executed next (so long as any configured `WebApplicationFirewalls` did not already reject the request)
3. Lastly `Ratelimits` are executed (so long as any configured `WebApplicationFirewalls` and Filters did not already reject the request)

## Quickstart

See the [WebAplicationFirewall API reference][] and [WebAplicationFirewallPolicy API reference][]
pages for an overview of all the supported fields of the following custom resources.

1. First, start by creating your firewall configuration. The example will download [the firewall rules][] published by [Ambassador Labs][], but you are free to write your own or use the published rules as a reference.

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: WebApplicationFirewall
   metadata:
     name: "example-waf"
     namespace: "default"
   spec:
     firewallRules:
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230825/aes-waf.conf"
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230825/crs-setup.conf"
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230825/waf-rules.conf"
   EOF
   ```

2. Next create a `WebApplicationFirewallPolicy` to control which requests the firewall should run on. The example will run the firewall on all requests, but you can customize the policy to only run for specific requests.

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: WebApplicationFirewallPolicy
   metadata:
     name: "example-waf-policy"
     namespace: "default"
   spec:
     rules:
     - wafRef: # This rule will be executed on all paths and hostnames
         name: "example-waf"
         namespace: "default"
   EOF
   ```

3. Finally, send a request that will be blocked by the Web Application Firewall

   ```console
   $ curl https://<HOSTNAME>/test -H 'User-Agent: Arachni/0.2.1'
   ```

Congratulations, you've successfully set up a Web Application Firewall to secure all requests coming into $productName$.

  <Alert severity="info">
  After applying your <code>WebApplicationFirewall</code> and <code>WebApplicationFirewall</code> resources, check their statuses to make sure that they were not rejected due to any configuration errors.
  </Alert>

## Rules for Web Application Firewalls

Since the [Coraza Web Application Firewall library][] $productName$'s Web Application Firewall implementation, the firewall rules configuration uses [Coraza's Seclang syntax][] which is compatible with the OWASP Core Rule Set.

Ambassador Labs publishes and maintains a list of rules to be used with the Web Application Firewall that should be a good solution for most users and [Coraza also provides their own ruleset][] based on the [OWASP][] core rule set. It also
satisifies [PCI 6.6][] compliance requirements.

Ambassador Labs rules differ from the OWASP Core ruleset in the following areas:

- WAF engine is enabled by default.
- A more comprehensive set of rules is enabled, including rules related to compliance with PCI DSS 6.5 and 12.1 requirements.

See [Configuring $productName$'s Web Application Firewall rules][] for more information about installing Ambassador Labs rules.

For specific information about rule configuration, please refer to [Coraza's Seclang documentation][]

## Observability

To make using $productName$'s Web Application Firewall system easier and to enable automated workflows and alerts, there are three main methods of observability for Web Application Firewall behavior.

### Logging

  $productName$ will log information about requests approved and denied by any `WebApplicationFirewalls` along with the reason why the request was denied.
  You can configure the logging policies in the [coraza rules configuration][] where logs are sent to and how much information is logged.
  Ambassador Labs' default ruleset sends the WAF logs to stdout so they show up in the container logs.

### Metrics

  $productName$ also outputs metrics about the Web Application Firewall, including the number of requests approved and denied, and performance information.

| Metric                              | Type                  | Description                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|-------------------------------------|-----------------------|-----------------------------------------------------------------------------------------------|
| `waf_created_wafs`                  | Gauge                 | Number of created web application firewall                                                    |
| `waf_managed_wafs_total`            | Counter               | Number of managed web application firewalls                                                   |
| `waf_added_latency_ms`              | Histogram             | Added latency in milliseconds                                                                 |
| `waf_total_denied_requests_total`   | Counter (with labels) | Number of requests denied by any web application firewall                                     |
| `waf_total_denied_responses_total`  | Counter (with labels) | Number of responses denied by any web application firewall                                    |
| `waf_denied_breakdown_total`        | Counter (with labels) | Breakdown of requests/responses denied and the web application firewall that denied them      |
| `waf_total_allowed_requests_total`  | Counter (with labels) | Number of requests allowed by any web application firewall                                    |
| `waf_total_allowed_responses_total` | Counter (with labels) | Number of responses allowed by any web application firewall                                   |
| `waf_allowed_breakdown_total`       | Counter (with labels) | Breakdown of requests/responses allowed and the web application firewall that allowed them    |
| `waf_errors`                        | Counter (with labels) | Tracker for any errors encountered by web application firewalls and the reason for the error  |

### Grafana Dashboard

  $productName$ provides a [Grafana dashboard][] that can be imported to [Grafana][]. In addition, the dashboard has pre-built panels that help visualize the metrics that are collected about Web Application Firewall activity. For more information about getting [Prometheus][] and Grafana set up for gathering and visualizing metrics from $productName$ please refer to the [Prometheus and Grafana documentation][].

[Coraza Web Application Firewall library]: https://coraza.io/docs/tutorials/introduction/
[Filters]: ../../topics/using/filters
[Rate limiting]: ../../topics/using/rate-limits/rate-limits#rate-limiting-reference
[Coraza's Seclang syntax]: https://coraza.io/docs/seclang/directives/
[Coraza also provides their own ruleset]: https://coraza.io/docs/tutorials/coreruleset/
[Coraza's Seclang documentation]: https://coraza.io/docs/seclang/
[OWASP]: https://owasp.org/
[PCI 6.6]: https://listings.pcisecuritystandards.org/documents/information_supplement_6.6.pdf
[Grafana dashboard]: https://grafana.com/grafana/dashboards/4698-ambassador-edge-stack/
[Grafana]: https://grafana.com/
[Prometheus]: https://prometheus.io/docs/introduction/overview/
[Prometheus and Grafana documentation]:../prometheus
[WebAplicationFirewall API reference]: ../../custom-resources/gateway-getambassador/v1alpha1/webapplicationfirewall
[WebAplicationFirewallPolicy API reference]: ../../custom-resources/gateway-getambassador/v1alpha1/webapplicationfirewallpolicy
[$productName$]: https://www.getambassador.io/products/edge-stack/api-gateway
[Ambassador Labs]: https://www.getambassador.io/
[Configuring $productName$'s Web Application Firewall rules]: ../web-application-firewalls-config
[coraza rules configuration]: https://coraza.io/docs/seclang/directives/#secauditlog
[the firewall rules]: ../web-application-firewalls-config
