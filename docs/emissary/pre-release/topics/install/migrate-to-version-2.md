import Alert from '@material-ui/lab/Alert';

# $productName$ 2.X Migration Guide

<Alert severity="info">
  This guide covers migrating from $productName$ 1.X to $productName$ 2.X. To upgrade within major versions, see the&nbsp;
  <a href="../upgrading">Upgrading $productName$ Guide</a>.
</Alert>

## Migration Overview

We're pleased to introduce $productName$ $version$! The 2.X family introduces a number of
changes to allow $productName$ to more gracefully handle larger installations (including
multitenant or multiorganizational installations), reduce memory footprint, and improve
performance. In keeping with [SemVer](https://semver.org), $productName$ 2.X introduces
some changes that aren't backward-compatible with 1.X. These changes are detailed in
[Major Changes in $productName$ 2.0.0](../../../about/changes-2.0.0).

Although $productName$ 2.X can support the `getambassador.io/v2` configuration resources
used by $productName$ 1.X, taking full advantage of $productName$ 2.X capabilities
**requires** updating your configuration to use `getambassador.io/v3alpha1` configuration
resources. Since there are differences between `getambassador.io/v2` and
`getambassador.io/v3alpha1`, some edits will be required to change configuration versions.

<Alert severity="warning">
  $productName$ 2.X does not support <code>getambassador.io/v0</code>
  or <code>getambassador.io/v1</code> resources. Convert these resources to 
  <code>getambassador.io/v2</code> before beginning migration.
</Alert>

Given the need to make configuration changes, there are a few ways to migrate:

### RECOMMENDED: Run $productName$ $version$ alongside $productName$ 1.14.3

This is our recommended migration path. It will preserve the functionality of your existing
$productName$ 1.X installation until the new $productName$ 2.X installation is verified
to work, and it does not require changing any resources to `getambassador.io/v3alpha1`
until after the $productName$ 1.X installation is shut down.

- First, if you're not already running $productName$ 1.14.3, **upgrade to 1.14.3**.
   <Alert severity="warning">
     <b>Upgrading to 1.14.3 is very important.</b> $productName$ versions prior to 1.14.3
     don't correctly restrict which CRD versions they request, and $productName$ 2.X allows
     Kubernetes to convert older CRD versions into <code>getambassador.io/v3alpha1</code>
     resources. This means that, if you install $productName$ 2.X into the same cluster as
     a version prior to 1.14.3, the older version will suddenly start seeing
     <code>getambassador.io/v3alpha1</code> resources, which it won't understand.
   </Alert>

- Next, install $productName$ $version$ alongside 1.14.3. This is most easily done with
  [Helm](../helm) and its canary option.

    ```bash
    example goes here
    ```

   <Alert severity="warning">
     Do not use the <code>ambassador</code> Helm chart to install $productName$ 2.X:
     you must use the <code>emissary</code> Helm chart instead.
   </Alert>

- At this point, $productName$ 1.14.3 and $productName$ 2.0 are running simultaneously, 
  reading the same `getambassador.io/v2` configuration resources.
   - Internally, $productName$ $version$ is translating the `getambassador.io/v2` resources
     to `getambassador.io/v3alpha1` resources with the same function.

- **Create `Listener`s for $productName$ $version$.**
   - When $productName$ $version$ starts, it will not have any `Listener`s, and it will not
     create any. You must create `Listener` resources by hand, or $productName$ $version$
     will not listen on any ports.

- Test. Each $productName$ instance has its own Kubernetes Service, so you can test the new
  instance without disrupting traffic to the existing instance.

- If you need to make changes, **make them to the existing `getambassador.io/v2` CRDs**. 
  Changing a given resource to `getambassador.io/v3alpha1` will cause $productName$ 1.14.3
  to stop being able to see it.
     <Alert severity="warning">
      <b>Do not use <code>kubectl edit</code> to fix resources.</b> This will have the
      effect of converting the resource to <code>getambassador.io/v3alpha1</code>, and
      $productName$ 1.14.3 will no longer see it.
    </Alert>

- Once everything is working with both versions, consider splitting traffic between the
  two installations for a final check. This is easily accomplished using [Helm](../helm)
  and its canary option.

- Shut down $productName$ 1.14.3.

- Go ahead and convert your `getambassador.io/v2` resources to `getambassador.io/v3alpha1`
  resources. The simplest way to do this is simply `kubectl get -o yaml | kubectl apply -f -`
  for each resource.
   - This can happen lazily, over whatever time span is desired. New resources should
     be created as `getambassador.io/v3alpha1` CRDs.

### Run $productName$ $version$ in a separate cluster

This is somewhat safer than running the two versions in the same cluster. However, in many
cases, the extra effort will mean it is not a cost-effective tradeoff.

- Install $productName$ $version$ in a completely new cluster.

- **Create `Listener`s for $productName$ $version$.**
   - When $productName$ $version$ starts, it will not have any `Listener`s, and it will not
     create any. You must create `Listener` resources by hand, or $productName$ $version$
     will not listen on any ports.

- Copy the entire configuration from the $productName$ 1.X cluster to the $productName$
  $version$ cluster. This is most simply done with `kubectl get -o yaml | kubectl apply -f -`.
   - This will create `getambassador.io/v2` resources in the $productName$ $version$ cluster.
     $productName$ $version$ will translate them internally to `getambassador.io/v3alpha1`
     resources.

- Test. Each $productName$ instance has its own cluster, so you can test the new
  instance without disrupting traffic to the existing instance.

- If you need to make changes, you can change the `getambassador.io/v2` resource, or go ahead
  and convert the resource you're changing to `getambassador.io/v3alpha1` by using
  `kubectl edit`.

- Once everything is working with both versions, transfer incoming traffic to the $productName$
  $version$ cluster.

- Go ahead and convert your `getambassador.io/v2` resources to `getambassador.io/v3alpha1`
  resources. The simplest way to do this is simply `kubectl get -o yaml | kubectl apply -f -`
  for each resource.
   - This can happen lazily, over whatever time desired. New resources should be created as
     `getambassador.io/v3alpha1` CRDs.

### Apply new CRDs and update the running image.

<Alert severity="warning">
  <b>THIS IS NOT RECOMMENDED FOR PRODUCTION CLUSTERS.</b> It is extremely risky, but may
  be the simplest strategy for test cluster.
</Alert>

For a test cluster **only**, it is possible to simply upgrade a running cluster in flight.

- Scale your running $productName$ installation to zero replicas:

    ```bash
    kubectl scale deploy $productDeploymentName$ -n $productNamespace$ --replicas=0
    ```

  This will prevent errors between the time that the CRDs are upgraded and the time that
  $productName$ $version$ comes up.

- Apply the new CRDs:

    ```bash
    kubectl apply -f https://app.getambassador.io/yaml/emissary/$version$/emissary-crds.yaml
    ```

- Update the image:

    ```bash
    kubectl set image deployment/$productDeploymentName$ -n $productNamespace$ $productContainerName$=$productFullDockerImage$:$version$
    ```

- Scale your running $productName$ installation back up to the desired number of replicas, for
  example:
  
    ```bash
    kubectl scale deploy $productDeploymentName$ -n $productNamespace$ --replicas=3
    ```

  This will scale up to three replicas.

- Test. If you need to make changes, **make them to the existing `getambassador.io/v2` CRDs**. 
  Changing a given resource to `getambassador.io/v3alpha1` will make it much harder to roll
  back.
     <Alert severity="warning">
      <b>Do not use <code>kubectl edit</code> to fix resources.</b> This will have the
      effect of converting the resource to <code>getambassador.io/v3alpha1</code>, which
      will make it harder to roll back if needed.
    </Alert>

- Go ahead and convert your `getambassador.io/v2` resources to `getambassador.io/v3alpha1`
  resources. The simplest way to do this is simply `kubectl get -o yaml | kubectl apply -f -`
  for each resource.
   - This can happen lazily, over whatever time span is desired. New resources should be created
     as `getambassador.io/v3alpha1` CRDs.

- If you need to roll back, switch the image back to its original value, then re-apply the
  original CRDs.

----

# Don't Review Below Here Yet.

### Install $productName$ 2.0 in a new cluster.

$productName$ introduces the new `getambassador.io/v3alpha1` API version for its CRDs. Kubernetes has a limitation that prevents two coppies of the same CRD from being installed in the same cluster with different API versions. For this reason, we are recommending setting up 2.0 in its own new cluster and then migrating the config to the new cluster in order to not cause any downtime. 

By far the easiest way to install is with Helm:

```sh
# Add the Repo:
helm repo add datawire https://app.getambassador.io
helm repo update

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

### Define a `Listener` for each port on which your installation should listen.

<Alert severity="info">
  <a href="../../running/listener">Learn more about <code>Listener</code></a>
</Alert>

`Listener` is **mandatory**. It's worth thinking about the `hostBinding`s to use for
each `Listener`, too, though you can start migrating with

```yaml
hostBinding:
  namespace:
    from: ALL
```

### Update `Host` resources to `v3alpha1`.

<Alert severity="info">
  <a href="../../running/host-crd">Learn more about <code>Host</code></a>
</Alert>

$productName$ will find `Host` resources without updating the `apiVersion`. However, making
sure that `Listener`s, `Host`s, and `Mapping`s correctly associate with each other
will likely require changes. Therefore, for each existing `Host` resource that you want to
use with $productName$ 2.X:

- change the `apiVersion` to `getambassador.io/v3alpha1`;
- add `metadata.labels` as needed to match the `hostBinding` for the `Listener`s with which
  the `Host` should associate; and
- set `spec.mappingSelector`, if desired, to control which `Mappings` will be associated 
  with this `Host`.

### Update `Mapping` resources to `v3alpha1`.

<Alert severity="info">
  <a href="../../using/intro-mappings/">Learn more about <code>Mapping</code></a>
</Alert>

$productName$ will find `Mapping` resources without updating the `apiVersion`. However, making
sure that `Listener`s, `Host`s, and `Mapping`s correctly associate with each other
will likely require changes. Therefore, for each existing `Mapping` resource that you want to
use with $productName$ 2.X:

- change the `apiVersion` to `getambassador.io/v3alpha1`;
- change `spec.host` to `spec.hostname` if possible (see below);
- add `metadata.labels` as needed to match the `mappingSelector` for the `Host`s with which
  the `Mapping` should associate; and
- make sure `spec.hostname` matches up with the `Host`s with which the `Mapping` should associate.

Where `spec.host` could be an exact match or (with `host_regex`) a regular expression, `spec.hostname` is always a DNS
glob. `spec.hostname` is **strongly** preferred, unless a regex is absolutely required: using globs is **much** more
performant. Therefore, we recommend using `spec.hostname` wherever possible:

- if `spec.host` is being used for an exact match, simply rename `spec.host` to `spec.hostname`.
- if `spec.host` is being used for a regex that effects a prefix or suffix match, rename it
  to `spec.hostname` and rewrite the regex into a DNS glob, e.g. `host: .*\.example\.com` would become
  `hostname: *.example.com`.

Additionally, when `spec.hostname` is used, the `Mapping` will be associated with a `Host` only
if `spec.hostname` matches the hostname of the `Host`. If the `Host`'s `selector` is also set,
both the `selector` and the hostname must line up.

<Alert severity="warning">
  An <code>Mapping</code> that specifies <code>host_regex: true</code> will be associated with <b>all</b> <code>Host</code>s. This is generally far less desirable than using <code>hostname</code> with a DNS glob.
</Alert>

There have been a few syntax and usage changes to the following fields in order to support Kubernetes 1.22 [Structural CRDs](https://kubernetes.io/blog/2019/06/20/crd-structural-schema/)
- Ensure that `Mapping.tls` is a string
- `Mapping.labels` always requires maps instead of strings. You can check the [Rate Limiting Labels docs](../../using/rate-limits#attaching-labels-to-requests) for examples of the new structure. 


## Check `Module` for changed values

A few settings have moved from the `Module` in 2.0. Make sure you review the following settings and move them to their new locations if you are using them in a `Module`.

Configuration for the `PROXY` protocol is part of the `Listener` resource in $productName$ 2.0, so the `use_proxy_protocol` element of the Ambassador `Module` is no longer supported.

`xff_num_trusted_hops` has been removed from the `Module`, and its functionality has been moved to the `l7Depth` setting in the `Listener` resource.

It is no longer possible to configure TLS using the `tls` element of the `module`. Its functionality is fully covered by the `TLSContext` resource. 

## 2. Additional Notes

When migrating to $productName$ 2.X, there are several things to keep in mind:

### `Listener` is mandatory

<Alert severity="info">
  <a href="../../running/listener">Learn more about <code>Listener</code></a>
</Alert>

The new [`Listener` resource](../../running/listener) (in `getambassador.io/v3alpha1`) defines the
specific ports on which $productName$ will listen, and which protocols and security model will be used per port. **The
`Listener` resource is mandatory.**

Defining your own `Listener`(s) allows you to carefully tailor the set of ports you actually need to use, and
exactly which `Host` resources are matched with them. This can permit a system with many `Hosts` to
work considerably more efficiently than relying on the defaults.

### `Listener` has explicit control to choose `Host`s

<Alert severity="info">
  <a href="../../running/listener">Learn more about <code>Listener</code></a><br />
  <a href="../../running/host-crd">Learn more about <code>Host</code></a>
</Alert>

`Listener.spec.hostBinding` controls whether a given `Host` will be associated with
that `Listener`, as discussed in the [`Listener`](../../running/listener) documentation.
As a migration aid, you can tell a `Listener` to snap up all `Host`s with

```yaml
hostBinding:
  namespace:
    from: ALL
```

but **we recommend avoiding this practice in production**. Allowing every `Host` to associate with
every `Listener` can result in confusing behavior with large numbers of `Host`s, and it
can also result in larger Envoy configurations that slow reconfiguration. Instead, we recommend using
`hostBinding.selector` to choose `Host`s more carefully.

#### `Host` and `Mapping` will not automatically associate with each other

<Alert severity="info">
  <a href="../../running/host-crd">Learn more about <code>Host</code></a><br />
  <a href="../../using/intro-mappings">Learn more about <code>Mapping</code></a>
</Alert>

In $productName$ 1.X, `Mapping`s were nearly always associated with every `Host`. Since this also tends to
result in larger Envoy configurations that slow down reconfiguration, $productName$ 2.X inverts this behavior:
**`Host` and `Mapping` will not associate without explicit selection**.

To have a `Mapping` associate with a `Host`, at least one of the following must hold:

- The `Host` must define a `mappingSelector` that matches a `label` on the `Mapping`; or
- The `Mapping` must define `hostname` that matches the `hostname` of the `Host`.
  (Note that the `hostname` of both `Host` and `AmbasssadorMapping` is a DNS glob.)

If the `Host` defines a `mappingSelector` and the `Mapping` defines a `hostname`, both must match.

As a migration aid:

- A `Mapping` with a `hostname` of `"*"` will associate with any `Host` that
has no `mappingSelector`, and
- A `v3alpha1` `Mapping` will honor `host` if `hostname` is not present. 

<Alert severity="warning">
  An <code>Mapping</code> that specifies <code>host_regex: true</code> will be associated with <b>all</b> <code>Host</code>s. This is generally far less desirable than using <code>hostname</code> with a DNS glob.
</Alert>

<Alert severity="warning">
  Support for <code>host</code> and <code>host_regex</code> will be removed before <code>v3alpha1</code> is promoted to <code>v3</code>.
</Alert>

### `Host` is required to terminate TLS.

<Alert severity="info">
  <a href="../../running/host-crd">Learn more about <code>Host</code></a><br />
  <a href="../../running/tls#tlscontext">Learn more about <code>TLSContext</code></a>
</Alert>

In $productName$ 1.X, simply creating a `TLSContext` is sufficient to terminate TLS, but in 2.X you _must_ have an
`Host`. The minimal setup to terminate TLS is now something like this:

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
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: my-host
spec:
  hostname: host.example.com
  tlsSecret: my-secret
```

which will terminate TLS for `host.example.com`. A `TLSContext` is still right way to share data about TLS
configuration across `Host`s: set both `tlsSecret` and `tlsContext` in the `Host`.

