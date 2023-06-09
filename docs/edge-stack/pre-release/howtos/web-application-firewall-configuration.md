# Configuring the Web Application Firewall rules in $productName$

The latest version of the Ambassador Labs Web Application Firewall ruleset can be downloaded with these commands:

```bash
wget https://app.getambassador.io/download/waf/v1-20230609/aes-waf.conf
wget https://app.getambassador.io/download/waf/v1-20230609/crs-setup.conf
wget https://app.getambassador.io/download/waf/v1-20230609/waf-rules.conf
```

Each file must be imported into $productName$'s Web Application Firewall in the following order:

1. aes-waf.conf
2. crs-setup.conf
3. waf-rules.conf

If you'd like to customize Ambassador Labs default rules, you can load your own files before or after waf-rules.conf.  See files [REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example][] and [RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example][] for more information.

## Enabling $productName$'s Web Application Firewall in production

By default, Ambassador Labs rules are configured to block malicious requests. However, when a Web Application Firewall is deployed to a production
environment, it's recommended to set it in a non-blocking mode, and monitor its behaviour, to identify potential issues.

The following procedure can be followed to deploy $productName$'s Web Application Firewall in detection only mode and to configure the rules:

1. Enable Detection only mode. This is done by setting the Directive [SecRuleEngine][] to `DetectionOnly`.  You can override the default rules by applying a ConfigMap like this:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: "waf-configuration"
   data:
     waf-overrides.conf: |
       SecRuleEngine DetectionOnly
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: WebApplicationFirewall
   metadata:
     name: "waf-rules"
   spec:
     firewallRules:
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230609/aes-waf.conf"
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230609/crs-setup.conf"
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230609/waf-rules.conf"
       - configMapRef:
           key: waf-overrides.conf
           name: waf-configuration
         sourceType: configmap
   EOF
   ```

2. TBC. This step will depend on what information is in the logs and how to enable them

3. Tweak problematic rules.  Rules can be either disabled completely, or updated to only run on some requests.

To configure a rule to apply only to some requests, customize is as described in [REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example][], save that configuration as a ConfigMap (see the first step), and load that ConfigMap before `waf-rules.conf`.

To update a rule to apply to all requests, or to disable it completely, follow the instructions in [RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example][], and save that configuration as a ConfigMap. Load that configmap as shown before, after `waf-rules.conf`.

## Web Application Firewall Rules Release Notes

<Alert severity="info">
To install any of the rules below, import all the files for the desired version in the order they are listed.
</Alert>

### Version v1-20230609

Initial version of $productName$'s Web Application Firewall rules.

Files:
- [aes-waf.conf](https://app.getambassador.io/download/waf/v1-20230609/aes-waf.conf)
- [crs-setup.conf](https://app.getambassador.io/download/waf/v1-20230609/crs-setup.conf)
- [waf-rules.conf](https://app.getambassador.io/download/waf/v1-20230609/waf-rules.conf)

[REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example]: https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example
[RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example]: https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example
[SecRuleEngine]: https://coraza.io/docs/seclang/directives/#secruleengine
