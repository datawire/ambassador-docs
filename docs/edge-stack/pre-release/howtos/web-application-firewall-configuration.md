# Configuring the Web Application Firewall rules in $productName$

The Ambassador Labs Web Application Firewall ruleset can be downloaded with these commands:

```bash
wget https://app.getambassador.io/download/waf/v1-20230602/aes-waf.conf
wget https://app.getambassador.io/download/waf/v1-20230602/crs-setup.conf
wget https://app.getambassador.io/download/waf/v1-20230602/waf-rules.conf
```

Each file must be imported into $productName$'s Web Application Firewall in the following order:

1. aes-waf.conf
2. crs-setup.conf
3. waf-rules.conf

If you'd like to customize Ambassador Labs default rules, you can load your own files before or after waf-rules.conf.  See files [REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example][] and [RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example][] for more information.

## Web Application Firewall Rules Release Notes

<Alert severity="info">
To install any of the rules below, import all the files for the desired version in the order they are listed.
</Alert>

### Version v1-20230602

Initial version of $productName$ Web Application Firewall rules.


[REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example]: https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example
[RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example]: https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example
