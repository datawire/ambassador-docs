import Alert from '@material-ui/lab/Alert';

# Convert Configuration to `getambassador.io/v3alpha1`

Once your $productName$ $version$ installation is running, it is **strongly recommended** that
you convert your existing configuration resources from `getambassador.io/v2` to
`getambassador.io/v3alpha1`.

<Alert severity="info">
  While it is not necessary to convert all your resources to <code>getambassador.io/v3alpha1</code>
  immediately, you should ultimately update them all for full functionality with $productName$
</Alert>

In general, the best way to convert any resource is to start with `kubectl get`: using
`kubectl get -o yaml` on any `getambassador.io/v2` resource will cause $productName$ to
translate it to a `getambassador.io/v3alpha1` resource. You can then verify that the
`getambassador.io/v3alpha1` resource looks correct and re-apply it, which will convert the
stored copy to `getambassador.io/v3alpha1`.

As you do the conversion, here are the things to bear in mind:

## 1. `ambassador_id` must be an array, not a simple string.

`getambassador.io/v2` allowed `ambassador_id` to be either an array of strings, or a simple
string. In `getambassador.io/v3alpha1`, only the array form is supported: instead of
`ambassador_id: "foo"`, use `ambassador_id: [ "foo" ]`. This applies to all $productName$
resources, and is supported by all versions of Ambassador 1.X.

## 2. You must have a `Listener` for each port on which $productName$ should listen.

<Alert severity="info">
  <a href="../../running/listener">Learn more about <code>Listener</code></a>
</Alert>

`Listener` is **mandatory**. Defining your own `Listener`(s) allows you to carefully
tailor the set of ports you actually need to use, and exactly which `Host` resources
are matched with them (see below).

## 3. `Listener`, `Host`, and `Mapping` must be explicit about how they associate.

You need to have `Listener`s, `Host`s, and `Mapping`s correctly associated with each other for $productName$ 2.X configuration.

### 3.1. `Listener` and `Host` are associated through `Listener.hostBinding`

<Alert severity="info">
  <a href="../../running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../running/host-crd">Learn more about <code>Host</code></a>
</Alert>

In a `Listener`, the `hostBinding` controls whether a given `Host` is associated with that `Listener`, as discussed in the [`Listener`](../../running/listener) documentation.
**The recommended setting is using `hostBinding.selector`** to choose only `Host`s that have a defined
Kubernetes label:

```yaml
hostBinding:
  selector:
    matchLabels:
      my-listener: listener-8080
```

The above example shows a `Listener` configured to associate only with `Host`s that have a `my-listener: listener-8080` label.

For migration purposes, it is possible to have a `Listener` associate with all of the `Host`s. This is not recommended for production environments, however, as it can resulting confusing behavior with large numbers of `Host`s, and it
can also result in larger Envoy configurations that slow reconfiguration.

```yaml
hostBinding:
  namespace:
    from: ALL
```

but **this is not recommended in production**. Allowing every `Host` to associate
with every `Listener` can result in confusing behavior with large numbers of `Host`s, and it
can also result in larger Envoy configurations that slow reconfiguration.

### 3.2. `Host` and `Mapping` are associated through `Host.mappingSelector`


In $productName$ 1.X, `Mapping`s were nearly always associated with every `Host`. Since this
tends to result in larger Envoy configurations that slow down reconfiguration, $productName$ 2.X
inverts this behavior: **`Host` and `Mapping` will not associate without explicit selection**.

To have a `Mapping` associate with a `Host`, at least one of the following must hold:

- Recommended: The `Host` must define a `mappingSelector` that matches a `label` on the `Mapping`.
- Alternately, the `Mapping` must define `hostname` that matches the `hostname` of the `Host`.
  (Note that the `hostname` of both `Host` and `AmbasssadorMapping` is a DNS glob.)

If the `Host` defines a `mappingSelector` and the `Mapping` also defines a `hostname`, both must match.

As a migration aid:

