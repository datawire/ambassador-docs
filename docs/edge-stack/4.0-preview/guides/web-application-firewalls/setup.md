# Web Application Firewalls in $productName$

$productName$ comes fully equipped with a Web Application Firewall solution (commonly referred to as WAF) that is
easy to set up and can be configured to help protect your web applications by preventing and mitigating many common
attacks. To accomplish this, the [Coraza Web Application Firewall library][] is used to check incoming requests
against a user-defined configuration file containing rules and settings for the firewall to determine whether to
allow or deny incoming requests.

$productName$ also has additional authentication features such as [Filters][]. [Rate Limiting][] is also
available since $productName$ is built on [Envoy Gateway][]. When `Filters`, `RateLimitsFilters`, and
`WebApplicationFirewalls` are all used at the same time, the order of operations is as follows and is not currently configurable.

1. `WebApplicationFirewalls` are always executed first
2. `Filters` are executed next (so long as any configured `WebApplicationFirewalls` did not already reject the request)
3. Lastly [RateLimitFilters][] are executed (so long as any configured `WebApplicationFirewalls` and `Filters` did not already reject the request)

## Web Application Firewalls Quickstart

Web Application Firewalls in $productName$ are configured using the [WebApplicationFirewall][] and [WebApplicationFirewallPolicy][] custom resources. You can refer to the `` and `` api docs above for a full breakdown of all the fields they support.

1. First, start by creating your firewall configuration. The example uses the `http` `sourceType` to configure downloading the firewall rules from the internet. [The rules in this example][] are published by [Ambassador Labs][], but you are free to write your own or use the published rules as a reference.

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
         url: "https://app.getambassador.io/download/waf/v1-20230620/aes-waf.conf"
     - sourceType: "http"
       http:
         url: "https://app.getambassador.io/download/waf/v1-20230620/crs-setup.conf"
     - sourceType: "http"
       http:
         url: "https://app.getambassador.io/download/waf/v1-20230620/waf-rules.conf"
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

## Loading Firewall Rules from ConfigMaps or Files

The quickstart example will get the rules for the firewall from the provided urls, but you can also
configure a `WebApplicationFirewall` to load rules from a [Kuberntes ConfigMap][] or from a file on $productName$'s
Waf Service pods.

1. Update the `WebApplicationFirewall` to load a simple rule from a `ConfigMap`

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: example-waf
     namespace: default
   data:
     data: |
       SecRule REQUEST_HEADERS:Deny-Request "^true" "id:'200009', phase:1,t:none,log,deny,status:400"
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: WebApplicationFirewall
   metadata:
     name: "example-waf"
     namespace: "default"
   spec:
     firewallRules:
     - sourceType: "configmap"
       configMapRef:
         name: "example-waf"
         namespace: "default"
         key: "data"
   EOF
   ```

2. This will configure the Firewall with one simple rule from the `ConfigMap` and deny requests when they have
a request header called `deny-me` with the value `true`.

3. Update the `WebApplicationFirewall` to load a simple rule from a file.

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
     - sourceType: "file"
       file: "/ambassador/waf/"
   EOF
   ```

4. Now the `WebApplicationFirewall` will load the firewall rules from files.

   $productName$ will try to open the `/ambassador/waf/` directory on the Waf Service pods,
   and if the directory exists, it will load any firewall configuration files from within. Alternatively you
   can point to a single file instead of a directory. You can mount files to the pod using a [Volume Mount][] or similar strategy.

## Matching Requests to Firewalls

The quickstart example will run the `example-waf` `WebApplicationFirewall` against all requests since there was no config to specify stricter matching criteria.

1. Update the `WebApplicationFirewallPolicy` to specify some matching criteria

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
     - path: "/foo"
       host: "example.com"
       ifRequestHeader:
        name: "content-type"
        value: "application/json"
       wafRef:
         name: "example-waf"
         namespace: "default"
   EOF
   ```

Now the `example-waf` `WebApplicationFirewall` will only be executed against requests with:

- The `content-type` HTTP request header is present
- The value of the `content-type` HTTP request header is `application/json`
- The `:authority` HTTP header is set to `example.com`
- The path of the request url is `/foo`

## Web Application Firewalls Observability

To make using $productName$'s Web Application Firewall system easier and to enable automated workflows and alerts, there are three main methods of observability for Web Application Firewall behavior.

### Logging

  $productName$ will log information about requests approved and denied by any `WebApplicationFirewalls` along with the reason why the request was denied.
  You can configure the logging policies in the [coraza rules configuration][] where logs are sent to and how much information is logged.
  Ambassador Labs' default ruleset sends the WAF logs to stdout so they show up in the container logs of the Waf Service pods.

### Metrics

  $productName$ also outputs metrics about the Web Application Firewall, including the number of requests approved and denied, and performance information.
  A a [Grafana dashboard][] that can be imported to [Grafana][] is also available. In addition, the dashboard has pre-built panels that help visualize the metrics that are
  collected about Web Application Firewall activity.

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

## Other Web Application Firewall Docs

- [Rules for Web Application Firewalls][] - Info about creating and configuring firewall rules
- [Web Application Firewalls in Production][] - Recommendations and info for creating and running `WebApplicationFirewalls` in a production environment
- [WebApplicationFirewall API Reference][] - Full reference for all the fields supported by the `WebApplicationFirewall` resource
- [WebApplicationFirewallPolicy API Reference][] - Full reference for all the fields supported by the `WebApplicationFirewallPolicy` resource

[Filters]: ../../../custom-resources/filter
[Rate Limiting]: ../../../design/rate-limiting
[RateLimitFilters]: ../../../custom-resources/eg/ratelimitfilter
[WebApplicationFirewall]: ../../../custom-resources/webapplicationfirewall
[WebApplicationFirewallPolicy]: ../../../custom-resources/webapplicationfirewallpolicy
[WebApplicationFirewall API Reference]: ../../../custom-resources/webapplicationfirewall
[WebApplicationFirewallPolicy API Reference]: ../../../custom-resources/webapplicationfirewallpolicy
[Rules for Web Application Firewalls]: ../rules
[Web Application Firewalls in Production]: ../production
[Grafana dashboard]: https://grafana.com/grafana/dashboards/4698-ambassador-edge-stack/
[Grafana]: https://grafana.com/
[Ambassador Labs]: https://www.getambassador.io/
[Coraza Web Application Firewall library]: https://coraza.io/docs/tutorials/introduction/
[coraza rules configuration]: https://coraza.io/docs/seclang/directives
[Kuberntes ConfigMap]: https://kubernetes.io/docs/concepts/configuration/configmap/
[Envoy Gateway]: https://github.com/envoyproxy/gateway
[Volume Mount]: https://kubernetes.io/docs/concepts/storage/volumes/
