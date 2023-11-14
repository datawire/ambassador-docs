import Alert from '@material-ui/lab/Alert';

# The **WebApplicationFirewallPolicy** Resource (v1alpha1)

The `WebApplicationFirewallPolicy` resource configures the matching patterns for when [WebApplicationFirewalls][] get executed against requests; while the
`WebApplicationFirewall` resource provides the configuration for an instance of a Web Application Firewall.

This doc is an overview of all the fields on the `WebApplicationFirewallPolicy` Custom Resource with descriptions of the purpose, type, and default values of those fields.
Tutorials and guides for Web Application Firewalls can be found in the [usage guides section][]

<Alert severity="info">
    The <code>WebApplicationFirewallPolicy</code> resource was introduced more recently than the <code>Filter</code> and <code>FilterPolicy</code> resources, and does not have an older <code>getambassador.io/v3alpha1</code> CRD version
</Alert>

## WebApplicationFirewallPolicy API Reference

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: WebApplicationFirewallPolicy
metadata:
  name: "example-wafpolicy"
  namespace: "example-namespace"
spec:
  rules:  []WafMatchingRule           # required
  - host: string                      # optional, default: `"*"` (runs on all hosts)
    path: string                      # optional, default: `"*"` (runs on all paths)
    ifRequestHeader: HTTPHeaderMatch  # optional
      type: Enum                      # optional, default: `"Exact"`
      name: string                    # required
      value: string                   # optional
      negate: bool                    # optional, default: `false`
    wafRef:                           # required
      name: string                    # required
      namespace: string               # required
    onError:                          # optional
      statusCode: int                 # required, min: `400`, max: `599`
    precedence: int                   # optional
status:                               # field managed by controller
  conditions: []metav1.Condition
  ruleStatuses:
  - index: int
    host: string
    path: string
    conditions: []metav1.Condition
```

### WebApplicationFirewallPolicy Spec

| **Field** | **Type**                 | **Description**                                                                                                                                                  |
|-----------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `rules`   | \[\][WafMatchingRule][]  | This object configures matching requests and executes WebApplicationFirewalls on them. Multiple different rules can be supplied in one `WebApplicationFirewallPolicy` instead of multiple separate `WebApplicationFirewallPolicy` resouurces if desired. |

### WafMatchingRule

| **Field**            | **Type**            | **Description**                                                                                                                                                  |
|----------------------|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`               | `string`            | A "glob-string" that matches on the `:authority` header of the incoming request. If not set, it will match on all incoming requests. |
| `path`               | `string`            | A "glob-string" that matches on the request path. If not provided, then it will match on all incoming requests. |
| `ifRequestHeader`    | [HTTPHeaderMatch][] | Checks if exact or regular expression matches a value in a request header to determine if the `WebApplicationFirewall` is executed or not. |
| `wafRef`             | [WafReference][]    | A reference to a `WebApplicationFirewall` to be applied against the request. |
| `onError.statusCode` | `int`               | Configure a response code to be sent to the downstream client when when a request matches the rule but there is a configuration or runtime error. By default, requests are allowed on error if this field is not configured. This covers runtime errors such as those caused by networking/request parsing as well as configuration errors such as if the `WebApplicationFirewall` that is referenced is misconfigured, cannot be found, or when its configuration cannot be loaded properly. Details about the errors can be found either in the `WebApplicationFirewall` status or container logs. |

### HTTPHeaderMatch

**Appears On**: [WafMatchingRule][]
Checks if exact or regular expression matches a value in a request header to determine if the `WebApplicationFirewall` is executed or not.

| **Field**  | **Type**                                | **Description**                                                                                                                                                  |
|------------|-----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`     | `Enum`(`"Exact"`,`"RegularExpression"`) | Specifies how to match against the value of the header. Allowed values are `"Exact"`/`"RegularExpression"`. |
| `name`     | `string`                                | Name of the HTTP Header to be matched. Name matching MUST be case-insensitive. (See [https://tools.ietf.org/html/rfc7230#section-3.2][]) |
| `value`    | `string`                                |  Value of HTTP Header to be matched. If type is `RegularExpression`, then this must be a valid regex with a length of at least 1. |
| `negate`   | `bool`                                  | Allows the match criteria to be negated or flipped. |

### WafReference

**Appears On**: [WafMatchingRule][]
A reference to a `WebApplicationFirewall`

| **Field**     | **Type**                 | **Description**                                                                                                                                                  |
|---------------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`        | Name of the `WebApplicationFirewall` being referenced
| `namespace`   | Namespace of the `WebApplicationFirewall`. This field is required. It must be a RFC 1123 label. Valid values include: `"example"`. Invalid values include: `"example.com"` - `"."` is an invalid character. The maximum allowed length is 63 characters, and the regex pattern `^[a-z0-9]([-a-z0-9]*[a-z0-9])?$` is used for validation. |

## Web Application Firewall Usage Guides

The following guides will help you get started using Web Application Firewalls

- [Using Web Application Firewalls][]
- [Rules for Web Application Firewalls][]
- [Web Application Firewalls in Production][]

[WafReference]: #wafreference
[HTTPHeaderMatch]: #httpheadermatch
[WafMatchingRule]: #wafmatchingrule
[usage guides section]: #web-application-firewall-usage-guides
[Using Web Application Firewalls]: ../../../../howtos/web-application-firewalls
[Rules for Web Application Firewalls]: ../../../../howtos/web-application-firewalls-config
[Web Application Firewalls in Production]: ../../../../howtos/web-application-firewalls-in-production
[WebApplicationFirewalls]: ../webapplicationfirewall
[https://tools.ietf.org/html/rfc7230#section-3.2]: https://tools.ietf.org/html/rfc7230#section-3.2