- A `Mapping` with a `hostname` of `"*"` will associate with any `Host` that
has no `mappingSelector`, and
- A `v3alpha1` `Mapping` will honor `host` if `hostname` is not present.

<Alert severity="info">
  <a href="../../running/host-crd">Learn more about <code>Host</code></a><br />
  <a href="../../using/intro-mappings">Learn more about <code>Mapping</code></a>
</Alert>

<Alert severity="warning">
  A <code>Mapping</code> that specifies <code>host_regex: true</code> is associated with&nbsp;
  <b>all</b> <code>Host</code>s. This is generally far less desirable than using <code>hostname</code>
  with a DNS glob.
</Alert>

<Alert severity="warning">
  Support for <code>host</code> and <code>host_regex</code> will be removed before
  <code>v3alpha1</code> is promoted to <code>v3</code>.
</Alert>

## 4. Use `Host` to terminate TLS

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

In the example above, TLS is terminated for `host.example.com`. A `TLSContext` is still right way to share data
about TLS configuration across `Host`s: set both `tlsSecret` and `tlsContext` in the `Host`.

## 5. `Mapping` should use `hostname` if possible

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
  An <code>Mapping</code> that specifies <code>host_regex: true</code> will be associated with&nbsp;
  <b>all</b> <code>Host</code>s. This is generally far less desirable than using
  <code>hostname</code> with a DNS glob.
</Alert>

## 6. `Mapping` added headers must not be simple strings

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

## 7. `Mapping` `headers` and `query_parameters` must not be `true`

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

In this example, the `Mapping` requires the `x-exact-match` header to have the value `foo`, the
`x-regex-match` whose value starts with `fo` and ends with `o`. However, `x-existence-match` requires
simply that the `x-existence-match` header exists.

In `getambassador.io/v3alpha1`, the `true` value for an existence match is not supported. Instead,
use `headers_regex` for the same header with value of `.*`. This is fully supported in 1.k)

`query_parameters` and `query_parameters_regex` work exactly like `headers`  and `headers_reex`.

## 8. `Mapping` `labels` must be converted to new syntax

<Alert severity="info">
  <a href="../../using/intro-mappings/">Learn more about <code>Mapping</code></a>
</Alert>

In `getambassador.io/v2`, the `labels` element in a `Mapping` supported several different types of
data. In `getambassador.io/v3alpha1`, all labels must have the same type, so labels must be converted
to the new syntax:

| `getambassador.io/v2`            | `getambassador.io/v3alpha1`                                 |
| -------------------------------- | ----------------------------------------------------------- |
| `source_cluster`                 | `{ source_cluster: { key: source_cluster } }`               |
| `destination_cluster`            | `{ destination_cluster: { key: destination_cluster }` }     |
| `remote_address`                 | `{ remote_address: { key: remote_address } }`               |
| `{ my_key: { header: my_hdr } }` | `{ generic_key: { value: my_val } }`                        |
| `{ my_val }`                     | `{ generic_key: { value: my_val } }`                        |
| `{ my_key: { header: my_hdr } }` | `{ request_headers: { key: my_key, header_name: my_hdr } }` |

You can check the [Rate Limiting Labels documentation](../../using/rate-limits#attaching-labels-to-requests)
for more examples.

## 9. `tls` cannot be `true` in `AuthService`, `Mapping`, `RateLimitService`, and `TCPMapping`

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

## 10. Some `Module` settings have moved or changed

<Alert severity="info">
  <a href="../../running/listener">Learn more about <code>Listener</code></a>
</Alert>

A few settings have moved from the `Module` in 2.0. Make sure you review the following settings
and move them to their new locations if you are using them in a `Module`:

- Configuration for the `PROXY` protocol is part of the `Listener` resource in $productName$ 2.0,
so the `use_proxy_protocol` element of the `ambassador` `Module` is no longer supported.

- `xff_num_trusted_hops` has been removed from the `Module`, and its functionality has been moved
to the `l7Depth` setting in the `Listener` resource.

- It is no longer possible to configure TLS using the `tls` element of the `Module`. Its
functionality is fully covered by the `TLSContext` resource.
