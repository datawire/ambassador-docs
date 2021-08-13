import Alert from '@material-ui/lab/Alert';

Major Changes in $productName$ 2.0.0
====================================

# 2.0 is a Developer Preview!

We're pleased to introduce $productName$ 2.0 as a **developer preview**. The 2.X family introduces
a number of changes to allow $productName$ to more gracefully handle larger installations, reduce global
configuration to better handle multitenant or multiorganizational installations, reduce memory footprint,
and improve performance. We welcome feedback!! Join us on [Slack](https://a8r.io/slack) and let us know
what you think.

While $productName$ 2.0.0 is functionally compatible with $productName$ 1.13, some resources have moved
into a different APIgroup with different names. Upgrading will require editing your configuration.

## 1. Configuration API Version `x.getambassador.io/v3alpha1`

$productName$ 2.0.0 introduces API version `x.getambassador.io/v3alpha1` for configuration changes that are not backwards compatible with the 1.X family, notably the `AmbassadorListener`, `AmbassadorHost`, and `AmbassadorMapping` resources (see below). Obviously, `v3alpha1` is an early version that may change as we receive feedback.

Additionally, configuration resource API versions `getambassador.io/v0` and `getambassador.io/v1` are no longer supported.

## 2. `AmbassadorListener`s, `AmbassadorHost`s, and `AmbassadorMapping`s

$productName$ 2.0.0 introduces the new **mandatory** `AmbassadorListener` CRD, and brings new names for the
`AmbassadorHost` and `AmbassadorMapping` resources.

**NOTE WELL:** `Host` and `Mapping` are **not supported** in $productName$ 2.0.0.

The motivation behind the change is that certain semantics around `AmbassadorListener`s, `AmbassadorHost`s, and `AmbassadorMapping`s change:

   1. `AmbassadorListener`s are never created by $productName$: they **must** be defined by the user.
   2. $productName$ does not make sure that a wildcard `AmbassadorHost` exists: if the wildcard behavior is
      needed, an `AmbassadorHost` with a `hostname` of `"*"` must be defined by the user.
   3. The semantics of which `AmbassadorMappings` associate with which `AmbassadorHost` are different from how `Mapping`s
      and `Host`s worked.
   4. `AmbassadorMapping` gains a `hostname` element. `host` is an exact match or a regex, as determined by `host_regex`, but
      `hostname` is always a DNS glob.

<Alert severity="info">
  <a href="../../topics/running/ambassadorlistener">Learn more about <code>AmbassadorListener</code></a>.<br/>
  <a href="../../topics/running/host-crd">Learn more about <code>AmbassadorHost</code></a>.<br/>
  <a href="../../topics/using/intro-mappings">Learn more about <code>AmbassadorMapping</code></a>.
</Alert>

### The `AmbassadorListener` CRD

The new [`AmbassadorListener` CRD](../../topics/running/ambassadorlistener) defines where and how $productName$ should listen for requests from the network, and which `AmbassadorHost` definitions should be used to process those requests.

**Note that `AmbassadorListener`s are never created by $productName$, and must be defined by the user.** If you do not
define any `AmbassadorListener`s, $productName$ will not listen anywhere for connections, and therefore won't do
anything useful. It will log a `WARNING` to this effect.

An `AmbassadorListener` specifically defines

- `port`: a port number on which to listen for new requests;
- `protocol` and `securityModel`: the protocol stack and security model to use (e.g. `HTTPS` using the `X-Forwarded-Proto` header); and
- `hostBinding`: how to tell if a given `AmbassadorHost` should be associated with this `AmbassadorListener`:
   - an `AmbassadorListener` can choose to consider all `AmbassadorHost`s, or only `AmbassadorHost`s in the same namespace as the `AmbassadorListener`, or
   - an `AmbassadorListener` can choose to consider only `AmbassadorHost`s with a particular Kubernetes `label`.

**Note that the `hostBinding ` is mandatory.** An `AmbassadorListener` _must_ specify how to identify the `AmbassadorHost`s to associate with the `AmbassadorListener`', or the `AmbassadorListener` will be rejected. This is intended to help prevent cases where an `AmbassadorListener` mistakenly grabs too many `AmbassadorHost`s: if you truly need an `AmbassadorListener` that associates with all `AmbassadorHost`s, the easiest way is to tell the `AmbassadorListener` to look for `AmbassadorHost`s in all namespaces, with no further selectors, for example:

```yaml
apiVersion: x.getambassador.io/v3alpha1
kind: listener
metadata:
  name: all-hosts-listener
spec:
  port: 8080
  securityModel: XFP
  protocol: HTTPS
  hostBinding:
    namespace:
      from: ALL
```

Note also that there is no limit on how many `AmbassadorListener`s may be created, and as such no limit on the number of ports to which an `AmbassadorHost` may be associated.

<Alert severity="info">
  <a href="../../topics/running/ambassadorlistener">Learn more about <code>AmbassadorListener</code></a>.<br/>
  <a href="../../topics/running/host-crd">Learn more about <code>AmbassadorHost</code></a>.
</Alert>

### Wildcard `AmbassadorHost`s

In $productName$ 1.X, $productName$ would make sure that a wildcard `Host`, with a `hostname` of `"*"`, was always present.
$productName$ 2.X does **not** force a wildcard `AmbassadorHost`: if you need the wildcard behavior, you will need to create
an `AmbassadorHost` with a hostname of `"*"`.

Of particular note is that $productName$ **will not** respond to queries to an IP address unless a wildcard
`AmbassadorHost` is present. If `foo.example.com` resolves to `10.11.12.13`, and the only `AmbassadorHost` has a
`hostname` of `foo.example.com`, then:

- requests to `http://foo.example.com/` will work, but
- requests to `http://10.11.12.13/` will **not** work.

Adding an `AmbassadorHost` with a `hostname` of `"*"` will allow the second query to work.

<Alert severity="info">
  <a href="../../topics/running/host-crd">Learn more about <code>AmbassadorHost</code></a>.
</Alert>

### `AmbassadorHost` and `AmbassadorMapping` Association

The [`AmbassadorHost` CRD](../../topics/running/host-crd) continues to define information about hostnames, TLS certificates, and how to handle requests that are "secure" (using HTTPS) or "insecure" (using HTTP). The [`AmbassadorMapping` CRD](../../topics/using/intro-mappings) continues to define how to map the URL space to upstream services.

However, in $productName$ 2.0.0, an `AmbassadorMapping` will not be associated with an `AmbassadorHost` unless at least one of the following is true:

- The `AmbassadorMapping` specifies a `hostname` attribute that matches the `AmbassadorHost` in question.
- The `AmbassadorHost` specifies a `selector` that matches the `AmbassadorMapping`'s Kubernetes `label`s.
   - Prior to 2.0.0, an `AmbassadorHost` in which no `selector` was specified would have a default `selector`; this is no longer the case.

If neither of the above is true, the `AmbassadorMapping` will not be associated with the `AmbassadorHost` in question. This is intended to help manage memory consumption with large numbers of `AmbassadorHost`s and large numbers of `AmbassadorMapping`s.

An `AmbassadorListener` that has no associated `AmbassadorHost`s will be logged as a `WARNING`, and will not be included in the Envoy configuration generated by $productName$.

<Alert severity="info">
  <a href="../../topics/running/host-crd">Learn more about <code>AmbassadorHost</code></a>.<br/>
  <a href="../../topics/using/intro-mappings">Learn more about <code>AmbassadorMapping</code></a>.
</Alert>

### Independent `AmbassadorHost` Actions

Each `AmbassadorHost` can specify its `requestPolicy.insecure.action` independently of any other `AmbassadorHost`, allowing for HTTP routing as flexible as HTTPS routing.

<Alert severity="info">
  <a href="../../topics/running/host-crd">Learn more about <code>AmbassadorHost</code></a>.
</Alert>

### `AmbassadorHost`, `TLSContext`, and TLS Termination

In $productName$ 2.0.0, **`AmbassadorHost`s are required for TLS termination**. It is no longer sufficient to create a [`TLSContext`](../../topics/running/tls/#tlscontext) by itself; the [`AmbassadorHost`](../../topics/running/host-crd) is required.

The minimal setup for TLS termination is therefore a Kubernetes `Secret` of type `kubernetes.io/tls`, and an `AmbassadorHost` that uses it:

```yaml
---
kind: Secret
type: kubernetes.io/tls
metadata:
  name: minimal-secret
data:
  tls secret goes here
---
apiversion: x.getambassador.io/v3alpha1
kind: AmbassadorHost
metadata:
  name: minimal-host
spec:
  hostname: minimal.example.com
  tlsSecret:
    name: minimal-secret
```

It is **not** necessary to explicitly state a `TLSContext` in the `AmbassadorHost`: setting `tlsSecret` is enough. Of course, `TLSContext` is still the ideal way to share TLS configuration between more than one `AmbassadorHost`. For further examples, see [Configuring $productName$ to Communicate](../../howtos/configure-communications).

<Alert severity="info">
  <a href="../../topics/running/host-crd">Learn more about <code>AmbassadorHost</code></a>.<br/>
  <a href="../../topics/running/tls/#tlscontext">Learn more about <code>TLSContext</code></a>.
</Alert>

### `PROXY` Protocol Configuration

Configuration for the `PROXY` protocol is part of the `AmbassadorListener` resource in $productName$ 2.0.0, so the `use_proxy_protocol` element of the `ambassador` `Module` is no longer supported. Note that the `AmbassadorListener` resource can configure `PROXY` resource per-`AmbassadorListener`, rather than having a single global setting. For further information, see the [`AmbassadorListener` documentation](../../topics/running/ambassadorlistener).

<Alert severity="info">
  <a href="../../topics/running/ambassadorlistener">Learn more about <code>AmbassadorListener</code></a>.
</Alert>

### `AmbassadorHost`s and ACME

In $productName$ 2.0.0, ACME will be disabled if an `AmbassadorHost` does not set `acmeProvider` at all (prior to 2.0.0, not mentioning `acmeProvider` would result in the ACME client attempting, and failing, to start). If `acmeProvider` is set, but `acmeProvider.authority` is not set, the ACME client will continue to default to Let's Encrypt, in order to preserve compatibility with $productName$ prior to 2.0.0. For further examples, see [Configuring $productName$ to Communicate](../../howtos/configure-communications).

<Alert severity="info">
  <a href="../../topics/running/host-crd">Learn more about <code>AmbassadorHost</code></a>.
</Alert>

## 3. Other Changes

### Envoy V3 API by Default

By default, $productName$ will configure Envoy using the [V3 Envoy API](https://www.envoyproxy.io/docs/envoy/latest/api-v3/api). In 2.0.0, you may switch back to Envoy V2 by setting the `AMBASSADOR_ENVOY_API_VERSION` environment variable to "V2"; a future version will remove V2 support.

### More Performant Reconfiguration by Default

The environment variable `AMBASSADOR_FAST_RECONFIGURE` is a feature flag that enables a higher performance implementation of the code $productName$ uses to validate and generate envoy configuration. It is enabled by default in 2.0.0.

### TLS, the `ambassador` `Module`, and the `tls` `Module`

It is no longer possible to configure TLS using the `tls` element of the `ambassador` `Module` or using the `tls` `Module`. Both of these cases are correctly covered by the `TLSContext` resource.

### `TLSContext` `redirect_cleartext_from` and `AmbassadorHost` `insecure.additionalPort`

`redirect_cleartext_from` has been removed from the `TLSContext` resource; `insecure.additionalPort` has been removed from the `AmbassadorHost` CRD. Both of these cases are covered by adding additional `AmbassadorListener`s. For further examples, see [Configuring $productName$ to Communicate](../../howtos/configure-communications).

### Service Preview No Longer Supported

Service Preview is no longer supported in $productName$ 2.0.0, as its use cases are supported by Telepresence.

### Edge Policy Console No Longer Supported

The Edge Policy Console has been removed in $productName$ 2.0.0, in favor of Ambassador Cloud.

### `Project` CRD No Longer Supported

The `Project` CRD has been removed in $productName$ 2.0.0, in favor of Argo.


