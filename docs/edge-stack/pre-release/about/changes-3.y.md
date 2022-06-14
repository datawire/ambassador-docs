import Alert from '@material-ui/lab/Alert';

Major Changes in $productName$ 3.X
==================================

The 3.X family introduces a number of changes to ensure $productName$
keeps up with latest Envoy versions and to support new features such as HTTP/3.
We welcome feedback! Join us on [Slack](http://a8r.io/slack) and let us know what you think.

$productName$ 3 is functionally compatible with $productName$ 2.x, but with any major upgrade there are some changes to consider. Such as, Envoy removing support for V2 Transport Protocol features. Below we will outline some of these changes and things to consider when upgrading.

## 1. Envoy Upgraded to 1.22

$productName$ 3.0 has been upgraded from Envoy 1.17.X to Envoy **1.22** which keeps $productName$ up-to-date with
the latest security fixes, bug fixes, performance improvements and feature enhancements provided by Envoy Proxy. Most of the changes are under the hood but the most notable change to developers is the removal of support for Envoy V2 Transport Protocol. This means all external filters and LogServices must be updated to use the V3 Protocol.

This also means some of the v2 runtime bootstrap flags have been removed as well:

```yaml
# No longer necessary because this was removed from Envoy
# $productName$ already was converted to use the compressor API
# https://www.envoyproxy.io/docs/envoy/v1.22.0/configuration/http/http_filters/compressor_filter#config-http-filters-compressor
"envoy.deprecated_features.allow_deprecated_gzip_http_filter": true,

# Upgraded to v3, all support for V2 Transport Protocol removed
"envoy.deprecated_features:envoy.api.v2.route.HeaderMatcher.regex_match": true,
"envoy.deprecated_features:envoy.api.v2.route.RouteMatch.regex": true,

# Developer will need to upgrade TracingService to V3 protocol which no longer supports HTTP_JSON_V1
"envoy.deprecated_features:envoy.config.trace.v2.ZipkinConfig.HTTP_JSON_V1": true,

# V2 protocol removed so flag no longer necessary
"envoy.reloadable_features.enable_deprecated_v2_api": true,
```

<Alert severity="info">
  <a href="https://www.envoyproxy.io">Learn more about Envoy Proxy changes</a>.
</Alert>

## 2. Envoy V2 Protocol Support Removed

With the upgrade to Envoy **1.22**, the V2 Envoy Transport Portocol is no longer supported.
$productName$ 3.0 **only** supports [V3 Envoy API](https://www.envoyproxy.io/docs/envoy/latest/api-v3/api).

<Alert severity="warn">
The environment variable <code>AMBASSADOR_ENVOY_API_VERSION</code> has been removed and will no longer have the affect
of changing the transport protocol.
</Alert>

<Alert severity="warn">
The setting of <code>transport_protocol</code> to <code>v2</code> is no longer supported within CRDS (AuthService, etc...). An error will now be logged and $productName$ will not configure envoy correctly. You should remove this field from your CRD's or convert it to <code>v3</code> the only supported version at this time.
</Alert>
