---
    Title: Protect your services with Edge Stack's Web Application Firewalls
    description: Quickly block common attacks in the OWASP Top 10 vulnerabilities like cross-site-scripting (XSS) and SQL injection with Edge Stack's self-service Web Application Firewalls (WAF)
---

import Alert from '@material-ui/lab/Alert';

# Using Web Application Firewalls

$productName$ comes fully equipped with a Web Application Firewall solution (commonly referred to as WAF) that is
easy to set up and can be configured to help protect your web applications by preventing and mitigating many common
attacks. To accomplish this, the [Coraza Web Application Firewall library][] is used to check incoming requests
against a user-defined configuration file containing rules and settings for the firewall to determine whether to
allow or deny incoming requests.

$productName$ also has additional authentication features provided by [Filters][]. When `Filters` and
`WebApplicationFirewalls` are used at the same time, the order of operations is as follows and is not currently configurable.

1. `WebApplicationFirewalls` are always executed first
2. `Filters` are executed next (so long as any configured `WebApplicationFirewalls` did not already reject the request)
3. Lastly, if [Envoy Gateway][]'s rate-limiting runs (if configured any configured `WebApplicationFirewalls` and `Filters` did not already reject the request)

## Web Application Firewalls Quickstart

Web Application Firewalls in $productName$ are configured using the [WebApplicationFirewall][] and [WebApplicationFirewallPolicy][] custom
resources. You can refer to the `WebApplicationFirewall` and `WebApplicationFirewallPolicy` API docs above for a full breakdown of all
the fields they support.

1. First, start by creating your firewall configuration.

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

The example uses the `http` `sourceType` to configure downloading the firewall rules from the internet.
[Ambassador Labs][] publishes and maintains the rules used in the above example, but you can write your own from scratch
or use the posted rules as a reference.

See [Configuring Web Application Firewall Rules][] for more information about the Ambassador Labs firewall rule set.

## Loading Firewall Rules from ConfigMaps or Files

The quickstart example will get the rules for the firewall from the provided URLs, but you can also
configure a `WebApplicationFirewall` to load rules from a [Kubernetes ConfigMap][] or from a file on $productName$'s
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
   and if the directory exists, it will load any firewall configuration files from within. Alternatively, you
   can point to a single file instead of a directory. You can mount files to the pod using whichever strategy you prefer, such as a [Volume Mount][].

## Matching Requests to Firewalls

The quickstart example will run the `example-waf` `WebApplicationFirewall` against all requests since there was no config to
specify stricter matching criteria.

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
- The path of the request URL is `/foo`

## Web Application Firewalls Observability

To make using $productName$'s Web Application Firewall system easier and to enable automated workflows and alerts, there are three main methods of observability for Web Application Firewall behavior.

### Logging

$productName$ respects the logging [Coraza rules configuration][] of your `WebApplicationFirewall`. You can supply rules to configure
logging to `std/out` and `std/err` along with the logging verbosity if you want the information about requests approved and denied by
any `WebApplicationFirewalls` to be shown in the logs of the $productName$ [WAF Service][] pods.
Ambassador Labs' default ruleset sends the WAF logs to stdout, so they show up in the container logs of the Waf Service pods.

### Metrics

$productName$ outputs metrics about the operation of its Web Application Firewalls. You can refer to the [metrics documentation][] for details
about the metrics that are available.

## Other Web Application Firewall Docs

- [Rules for Web Application Firewalls][] - Info about creating and configuring firewall rules
- [Web Application Firewalls in Production][] - Recommendations and info for creating and running `WebApplicationFirewalls` in a production environment
- [WebApplicationFirewall API Reference][] - Full reference for all the fields supported by the `WebApplicationFirewall` resource
- [WebApplicationFirewallPolicy API Reference][] - Full reference for all the fields supported by the `WebApplicationFirewallPolicy` resource

[Filters]: ../../../custom-resources/filter
[WebApplicationFirewall]: ../../../custom-resources/webapplicationfirewall
[WebApplicationFirewallPolicy]: ../../../custom-resources/webapplicationfirewallpolicy
[WebApplicationFirewall API Reference]: ../../../custom-resources/webapplicationfirewall
[WebApplicationFirewallPolicy API Reference]: ../../../custom-resources/webapplicationfirewallpolicy
[Rules for Web Application Firewalls]: ../rules
[Web Application Firewalls in Production]: ../production
[WAF Service]: ../../../design/system
[metrics documentation]: ../../observability/metrics
[Ambassador Labs]: https://www.getambassador.io/
[Coraza Web Application Firewall library]: https://coraza.io/docs/tutorials/introduction/
[coraza rules configuration]: https://coraza.io/docs/seclang/directives
[Kubernetes ConfigMap]: https://kubernetes.io/docs/concepts/configuration/configmap/
[Envoy Gateway]: https://github.com/envoyproxy/gateway
[Volume Mount]: https://kubernetes.io/docs/concepts/storage/volumes/
