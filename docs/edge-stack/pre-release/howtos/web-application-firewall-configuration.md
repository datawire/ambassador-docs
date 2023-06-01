# Configuring the Web Application Firewall rules in $productName$

The Ambassador Labs Web Application Firewall ruleset can be downloaded with these commands:

```bash
wget https://app.getambassador.io/download/waf/v1%2B20230601/aes-waf.conf -O aes-waf.conf
wget https://app.getambassador.io/download/waf/v1%2B20230601/crs-setup.conf -O crs-setup.conf
wget https://app.getambassador.io/download/waf/v1%2B20230601/waf-rules.conf -O waf-rules.conf
```

Each file must be imported into $productName$'s Web Application Firewall in the following order:

1. aes-waf.conf
2. crs-setup.conf
3. waf-rules.conf

If you'd like to customize $productName$'s Web Application Firewall, you can load your files before or after waf-rules.conf.  See files [REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example](https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example) and [RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example](https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf.example) for more information.

