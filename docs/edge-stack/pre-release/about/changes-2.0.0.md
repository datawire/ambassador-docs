Major Changes in $productName$ 2.0.0
====================================

While $productName$ 2.0.0 is largely compatible with $productName$ 1.13, it introduces some significant changes that may require changes to existing configurations.

## 1. Configuration API Version `getambassador.io/v3alpha1`

$productName$ configuration resource API versions `getambassador.io/v0`, `getambassador.io/v1`, and `getambassador.io/v2` are **deprecated** as of $productName$ 2.0.0 in favor of API version `getambassador.io/v3alpha1`. 

Obviously, `v3alpha1` is an early version that may change as we receive feedback. `v2` will still be supported, although certain semantics must change for $productName$ 2.0.0 (as described below). 

## 2. `Listener`s, `Host`s, and `Mapping`s

$productName$ 2.0.0 introduces the new `Listener` CRD, and changes certain semantics of the relationship between `Listener`s, `Host`s, and `Mapping`s.

### The `Listener` CRD

The new [`Listener` CRD](../topics/running/listener) defines where and how $productName$ should listen for requests from the network, and which `Host` definitions should be used to process those requests.

Specifically, a `Listener` defines 

- `port`: a port number on which to listen for new requests;
- `protocol` and `securityModel`: the protocol stack and security model to use (e.g. `HTTPS` using the `X-Forwarded-Proto` header); and
- `hostBinding`: how to tell if a given `Host` should be associated with this `Listener`:
   - a `Listener` can choose to consider all `Host`s, or only `Host`s in the same namespace as the `Listener`, or
   - a `Listener` can choose to consider only `Host`s with a particular Kubernetes `label`.

**Note that the `hostBinding ` is mandatory.** A `Listener` _must_ specify how to identify the `Host`s to associate with the `Listener`', or the `Listener` will be rejected. This is intended to help prevent cases where a `Listener` mistakenly grabs too many `Host`s: if you truly need a `Listener` that associates with all `Host`s, the easiest way is to tell the `Listener` to look for `Host`s in all namespaces, with no further selectors, for example:

```yaml
apiVersion: getambassador.io/v3alpha1
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

Note also that there is no limit on how many `Listener`s may be created, and as such no limit on the number of ports to which a `Host` may be associated.

### `Host` and `Mapping` Association

The [`Host` CRD](../topics/running/host-crd) continues to define information about hostnames, TLS certificates, and how to handle requests that are "secure" (using HTTPS) or "insecure" (using HTTP). The [`Mapping` CRD](../topics/using/intro-mappings) continues to define how to map the URL space to upstream services.

However, in $productName$ 2.0.0, a `Mapping` will not be associated with a `Host` unless at least one of the following is true:

- The `Mapping` specifies a `host` attribute that matches the `Host` in question.
- The `Host` specifies a `selector` that matches the `Mapping`'s Kubernetes `label`s.
   - Prior to 2.0.0, a `Host` in which no `selector` was specified would have a default `selector`; this is no longer the case.

If neither of the above is true, the `Mapping` will not be associated with the `Host` in question. This is intended to help manage memory consumption with large numbers of `Host`s and large numbers of `Mapping`s.

### Independent `Host` Actions

Each `Host` can specify its `requestPolicy.insecure.action` independently of any other `Host`, allowing for HTTP routing as flexible as HTTPS routing.

### `Host`, `TLSContext`, and TLS Termination

In $productName$ 2.0.0, **`Host`s are required for TLS termination**. It is no longer sufficient to create a [`TLSContext`](../topics/running/tls/#tlscontext) by itself; the [`Host`](../topics/running/host-crd) is required.

The minimal setup for TLS termination is therefore a Kubernetes `Secret` of type `kubernetes.io/tls`, and a `Host` that uses it:

```yaml
---
kind: Secret
type: kubernetes.io/tls
metadata:
  name: minimal-secret
data:
  tls secret goes here
---
apiversion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: minimal-host
spec:
  hostname: minimal.example.com
  tlsSecret:
    name: minimal-secret
```

It is **not** necessary to explicitly state a `TLSContext` in the `Host`: setting `tlsSecret` is enough. Of course, `TLSContext` is still the ideal way to share TLS configuration between more than one `Host`. For further examples, see [Configuring $productName$ to Communicate](../howtos/configure-communications).

### `PROXY` Protocol Configuration

Configuration for the `PROXY` protocol is part of the `Listener` resource in $productName$ 2.0.0, so the `use_proxy_protocol` element of the `ambassador` `Module` is no longer supported. Note that the `Listener` resource can configure `PROXY` resource per-`Listener`, rather than having a single global setting. For further information, see the [`Listener` documentation](../topics/running/listener).

### `Host`s and ACME

In $productName$ 2.0.0, ACME will be disabled if a `Host` does not set `acmeProvider` at all (prior to 2.0.0, not mentioning `acmeProvider` would result in the ACME client attempting, and failing, to start). If `acmeProvider` is set, but `acmeProvider.authority` is not set, the ACME client will continue to default to Let's Encrypt, in order to preserve compatibility with $productName$ prior to 2.0.0. For further examples, see [Configuring $productName$ to Communicate](../howtos/configure-communications).

## 3. Other Changes

### Envoy V3 API by Default

By default, $productName$ will configure Envoy using the [V3 Envoy API](https://www.envoyproxy.io/docs/envoy/latest/api-v3/api). In 2.0.0, you may switch back to Envoy V2 by setting the `AMBASSADOR_ENVOY_API_VERSION` environment variable to "V2"; a future version will remove V2 support.

### More Performant Reconfiguration by Default

The environment variable `AMBASSADOR_FAST_RECONFIGURE` is a feature flag that enables a higher performance implementation of the code $productName$ uses to validate and generate envoy configuration. It is enabled by default in 2.0.0.

### TLS, the `ambassador` `Module`, and the `tls` `Module`

It is no longer possible to configure TLS using the `tls` element of the `ambassador` `Module` or using the `tls` `Module`. Both of these cases are correctly covered by the `TLSContext` resource.

### `TLSContext` `redirect_cleartext_from` and `Host` `insecure.additionalPort`

`redirect_cleartext_from` has been removed from the `TLSContext` resource; `insecure.additionalPort` has been removed from the `Host` CRD. Both of these cases are covered by adding additional `Listener`s. For further examples, see [Configuring $productName$ to Communicate](../howtos/configure-communications).

### Service Preview No Longer Supported

Service Preview is no longer supported in $productName$ 2.0.0, as its use cases are supported by Telepresence.

### Edge Policy Console No Longer Supported

The Edge Policy Console has been removed in $productName$ 2.0.0, in favor of Ambassador Cloud.

### `Project` CRD No Longer Supported

The `Project` CRD has been removed in $productName$ 2.0.0, in favor of Argo.


