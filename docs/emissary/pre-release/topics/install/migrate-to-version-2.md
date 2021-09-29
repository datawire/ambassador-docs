import Alert from '@material-ui/lab/Alert';

# $productName$ 2.X Migration Guide

<Alert severity="info">
  This guide covers migrating from $productName$ 1.X to $productName$ 2.X. To upgrade within major versions, see the&nbsp;
  <a href="../upgrading">Upgrading $productName$ Guide</a>.
</Alert>

We're pleased to introduce $productName$ 2.0! The 2.X family introduces a number of
changes to allow $productName$ to more gracefully handle larger installations (including
multitenant or multiorganizational installations), reduce memory footprint, and improve
performance. In keeping with [SemVer](https://semver.org), $productName$ 2.X introduces
some changes that aren't backward-compatible with 1.X. These changes are detailed in
[Major Changes in $productName$ 2.0.0](../../../about/changes-2.0.0), and they require
configuration updates when migrating.

## 1. Migration Process

### Install $productName$ 2.0.0 next to your running instance.

By far the easiest way to do this is with Helm:

```sh
# Add the Repo:
helm repo add datawire https://app.getambassador.io

# Create Namespace and Install:
kubectl create namespace $productNamespace$ && \
helm install $productHelmName$ --devel --namespace $productNamespace$ datawire/$productHelmName$ && \
kubectl -n $productNamespace$ wait --for condition=available --timeout=90s deploy -lapp.kubernetes.io/instance=$productHelmName$
```

This will install the `getambassador.io/v3alpha1` APIgroup, and start $productName$ running in its the
$productNamespace$ namespace. As its `v3alpha1` version implies, we are actively seeking feedback on it,
and it may change before its promotion to `getambassador.io/v3`.

### Make sure all `ambassador_id`s are arrays, not simple strings.

In any resource that you want your 2.X instance to honor, any `ambassador_id: "foo"` must become
`ambassador_id: [ "foo" ]`. This applies to all $productName$ resources, and is supported by all versions
of Ambassador 1.X.

### Define an `AmbassadorListener` for each port on which your installation should listen.

<Alert severity="info">
  <a href="../../running/ambassadorlistener">Learn more about <code>AmbassadorListener</code></a>
</Alert>

`AmbassadorListener` is **mandatory**. It's worth thinking about the `hostBinding`s to use for
each `AmbassadorListener`, too, though you can start migrating with

```yaml
hostBinding:
  namespace:
    from: ALL
```

### Update `Host` resources to `v3alpha1`.

<Alert severity="info">
  <a href="../../running/host-crd">Learn more about <code>AmbassadorHost</code></a>
</Alert>

$productName$ will find `Host` resources without updating the `apiVersion`. However, making
sure that `AmbassadorListener`s, `Host`s, and `Mapping`s correctly associate with each other
will likely require changes. Therefore, for each existing `Host` resource that you want to
use with $productName$ 2.X:

- change the `apiVersion` to `getambassador.io/v3alpha1`;
- add `metadata.labels` as needed to match the `hostBinding` for the `AmbassadorListener`s with which
  the `AmbassadorHost` should associate; and
- set `spec.mappingSelector`, if desired, to control which `AmbassadorMappings` will be associated 
  with this `AmbassadorHost`.

### Update `Mapping` resources to `v3alpha1`.

<Alert severity="info">
  <a href="../../using/intro-mappings/">Learn more about <code>AmbassadorMapping</code></a>
</Alert>

$productName$ will find `Mapping` resources without updating the `apiVersion`. However, making
sure that `AmbassadorListener`s, `Host`s, and `Mapping`s correctly associate with each other
will likely require changes. Therefore, for each existing `Mapping` resource that you want to
use with $productName$ 2.X:

- change the `apiVersion` to `x.getambassador.io/v3alpha1`;
- change `spec.host` to `spec.hostname` if possible (see below);
- add `metadata.labels` as needed to match the `mappingSelector` for the `AmbassadorHost`s with which
  the `AmbassadorMapping` should associate; and
- make sure `spec.hostname` matches up with the `AmbassadorHost`s with which the `AmbassadorMapping` should associate.

Where `spec.host` could be an exact match or (with `host_regex`) a regular expression, `spec.hostname` is always a DNS
glob. `spec.hostname` is **strongly** preferred, unless a regex is absolutely required: using globs is **much** more
performant. Therefore, we recommend using `spec.hostname` wherever possible:

- if `spec.host` is being used for an exact match, simply rename `spec.host` to `spec.hostname`.
- if `spec.host` is being used for a regex that effects a prefix or suffix match, rename it
  to `spec.hostname` and rewrite the regex into a DNS glob, e.g. `host: .*\.example\.com` would become
  `hostname: *.example.com`.

Additionally, when `spec.hostname` is used, the `AmbassadorMapping` will be associated with an `AmbassadorHost` only
if `spec.hostname` matches the hostname of the `AmbassadorHost`. If the `AmbassadorHost`'s `selector` is also set,
both the `selector` and the hostname must line up.

<Alert severity="warning">
  An <code>AmbassadorMapping</code> that specifies <code>host_regex: true</code> will be associated with <b>all</b> <code>AmbassadorHost</code>s. This is generally far less desirable than using <code>hostname</code> with a DNS glob.
</Alert>

## 2. Additional Notes

When migrating to $productName$ 2.X, there are several things to keep in mind:

### `AmbassadorListener` is mandatory

<Alert severity="info">
  <a href="../../running/ambassadorlistener">Learn more about <code>AmbassadorListener</code></a>
</Alert>

The new [`AmbassadorListener` resource](../../running/ambassadorlistener) (in `getambassador.io/v3alpha1`) defines the
specific ports on which $productName$ will listen, and which protocols and security model will be used per port. **The
`AmbassadorListener` resource is mandatory.**

Defining your own `AmbassadorListener`(s) allows you to carefully tailor the set of ports you actually need to use, and
exactly which `AmbassadorHost` resources are matched with them. This can permit a system with many `AmbassadorHosts` to
work considerably more efficiently than relying on the defaults.

### `AmbassadorListener` has explicit control to choose `AmbassadorHost`s

<Alert severity="info">
  <a href="../../running/ambassadorlistener">Learn more about <code>AmbassadorListener</code></a><br />
  <a href="../../running/host-crd">Learn more about <code>AmbassadorHost</code></a>
</Alert>

`AmbassadorListener.spec.hostBinding` controls whether a given `AmbassadorHost` will be associated with
that `AmbassadorListener`, as discussed in the [`AmbassadorListener`](../../running/ambassadorlistener) documentation.
As a migration aid, you can tell an `AmbassadorListener` to snap up all `AmbassadorHost`s with

```yaml
hostBinding:
  namespace:
    from: ALL
```

but **we recommend avoiding this practice in production**. Allowing every `AmbassadorHost` to associate with
every `AmbassadorListener` can result in confusing behavior with large numbers of `AmbassadorHost`s, and it
can also result in larger Envoy configurations that slow reconfiguration. Instead, we recommend using
`hostBinding.selector` to choose `AmbassadorHost`s more carefully.

#### `AmbassadorHost` and `AmbassadorMapping` will not automatically associate with each other

<Alert severity="info">
  <a href="../../running/host-crd">Learn more about <code>AmbassadorHost</code></a><br />
  <a href="../../using/intro-mappings">Learn more about <code>AmbassadorMapping</code></a>
</Alert>

In $productName$ 1.X, `Mapping`s were nearly always associated with every `Host`. Since this also tends to
result in larger Envoy configurations that slow down reconfiguration, $productName$ 2.X inverts this behavior:
**`AmbassadorHost` and `AmbassadorMapping` will not associate without explicit selection**.

To have an `AmbassadorMapping` associate with an `AmbassadorHost`, at least one of the following must hold:

- The `AmbassadorHost` must define a `mappingSelector` that matches a `label` on the `AmbassadorMapping`; or
- The `AmbassadorMapping` must define `hostname` that matches the `hostname` of the `AmbassadorHost`.
  (Note that the `hostname` of both `AmbassadorHost` and `AmbasssadorMapping` is a DNS glob.)

If the `AmbassadorHost` defines a `mappingSelector` and the `AmbassadorMapping` defines a `hostname`, both must match.

As a migration aid:

- An `AmbassadorMapping` with a `hostname` of `"*"` will associate with any `AmbassadorHost` that
has no `mappingSelector`, and
- A `v3alpha1` `AmbassadorMapping` will honor `host` if `hostname` is not present. 

<Alert severity="warning">
  An <code>AmbassadorMapping</code> that specifies <code>host_regex: true</code> will be associated with <b>all</b> <code>AmbassadorHost</code>s. This is generally far less desirable than using <code>hostname</code> with a DNS glob.
</Alert>

<Alert severity="warning">
  Support for <code>host</code> and <code>host_regex</code> will be removed before <code>v3alpha1</code> is promoted to <code>v3</code>.
</Alert>

### `AmbassadorHost` is required to terminate TLS.

<Alert severity="info">
  <a href="../../running/host-crd">Learn more about <code>AmbassadorHost</code></a><br />
  <a href="../../running/tls#tlscontext">Learn more about <code>TLSContext</code></a>
</Alert>

In $productName$ 1.X, simply creating a `TLSContext` is sufficient to terminate TLS, but in 2.X you _must_ have an
`AmbassadorHost`. The minimal setup to terminate TLS is now something like this:

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: kubernetes.io/tls
data:
  tls.crt: base64-PEM
  tls.key: base64-PEM
---
apiVersion: x.getambassador.io/v3alpha1
kind: AmbassadorHost
metadata:
  name: my-host
spec:
  hostname: host.example.com
  tlsSecret: my-secret
```

which will terminate TLS for `host.example.com`. A `TLSContext` is still right way to share data about TLS
configuration across `Host`s: set both `tlsSecret` and `tlsContext` in the `AmbassadorHost`.

