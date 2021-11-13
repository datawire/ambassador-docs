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

## Convert Configuration Resources to `getambassador.io/v3alpha1`

Once your $productName$ $version$ installation is running, it is **strongly recommended** that
you convert your existing configuration resources from `getambassador.io/v2` to
`getambassador.io/v3alpha1`.

<Alert severity="info">
  There is no need to convert all your resources to <code>getambassador.io/v3alpha1</code>
  immediately; it will be fine if you do this lazily. However, some functionality of
  $productName$ $version$ is not available without using <code>getambassador.io/v3alpha1</code>
  resources.
</Alert>

In general, the best way to convert any resource is to start with `kubectl get`: using
`kubectl get -o yaml` on any `getambassador.io/v2` resource will cause $productName$ to
translate it to a `getambassador.io/v3alpha1` resource. You can then verify that the 
`getambassador.io/v3alpha1` resource looks correct and re-apply it, which will convert the
stored copy to `getambassador.io/v3alpha1`.

As you do the conversion, here are the things to bear in mind:

### `ambassador_id` must be an array, not a simple string.

`getambassador.io/v2` allowed `ambassador_id` to be either an array of strings, or a simple
string. In `getambassador.io/v3alpha1`, only the array form is supported: instead of
`ambassador_id: "foo"`, use `ambassador_id: [ "foo" ]`. This applies to all $productName$
resources, and is supported by all versions of Ambassador 1.X.

### You must have a `Listener` for each port on which $productName$ should listen.

<Alert severity="info">
  <a href="../../running/listener">Learn more about <code>Listener</code></a>
</Alert>

`Listener` is **mandatory**. Defining your own `Listener`(s) allows you to carefully
tailor the set of ports you actually need to use, and exactly which `Host` resources
are matched with them (see below).

### `Listener`, `Host`, and `Mapping` must be explicit about how they associate.

Making sure that `Listener`s, `Host`s, and `Mapping`s correctly associate with each other
is an important part of $productName$ 2.X configuration:

#### `Listener` and `Host` are associated through `Listener.hostBinding`

<Alert severity="info">
  <a href="../../running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../running/host-crd">Learn more about <code>Host</code></a>
</Alert>

In a `Listener`, the `hostBinding` controls whether a given `Host` will be associated
ith that `Listener`, as discussed in the [`Listener`](../../running/listener) documentation.
**We recommend using `hostBinding.selector`** to choose only `Host`s that have a defined
Kubernetes label:

```yaml
hostBinding:
  selector:
    matchLabels:
      my-listener: listener-8080
```

causes only `Host`s with the `my-listener: listener-8080` label.

As a migration aid, you can tell a `Listener` to snap up all `Host`s with

```yaml
hostBinding:
  namespace:
    from: ALL
```

but **we recommend avoiding this practice in production**. Allowing every `Host` to associate
with every `Listener` can result in confusing behavior with large numbers of `Host`s, and it
can also result in larger Envoy configurations that slow reconfiguration.

#### `Host` and `Mapping` are associated through `Host.mappingSelector`

<Alert severity="info">
  <a href="../../running/host-crd">Learn more about <code>Host</code></a><br />
  <a href="../../using/intro-mappings">Learn more about <code>Mapping</code></a>
</Alert>

In $productName$ 1.X, `Mapping`s were nearly always associated with every `Host`. Since this
tends to result in larger Envoy configurations that slow down reconfiguration, $productName$ 2.X
inverts this behavior: **`Host` and `Mapping` will not associate without explicit selection**.

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
  A <code>Mapping</code> that specifies <code>host_regex: true</code> will be associated with
  <b>all</b> <code>Host</code>s. This is generally far less desirable than using <code>hostname</code>
  with a DNS glob.
</Alert>

<Alert severity="warning">
  Support for <code>host</code> and <code>host_regex</code> will be removed before
  <code>v3alpha1</code> is promoted to <code>v3</code>.
</Alert>

### Use `Host` to terminate TLS

<Alert severity="info">
  <a href="../../running/host-crd">Learn more about <code>Host</code></a><br />
  <a href="../../running/tls#tlscontext">Learn more about <code>TLSContext</code></a>
</Alert>

In $productName$ 1.X, simply creating a `TLSContext` is sufficient to terminate TLS, but in
2.X you _must_ use a `Host`. The minimal setup to terminate TLS is now something like this:

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

which will terminate TLS for `host.example.com`. A `TLSContext` is still right way to share data
about TLS configuration across `Host`s: set both `tlsSecret` and `tlsContext` in the `Host`.

### `Mapping` should use `hostname` if possible

<Alert severity="info">
  <a href="../../using/intro-mappings/">Learn more about <code>Mapping</code></a>
</Alert>

The `getambassador.io/v3alpha1` `Mapping` introduces the new `hostname` element, which is always
a DNS glob. Using `hostname` instead of `host` is **strongly recommended** unless you absolutely
require regular expression matching:

- if `host` is being used for an exact match, simply rename `host` to `hostname`.
- if `host` is being used for a regex that effects a prefix or suffix match, rename it
  to `hostname` and rewrite the regex into a DNS glob, e.g. `host: .*\.example\.com` would become
  `hostname: *.example.com`.

