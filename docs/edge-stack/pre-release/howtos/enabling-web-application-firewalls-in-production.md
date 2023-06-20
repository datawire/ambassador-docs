# Enabling $productName$'s Web Application Firewall in production

By default, Ambassador Labs rules are configured to block malicious requests. However, when a Web Application Firewall is
first deployed in a production environment, it is recommended to set it in a non-blocking mode and monitor its behavior
to identify potential issues.

The following procedure can be followed to deploy $productName$'s Web Application Firewall in detection-only mode and
customize the rules.

1. Enable Detection Only mode. Detection Only mode will run all rules, but won't execute any disruptive actions.
   This is configured using the directive [SecRuleEngine][].

   You also want to enable debug logs, which are necessary to identify false positives. You can them in the
   `WebApplicationFirewall` resource as described in the [documentation][].

   Optionally, Coraza debug logs can be enabled by setting the directive [SecDebugLogLevel][]. These logs are very verbose
   but can help identify issues when the `WebApplicationFirewall` logs don't show enough information.

   The following example illustrates this:

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
           url: "https://app.getambassador.io/download/waf/v1-20230620/aes-waf.conf"
       - configMapRef:
           key: waf-overrides.conf
           name: waf-configuration
         sourceType: configmap
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230620/crs-setup.conf"
       - sourceType: "http"
         http:
           url: "https://app.getambassador.io/download/waf/v1-20230620/waf-rules.conf"
     logging:
       onInterrupt:
         enabled: true
   ```

2. Identify false positives. $productName$'s container logs will have one or more entries indicating which rules
   were applied to a request and why.

   For example, the following log entry (formatted for readability) shows that a request to `https://34.123.92.3/backend/` was
   blocked by rule 920350 because the Host header contains an IP address.

   ```text
   2023-06-14T17:37:29.145Z	INFO	waf/manager.go:73	request interrupted by waf: default/example-waf
     {
         "message": "Host header is a numeric IP address",
         "data": "34.123.92.3",
         "uri": "https://34.123.92.3/backend/",
         "disruptive": true,
         "matchedDatas": [
             {
                 "Variable_": 54,
                 "Key_": "Host",
                 "Value_": "34.123.92.3",
                 "Message_": "Host header is a numeric IP address",
                 "Data_": "34.123.92.3",
                 "ChainLevel_": 0
             }
         ],
         "rule": {
             "ID_": 920350,
             "File_": "",
             "Line_": 9892,
             "Rev_": "",
             "Severity_": 4,
             "Version_": "OWASP_CRS/4.0.0-rc1",
             "Tags_": [
                 "application-multi",
                 "language-multi",
                 "platform-multi",
                 "attack-protocol",
                 "paranoia-level/1",
                 "OWASP_CRS",
                 "capec/1000/210/272",
                 "PCI/6.5.10"
             ],
             "Maturity_": 0,
             "Accuracy_": 0,
             "Operator_": "",
             "Phase_": 1,
             "Raw_": "SecRule REQUEST_HEADERS:Host \"@rx (?:^([\\d.]+|\\[[\\da-f:]+\\]|[\\da-f:]+)(:[\\d]+)?$)\" \"id:920350,phase:1,block,t:none,msg:'Host header is a numeric IP address',logdata:'%{MATCHED_VAR}',tag:'application-multi',tag:'language-multi',tag:'platform-multi',tag:'attack-protocol',tag:'paranoia-level/1',tag:'OWASP_CRS',tag:'capec/1000/210/272',tag:'PCI/6.5.10',ver:'OWASP_CRS/4.0.0-rc1',severity:'WARNING',setvar:'tx.inbound_anomaly_score_pl1=+%{tx.warning_anomaly_score}'\"",
             "SecMark_": ""
         }
     }
   ```

   If you enabled Coraza debug logs, use the rule ID to identify entries that are not important as follows:

   - Rules in the range 900000 to 901999 define some Coraza behaviors and can be ignored.

   - Rules like the one below are used to skip other rules and can be ignored as well.

     ```text
     SecRule TX:DETECTION_PARANOIA_LEVEL "@lt 1" "id:911012,phase:2,pass,nolog,skipAfter:END-REQUEST-911-METHOD-ENFORCEMENT"
     ```

   <Alert severity="info">
       Each Web Application Firewall configuration file has rules in predefined ranges as follows: Rules in the range
       900000 to 900999 are in crs-setup.conf, rules IDs 901000 to 999999 are in waf-rules.conf, and all other rules are in aes-waf.conf.
   </Alert>


## Customizing Ambassador Labs rules

There are several options to configure if/when a rule runs:
1. Disable a rule completely.
2. Apply a rule to some requests.

### Disabling a rule completely

To disable a rule, follow the instructions in [RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example][], save the
configuration as a ConfigMap, and load it after `waf-rules.conf`.

For example, let's say that we want to disable the rule with ID `913110`. The first step is to create the configuration:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
 name: "waf-configuration"
data:
 disabled-rules.conf: |
   SecRuleRemoveById 913110
```

And then load it after `waf-rules.conf`:

```yaml
apiVersion: gateway.getambassador.io/v1alpha1
kind: WebApplicationFirewall
metadata:
 name: "waf-rules"
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
   - configMapRef:
       key: disabled-rules.conf
       name: waf-configuration
     sourceType: configmap
```

### Applying a rule to some requests

To apply a rule only to some requests, update it as described in [REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example][] and
load the new settings before `waf-rules.conf`.

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
       url: "https://app.getambassador.io/download/waf/v1-20230620/aes-waf.conf"
   - sourceType: "http"
     http:
       url: "https://app.getambassador.io/download/waf/v1-20230620/crs-setup.conf"
   - configMapRef:
       key: website-rules.conf
       name: waf-configuration
     sourceType: configmap
   - sourceType: "http"
     http:
       url: "https://app.getambassador.io/download/waf/v1-20230620/waf-rules.conf"
```

[SecRuleEngine]: https://coraza.io/docs/seclang/directives/#secruleengine
[SecDebugLogLevel]: https://coraza.io/docs/seclang/directives/#secdebugloglevel
[REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example]: https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example
[RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example]: https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example
[documentation]: ../web-application-firewalls
