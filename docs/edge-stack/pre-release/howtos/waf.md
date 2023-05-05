---
    Title: Protect your services with Edge Stack's Web Application Firewall
    description: Quickly block common attacks in the OWASP Top 10 vulnerabilities like cross-site-scripting (XSS) and SQL injection with Edge Stack's self-service Web Application Firewall (WAF)
---

# Web Application Firewalls in $productName$

$productName$ comes fully equiped with a Web Application Firewall solution (commonly refered to as WAF) that is easy to set up and can be configured to help protect your web applications by preventing and mitigating many common attacks. To acomplish this, the [Coraza Web Application Firewall library][] is used to check incoming requests against a user-defined configuration file containing rules and settings for the firewall to determine whether to allow or deny incoming requests.

$productName$ also has additional authentication features such as [Filters][] and [Ratelimiting][]. When `Filters`, `Ratelimits`, and `WebApplicationFirewalls` are all used at the same time, the order of operations is as follows and is not currently configurable.

1. `WebApplicationFirewalls` are always executed first
2. `Filters` are executed next (so long as any configured `WebApplicationFirewalls` did not already reject the request)
3. Lastly `Ratelimits` are executed (so long as any configured `WebApplicationFirewalls` and `Filters` did not already reject the request)

## The `WebApplicationFirewall` Resource

In $productName$, the `WebApplicationFirewall` resource defines the configuration for an instance of the firewall.

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: WebApplicationFirewall
metadata:
  name: "example-waf"
  namespace: "example-namespace"
spec:
  rules:                          # required; One of configMapRef;file;url must be set below
    sourceType: "enum"            # required; allowed values are file;configmap;url
    configMapRef:                 # optional
      name: "string"              # required
      namespace: "string"         # optional; defaults to the namespace of the WebApplicationFirewall
      key: "string"               # required
    file: "string"                # optional
    url: "string"                 # optional; must be a valid URL.
status:                           # set and updated by application
  conditions: []metav1.Condition
```

`rules`: Defines the rules to be used for the Web Application Firewall

- `sourceType`: Identifies which method is being used to load the firewall rules. Value must be one of `configMapRef`;`file`;`url`. The value corresponds to the following fields for configuring the selected method.
- `configMapRef`: Defines a reference to a `ConfigMap` in the Kubernetes cluster to load firewall rules from.
  - `name`: Name of the `ConfigMap`.
  - `namespace`: Namespace of the `ConfigMap`. This field is optional and when left unset, the `ConfigMap` is assumed to be in the same namespace as the `WebApplicationFirewall` resource. It must be a RFC 1123 label. Valid values include: `"example"`. Invalid values include: `"example.com"` - `"."` is an invalid character. The maximum allowed length is `63` characters and the regex pattern `^[a-z0-9]([-a-z0-9]*[a-z0-9])?$` is used for validation.
  - `key`: The key in the `ConfigMap` to pull the rules data from.
- `file`: Location of a file on disk to load the firewall rules from. Example: `"/ambassador/firewall/waf.conf`.
- `url`: URL to fetch firewall rules from. The rules will only be downloaded once when the `WebApplicationFirewall` is loaded. The rules will then be cached in-memory until a restart of $productName$ occurs or the `url` is changed.

`status`: This field is automatically set to reflect the status of the `WebApplicationFirewall`.

- `conditions`: Conditions describe the current conditions of the `WebApplicationFirewall`, known conditions are `Accepted`;`Ready`;`Rejected`.

## The `WebApplicationFirewallPolicy` Resource

The `WebApplicationFirewallPolicy` resource controls which requests to match on and which `WebApplicationFirewall` configuration to use. This enables users to have total control over the firewall configuration and when it is executed on requests. It is possible to setup multiple different firewall configurations for specific requests or a single firewall configuration that is applied to all requests.

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: WebApplicationFirewallPolicy
metadata:
  name: "example-waf-policy"
  namespace: "example-namespace"
spec:
  ambassadorIds: []string         # optional
  rules:                          # required
  - host: "string"                # optional; default = * (runs on all hosts)
    path: "string"                # optional; default = * (runs on all paths)
    ifRequestHeader:              # optional
      type: "enum"                # optional; allowed values are Exact;RegularExpression
      name: "string"              # required
      value: "string"             # optional
      negate: bool                # optional; default: false
    wafRef:                       # required
      name: "string"              # required
      namespace: "string"         # optional
    precedence: int               # optional
status:                           # set and updated by application
  conditions: []metav1.Condition
  ruleStatuses:
  - index: int
    host: "string"
    path: "string"
    conditions: []metav1.Condition
