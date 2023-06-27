---
    Title: Configuring Web Application Firewall rules in Edge Stack
    description: Get Web Application Firewalls quickly setup with Edge Stack and create custom firewall rules.
---

# Configuring Web Application Firewall rules in $productName$

When writing your own firewall rules it's important to first take note of a few ways that $productName$'s `WebApplicationFirewalls` work.

1. Requests are either denied or allowed, redirects and dropped requests are not supported
2. If you have a rule in your firewall configuration that specifies the `deny` action and you do not specify a `status`, then we will default to
using status code `403`.
3. State is not preserved across the different phases of proceeing a request. For this reason it is advised to use early blocking mode
rather than anamoly scoring mode and to avoid creating any firewall rules that require state or information created by rules in a different phase. For more information about waf phases refer to the [Coraza Seclang Execution Flow docs][].

## Ambassador Labs Firewall Ruleset

Ambassador Labs publishes and maintains a set of firewall rules that are ready to use.
The latest version of the Ambassador Labs Web Application Firewall ruleset can be downloaded with these commands:

```bash
wget https://app.getambassador.io/download/waf/v1-20230620/aes-waf.conf
wget https://app.getambassador.io/download/waf/v1-20230620/crs-setup.conf
wget https://app.getambassador.io/download/waf/v1-20230620/waf-rules.conf
```

Each file must be imported into $productName$'s Web Application Firewall in the following order:

1. aes-waf.conf
2. crs-setup.conf
3. waf-rules.conf

The Ambassador Labs ruleset largely focuses on incoming requests and by default it does not perform processing on response bodies from upstream services to minimize the request round-trip latency.

If processing of responses is desired, then you can create your own custom rule set or add additional rules to be loaded after the Ambassador Labs ruleset to add custom validation of responses from upstream services.

If you are adding rules to process response bodies after the Ambassador Labs ruleset, then you will need to set `SecResponseBodyAccess On` in your rules to enable access to the response body.

If you'd like to customize the Ambassador Labs default ruleset, you can load your own files before or after waf-rules.conf. Keep in mind that the `WebApplicationFirewall` resource loads firewall configurations via a list of rules sources, and sources lower in the list can overwrite rules and settings from sources higher in the list. See files [REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example][] and [RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example][] for more information.

## Web Application Firewall Rules Release Notes

<Alert severity="info">
To install any of the rules below, import all the files for the desired version in the order they are listed.
</Alert>

### Version v1-20230620

Initial version of $productName$'s Web Application Firewall rules.

Files:

- [aes-waf.conf](https://app.getambassador.io/download/waf/v1-20230620/aes-waf.conf)
- [crs-setup.conf](https://app.getambassador.io/download/waf/v1-20230620/crs-setup.conf)
- [waf-rules.conf](https://app.getambassador.io/download/waf/v1-20230620/waf-rules.conf)

[REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example]: https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example
[RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example]: https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example
[Coraza Seclang Execution Flow docs]: https://coraza.io/docs/seclang/execution-flow/
