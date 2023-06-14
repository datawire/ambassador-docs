# Enabling $productName$'s Web Application Firewall in production

By default, Ambassador Labs rules are configured to block malicious requests. However, when a Web Application Firewall is
first deployed in a production environment, it is recommended to set it in a non-blocking mode, and monitor its behaviour
to identify potential issues.

The following procedure can be followed to deploy $productName$'s Web Application Firewall in detection only mode and
customize the rules:

1. Enable Detection Only mode. Detection Only mode will run all rules, but not execute any disruptive actions. In addition,
   you want to enable debug logs, which is necessary to identify false positives.
   To enable Detection Only mode, update directives [SecRuleEngine][] and [SecDebugLogLevel][] as follows:

   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: "waf-configuration"
   data:
     waf-overrides.conf: |
       SecRuleEngine DetectionOnly
       SecDebugLogLevel 4

   ---

   apiVersion: gateway.getambassador.io/v1alpha1
   kind: WebApplicationFirewall
   metadata:
     name: "waf-rules"
   spec:
     firewallRules:
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230613/aes-waf.conf"
       - configMapRef:
           key: waf-overrides.conf
           name: waf-configuration
         sourceType: configmap
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230613/crs-setup.conf"
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230613/waf-rules.conf"
   ```

2. Identify potential false positives. Go to AES logs and find entries that contains text `Rule matched`.

   Rules in the range 900000 to 901999 configure some Coraza behaviours and can be ignored. For other rules, go over the
   logs, and check why did the rule match.

   Some rules are used to skip other blocks of rules, like this one:

   ```text
   SecRule TX:DETECTION_PARANOIA_LEVEL "@lt 1" "id:911012,phase:2,pass,nolog,skipAfter:END-REQUEST-911-METHOD-ENFORCEMENT"
   ```

   Usually you can skip these rules as well.

   Once you identify a rule that is causing false positives, updated it as explained in the next section.

   ```
   <Alert severity="info">
       Each configuration file has rules in different ranges as follows:
       Rules in the range 900000 to 900999 are in crs-setup.conf. Rules in the range 901000 to 999999 are in waf-rules.conf.
       All other rules are in aes-waf.conf.
   </Alert>
   ```

## Customizing Ambassador Labs rules

There are several options to configure if/when a rule runs:
1. Disable a rule completely.
2. Apply a rule to some requests.

### Disabling a rule completely

To disable a rule, follow the instructions in [RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example][], save the
configuration as a ConfigMap, and load it after `waf-rules.conf`.

For example, let's say that we want to disable rule with ID `913110`. The first step is to create the configuration:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
 name: "waf-configuration"
data:
 disabled-rules.conf: |
   SecRuleRemoveById 913110
```

The second part is to load this configuration after `waf-rules.conf`:

```yaml
apiVersion: gateway.getambassador.io/v1alpha1
kind: WebApplicationFirewall
metadata:
 name: "waf-rules"
spec:
 firewallRules:
   - sourceType: "http"
     http:
       url: "https://app.getambassador.io/download/waf/v1-20230613/aes-waf.conf"
   - sourceType: "http"
     http:
       url: "https://app.getambassador.io/download/waf/v1-20230613/crs-setup.conf"
   - sourceType: "http"
     http:
       url: "https://app.getambassador.io/download/waf/v1-20230613/waf-rules.conf"
   - configMapRef:
       key: disabled-rules.conf
       name: waf-configuration
     sourceType: configmap
```

### Apply a rule to some requests

To configure a rule to apply only to some requests, update it as described in [REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example][],
save that configuration as a ConfigMap (see the previous section), and load if before `waf-rules.conf`.

The following example shows how to disable all rules tagged `attack-sqli` when the URI does not start with '/api/':

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
 name: "waf-configuration"
data:
 website-rules.conf: |
   SecRule REQUEST_URI "!@beginsWith /api/" \
       "id:1000,\
       phase:2,\
       pass,\
       nolog,\
       ctl:ruleRemoveByTag=attack-sqli"

---

apiVersion: gateway.getambassador.io/v1alpha1
kind: WebApplicationFirewall
metadata:
 name: "waf-rules"
spec:
 firewallRules:
   - sourceType: "http"
     http:
       url: "https://app.getambassador.io/download/waf/v1-20230613/aes-waf.conf"
   - sourceType: "http"
     http:
       url: "https://app.getambassador.io/download/waf/v1-20230613/crs-setup.conf"
   - configMapRef:
       key: website-rules.conf
       name: waf-configuration
     sourceType: configmap
   - sourceType: "http"
     http:
       url: "https://app.getambassador.io/download/waf/v1-20230613/waf-rules.conf"
```

[SecRuleEngine]: https://coraza.io/docs/seclang/directives/#secruleengine
[SecDebugLogLevel]: https://coraza.io/docs/seclang/directives/#secdebugloglevel
