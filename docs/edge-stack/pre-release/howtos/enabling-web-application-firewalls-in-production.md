# Enabling $productName$'s Web Application Firewall in production

By default, Ambassador Labs rules are configured to block malicious requests. However, when a Web Application Firewall is
first deployed in a production environment, it is recommended to set it in a non-blocking mode, and monitor its behaviour
to identify potential issues.

The following procedure can be followed to deploy $productName$'s Web Application Firewall in detection only mode and
customize the rules:

1. Enable Detection Only mode. This is done by setting the Directive [SecRuleEngine][] to `DetectionOnly`. In addition,
   enable debug logs, which is necessary to identify false positives. Both settings can be updated like this:

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
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230613/crs-setup.conf"
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230613/waf-rules.conf"
       - configMapRef:
           key: waf-overrides.conf
           name: waf-configuration
         sourceType: configmap
   ---
   EOF
   ```

2. Identify which rules are matching requests.  Go to AES logs and find entries that contains text `Rule matched`.

   Rules in the range 900000 to 901999 define variables, and can be ignored. For other rules, go over the logs, and check
   why did the rule match.

  If you identify rules that should not be matching, updated them as explained in the next section.

## Customizing Ambassador Labs rules

There are several options to configure when a rule is enabled.

1. Disable a rule completely
2. Enable a rule only to some requests

### Disabling a rule completely

To disable a rule, follow the instructions in [RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example][], and save the
configuration as a ConfigMap, and load it after `waf-rules.conf`.

For example, let's say that we want to disable rule with ID `913110`. The first step is to create the configuration:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: "waf-configuration"
   data:
     disabled-rules.conf: |
       SecRuleRemoveById 913110
   ---
   EOF
   ```

The second part is to load this configuration after `waf-rules.conf`:

   ```yaml
   kubectl apply -f -<<EOF
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
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230613/waf-rules.conf"
       - configMapRef:
           key: disabled-rules.conf
           name: waf-configuration
         sourceType: configmap
   ---
   EOF
   ```

### Apply a rule so some requests

To configure a rule to apply only to some requests, update it as described in [REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example][],
save that configuration as a ConfigMap (see the first step), and load if before `waf-rules.conf`.

The following example shows how to disable all rules tagged `attack-sqli` only when the URI does not start with '/api/':

   ```yaml
   kubectl apply -f -<<EOF
   ---
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
   ---
   EOF
   ```