Additionally, when `hostname` is used, the `Mapping` will be associated with a `Host` only
if `hostname` matches the hostname of the `Host`. If the `Host`'s `selector` is also set,
both the `selector` and the hostname must line up.

<Alert severity="warning">
  An <code>Mapping</code> that specifies <code>host_regex: true</code> will be associated with
  <b>all</b> <code>Host</code>s. This is generally far less desirable than using
  <code>hostname</code> with a DNS glob.
</Alert>

### `Mapping` added headers must not be simple strings

<Alert severity="info">
  <a href="../../using/intro-mappings/">Learn more about <code>Mapping</code></a>
</Alert>

The `getambassador.io/v2` `Mapping` supported strings and dictionaries for `add_request_headers` and
`add_response_headers`, for example:

    ```yaml
    add_request_headers:
      X-Add-String: bar
      X-Add-Dict: 
        value: bar
    ```

In `getambassador.io/v2`, both `X-Add-String` and `X-Add-Dict` will be added with the value `bar`.

The string form - shown with `X-Add-String` - is not supported in `getambassador.io/v3alpha1`. Use the
dictionary form instead (which works in both `getambassador.io/v2` and `getambassador.io/v3alpha1`).

### `tls` cannot be `true` in `AuthService`, `Mapping`, `RateLimitService`, and `TCPMapping`

<Alert severity="info">
  <a href="../../using/authservice/">Learn more about <code>AuthService</code></a><br/>
  <a href="../../using/intro-mappings/">Learn more about <code>Mapping</code></a><br/>
  <a href="../../using/rate-limits/">Learn more about <code>RateLimitService</code></a><br/>
  <a href="../../using/tcpmappings/">Learn more about <code>TCPMapping</code></a>
</Alert>

The `tls` element in `AuthService`, `Mapping`, `RateLimitService`, and `TCPMapping` controls TLS 
origination. In `getambassador.io/v2`, it may be a string naming a `TLSContext` to use to determine
which client certificate is sent, or the boolean value `true` to request TLS origination with no
cluent certificate being sent. 

In `getambassador.io/v3alpha1`, only the string form is supported. To originate TLS with no client
certificate (the semantic of `tls: true`), omit the `tls` element and prefix the `service` with 
`https://`. Note that `TCPMapping` in `getambassador.io/v2` does not support the `https://prefix`.

### `Mapping` `headers` and `query_parameters` must not be `true`

<Alert severity="info">
  <a href="../../using/intro-mappings/">Learn more about <code>Mapping</code></a>
</Alert>

`headers` and `query_parameters` in a `Mapping` control header matches and query-parameter matches. In
`getambassador.io/v2`, they support both strings and dictionaries, and each has a `_regex` variant.
For example:

   ```yaml
   headers:
     x-exact-match: foo
     x-existence-match: true
   headers_regex:
     x-regex-match: "fo.*o"
   ```

In this example, the `Mapping` will require the `x-exact-match` header to have the value `foo`, the 
`x-regex-match` whose value starts with `fo` and ends with `o`. However, `x-existence-match` requires
simply that the `x-existence-match` header exists.

In `getambassador.io/v3alpha1`, the `true` value for an existence match is not supported. Instead, 
use `headers_regex` for the same header with value of `.*`. This is fully supported in 1.k)

`query_parameters` and `query_parameters_regex` work exactly like `headers`  and `headers_reex`.

## `Mapping` `labels` must be converted to new syntax

<Alert severity="info">
  <a href="../../using/intro-mappings/">Learn more about <code>Mapping</code></a>
</Alert>

In `getambassador.io/v2`, the `labels` element in a `Mapping` supported several different types of
data. In `getambassador.io/v3alpha1`, all labels must have the same type, so labels must be converted
to the new syntax:

| `getambassador.io/v2`            | `getambassador.io/v3alpha1`                                 |
|----------------------------------|-------------------------------------------------------------|
| `source_cluster`                 | `{ source_cluster: { key: source_cluster } }`               |                          
| `destination_cluster`            | `{ destination_cluster: { key: destination_cluster }` }     |
| `remote_address`                 | `{ remote_address: { key: remote_address } }`               |
| `{ my_key: { header: my_hdr } }` | `{ generic_key: { value: my_val } }`                        |
| `{ my_val }`                     | `{ generic_key: { value: my_val } }`                        |
| `{ my_key: { header: my_hdr } }` | `{ request_headers: { key: my_key, header_name: my_hdr } }` |

You can check the [Rate Limiting Labels documentation](../../using/rate-limits#attaching-labels-to-requests)
for more examples.

## Some `Module` settings have moved or changed

<Alert severity="info">
  <a href="../../running/listener">Learn more about <code>Listener</code></a>
</Alert>

A few settings have moved from the `Module` in 2.0. Make sure you review the following settings
and move them to their new locations if you are using them in a `Module`.

Configuration for the `PROXY` protocol is part of the `Listener` resource in $productName$ 2.0,
so the `use_proxy_protocol` element of the Ambassador `Module` is no longer supported.

`xff_num_trusted_hops` has been removed from the `Module`, and its functionality has been moved
to the `l7Depth` setting in the `Listener` resource.

It is no longer possible to configure TLS using the `tls` element of the `module`. Its
functionality is fully covered by the `TLSContext` resource. 
