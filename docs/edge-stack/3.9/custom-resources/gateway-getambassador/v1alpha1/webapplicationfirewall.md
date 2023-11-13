import Alert from '@material-ui/lab/Alert';

# The **WebApplicationFirewall** Resource (v1alpha1)

The `WebApplicationFirewall` provides the configuration for an instance of a Web Application Firewall, and the
[WebApplicationFirewallPolicy][] resource configures the matching patterns for when `WebApplicationFirewalls` get executed against requests.

This doc is an overview of all the fields on the `WebApplicationFirewall` Custom Resource with descriptions of the purpose, type, and default values of those fields.
Tutorials and guides for Web Application Firewalls can be found in the [usage guides section][]

<Alert severity="info">
    The <code>WebApplicationFirewall</code> resource was introduced more recently than the <code>Filter</code> and <code>FilterPolicy</code> resources, and does not have an older <code>getambassador.io/v3alpha1</code> CRD version
</Alert>

## WebApplicationFirewall API Reference

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: WebApplicationFirewall
metadata:
  name: "example-waf"
  namespace: "example-namespace"
spec:
  firewallRules: FirewallRules            # required, One of configMapRef;file;http must be set below
    sourceType: Enum                      # required
    configMapRef: ConfigMapReference      # optional
      name: string                        # required
      namespace: string                   # required
      key: string                         # required
    file: string                          # optional
    http:                                 # optional
      url: string                         # required, must be a valid URL.
  logging:                                # optional
    onInterrupt:                          # required
      enabled: bool                       # required
status:                                   # field managed by controller
  conditions: []metav1.Condition
```

### WebApplicationFirewall

| **Field**                      | **Type**                 | **Description**                                                                                                                                                  |
|--------------------------------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `firewallRules`                | [FirewallRules][]        | Defines the rules to be used for the Web Application Firewall |
| `logging.onInterrupt.enabled`  | `bool`                   | When enabled, creates additional log lines in the $productName$ pods whenever the `WebApplicationFirewall` interrupts a request. This is in addition to the logging config that is available via the firewall configuration files. |

### FirewallRules

Defines the rules to be used for the Web Application Firewall

| **Field**        | **Type**                                | **Description**                                                                                                                                                  |
|------------------|-----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sourceType`     | `Enum`(`"file"`,`"configmap"`,`"http"`) | Identifies which method is being used to load the firewall rules. Value must be one of `configMapRef`;`file`;`http`. The value corresponds to the following fields for configuring the selected method. |
| `configMapRef`   | [ConfigMapReference][]                  | Defines a reference to a [Kubernetes ConfigMap][] to load firewall rules from. |
| `file`           | `string`                                | Location of a file on disk to load the firewall rules from. Example: `"/ambassador/firewall/waf.conf"`. Files can be mounted to the $productName$ auth service deployment pods using a `ConfigMap`, or similar approach. |
| `http.url`       | `string`                                | URL to fetch firewall rules from. If the rules are unable to be downloaded/parsed from the provided url for whatever reason, the requests matched to this `WebApplicationFirewall` will be allowed/denied based on the configuration of the `onError` field. |

### ConfigMapReference

Defines a reference to a [Kubernetes ConfigMap][] to load firewall rules from.

| **Field**    | **Type**   | **Description**                               |
|--------------|------------|-----------------------------------------------|
| `name`       | `string`   | Name of the referenced Kuberntes `ConfigMap`. |
| `namespace`  | `string`   | Namespace of the referenced Kuberntes `ConfigMap`.|
| `key`        | `string`   | The key in the referenced Kuberntes `ConfigMap` to pull the rules data from. |

## Web Application Firewall Usage Guides

The following guides will help you get started using Web Application Firewalls

- [Using Web Application Firewalls][] - Get started using `WebApplicationFirealls` quickly
- [Rules for Web Application Firewalls][] - Info about creating and configuring firewall rules
- [Web Application Firewalls in Production][] - Recommendations and info for creating and running `WebApplicationFirewalls` in a production environment

[FirewallRules]: #firewallrules
[ConfigMapReference]: #configmapreference
[usage guides section]: #web-application-firewall-usage-guides
[WebApplicationFirewallPolicy]: ../webapplicationfirewallpolicy
[Using Web Application Firewalls]: ../../../../howtos/web-application-firewalls
[Rules for Web Application Firewalls]: ../../../../howtos/web-application-firewalls-config
[Web Application Firewalls in Production]: ../../../../howtos/web-application-firewalls-in-production
[Kubernetes ConfigMap]: https://kubernetes.io/docs/concepts/configuration/configmap/