```

`spec`: Defines which requests to match on and which `WebApplicationFirewall` to be used against those requests.

- `ambassadorIds`: This optional field allows you to limit which instances of $productName$ can watch and use this resource. This allows for separation of resources when running multiple instances of $productName$ in the same Kubernetes cluster. Additional documentation on [configuring Ambassador IDs can be found here][]. By default all instances of $productName$ will be able to watch and use this resource.
- `rules`: This object configures matching requests and executing `WebApplicationFirewall`s on them.
  - `host`: Host is a "glob-string" that matches on the `:authority` header of the incoming request. If not set it will match on all incoming requests.
  - `path`: Path is a "glob-string" that matches on the request path. If not provided then it will match on all incoming requests.
  - `ifRequestHeader`: IfRequestHeader checks if exact or regular expression matches a value in a request Header to determine if the WebApplicationFirewall is executed or not.
    - `type`: Type specifies how to match against the value of the header. Allowed values are `Exact`;`RegularExpression`
    - `name`: Name is the name of the HTTP Header to be matched. Name matching MUST be case insensitive. (See <https://tools.ietf.org/html/rfc7230#section-3.2>)
    - `value`: Value is the value of HTTP Header to be matched. if type is RegularExpression then this must be a valid regex with length being at least 1.
    - `negate`: Negate allows the match criteria to be negated or flipped.
  - `wafRef`: A reference to a `WebApplicationFirewall` to be applied against the request.
    - `name`: Name that identifies the WebApplicationFirewall
    - `namespace`: Namespace of the `WebApplicationFirewall`. This field is optional and when left unset, the `WebApplicationFirewall` is assumed to be in the same namespace as the `WebApplicationFirewallPolicy` resource. It must be a RFC 1123 label. Valid values include: `"example"`. Invalid values include: `"example.com"` - `"."` is an invalid character. The maximum allowed length is `63` characters and the regex pattern `^[a-z0-9]([-a-z0-9]*[a-z0-9])?$` is used for validation.
  - `precedence`: Allows forcing a precedence ordering on the rules. By default the rules are evaluated in the order they are in the `WebApplicationFirewallPolicy.spec.rules` field. However, multiple `WebApplicationFirewallPolicys` can be applied to a cluster. `precedence` can optionally be used to ensure that a specific ordering is enforced.

`status`: This field is automatically set to reflect the status of the `WebApplicationFirewallPolicy`.

- `conditions`: Conditions describe the current conditions of the `WebApplicationFirewallPolicy`, known conditions are `Accepted`;`Ready`;`Rejected`. If any rules have an error then the whole `WebApplicationFirewallPolicyPolicy` will be rejected.
- `ruleStatuses`:
  - `index`: Provides the zero-based index in the list of Rules to help identify the rule with an error.
  - `host`: host of the rule with the error
  - `path`: path of the rule with the error
  - `conditions`: Describe the current condition of this Rule. Known values are `Accepted`;`Ready`;`Rejected`. If any rules have an error then the whole `WebApplicationFirewallPolicy` will be rejected.

## Quickstart

1. First start by creating your firewall configuration. The example will download the firewall rules published by Ambassador labs, but you are free to write your own or use the published rules as a reference.

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: WebApplicationFirewall
   metadata:
     name: "example-waf"
   spec:
     rules:
       sourceType: "url"
       url: "https://app.getambassador.io/yaml/waf-rules/v1-20230430.conf"  # TODO: this is a placeholder URL, the final URL is subject to change.
   EOF
   ```

2. Next create a `WebApplicationFirewallPolicy` to control which requests the firewall should run on. The example will run the firewall on all requests but you can customize the policy to only run for specific requests.

   ```yaml
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: WebApplicationFirewallPolicy
   metadata:
     name: "example-waf-policy"
   spec:
     rules:
     - wafRef: # This rule will be executed on all paths and hostnames
         name: "example-waf"
   ```

// TODO: add a curl command here that will violate our provided ruleset and cause the request to be rejected.

Congratulations, you've successfully setup a Web Application Firewall to secure all requests coming into $productName$.

  <Alert severity="info">
  After applying your <code>WebApplicationFirewall</code> and <code>WebApplicationFirewall</code> resources, check their statuses to make sure that they were not rejected due to any configuration errors.
  </Alert>

## Web Application Firewall Rules

Since $productName$'s Web Application Firewall implementation is powered by the [Coraza Web Application Firewall library][] library, configuration of the firewall rules uses [Coraza's Seclang syntax][] which is compatible with the OWASP Core Rule Set.

Ambassador Labs publishes and maintains a list of rules to be used with the Web Application Firewall that should be a good solution for most users and [Coraza also provides their own ruleset][] based on the [OWASP][] core rule set.

For specific information about rule configuration, please refer to [Coraza's Seclang documentation][]

The Ambassador Labs Web Application Firewall ruleset can be downloaded from the following link with this command:

```bash
wget https://app.getambassador.io/yaml/waf-rules/v1-20230430.conf -O v1-20230430.conf
```

// TODO: Add a statement about our support policy for the rules we publish

## Observability

To make using $productName$'s Web Application Firewall system easier and to enable automated workflows and alerts, there are three main methods of observability for Web Application Firewall behavior.

### Logging

  $productName$ will log information about requests approved and denied by any `WebApplicationFirewalls` along with the reason why the request was denied.
  // TODO: specifics about the log lines and log levels that are output will be added soon

### Metrics

  $productName$ also outputs metrics about the Web Application Firewall including the number of requests approved and denied as well as performance information.
  // TODO: info about all the specific metrics we provide will be added soon

### Grafana Dashboard

  $productName$ provides a [Grafana dashboard][] that can be imported to [Grafana][]. The dashboard has pre-built pannels that help visualize the metrics that are collected about Web Application Firewall activity. For more information about getting [Prometheus][] and Grafana setup for gathering and visualizing metrics from $productName$ please refer to the [Prometheus and Grafana documentation][].

[Coraza Web Application Firewall library]: https://coraza.io/docs/tutorials/introduction/
[Filters]: ../../topics/using/filters
[Ratelimiting]: ../../topics/using/rate-limits/rate-limits#rate-limiting-reference
[Coraza's Seclang syntax]: https://coraza.io/docs/seclang/directives/
[Coraza also provides their own ruleset]: https://coraza.io/docs/tutorials/coreruleset/
[Coraza's Seclang documentation]: https://coraza.io/docs/seclang/
[OWASP]: https://owasp.org/
[Grafana dashboard]: https://grafana.com/grafana/dashboards/4698-ambassador-edge-stack/
[Grafana]: https://grafana.com/
[Prometheus]: https://prometheus.io/docs/introduction/overview/
[Prometheus and Grafana documentation]:../prometheus
[configuring Ambassador IDs can be found here]: ../../topics/running/running#ambassador_id
