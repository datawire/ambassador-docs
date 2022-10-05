import Alert from '@material-ui/lab/Alert';

# The **Host** CRD

The custom `Host` resource defines how $productName$ will be
visible to the outside world. It collects all the following information in a
single configuration resource:

* The hostname by which $productName$ will be reachable
* How $productName$ should handle TLS certificates
* How $productName$ should handle secure and insecure requests
* Which `Mappings` should be associated with this `Host`

<Alert severity="warning">
  Remember that <code>Listener</code> resources are&nbsp;<b>required</b>&nbsp;for a functioning
  $productName$ installation!<br/>
  <a href="../../running/listener">Learn more about <code>Listener</code></a>.
</Alert>

<Alert severity="warning">
  Remember than $productName$ does not make sure that a wildcard <code>Host</code> exists! If the
  wildcard behavior is needed, a <code>Host</code> with a <code>hostname</code> of <code>"*"</code>
  must be defined by the user.
</Alert>

A minimal `Host` resource, assuming no TLS configuration, would be:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: minimal-host
spec:
  hostname: host.example.com
```

This `Host` tells $productName$ to expect to be reached at `host.example.com`,
with no TLS termination, and only associating with `Mapping`s that also set a
`hostname` that matches `host.example.com`.

Remember that a <code>Listener</code> will also be required for this example to
be functional. Many examples of setting up `Host` and `Listener` are available
in the [Configuring $productName$ Communications](../../../howtos/configure-communications)
document.

## Setting the `hostname`

The `hostname` element tells $productName$ which hostnames to expect. `hostname` is a DNS glob,
so all of the following are valid:

- `host.example.com`
- `*.example.com`
- `host.example.*`

The following are _not_ valid:

- `host.*.com` -- Envoy supports only prefix and suffix globs
- `*host.example.com` -- the wildcard must be its own element in the DNS name

In all cases, the `hostname` is used to match the `:authority` header for HTTP routing.
When TLS termination is active, the `hostname` is also used for SNI matching.

## Controlling Association with `Mapping`s

A `Mapping` will not be associated with a `Host` unless at least one of the following is true:

- The `Mapping` specifies a `hostname` attribute that matches the `Host` in question.
- The `Host` specifies a `mappingSelector` that matches the `Mapping`'s Kubernetes `label`s.

> **Note:** The `mappingSelector` field is only configurable on `v3alpha1` CRDs. In the `v2` CRDs the equivalent field is `selector`.
either `selector` or `mappingSelector` may be configured in the `v3alpha1` CRDs, but `selector` has been deprecated in favour of `mappingSelector`.

If neither of the above is true, the `Mapping` will not be associated with the `Host` in
question. This is intended to help manage memory consumption with large numbers of `Host`s and large
numbers of `Mapping`s.

If the `Host` specifies `mappingSelector` _and_ the `Mapping` specifies `hostname`, both must match
for the association to happen.

The `mappingSelector` is a Kubernetes [label selector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#labelselector-v1-meta). For a `Mapping` to be associated with a `Host` that uses `mappingSelector`, then **all** labels
required by the `mappingSelector` must be present on the `Mapping` in order for it to be associated with the `Host`.
A `Mapping` may have additional labels other than those required by the `mappingSelector` so long as the required labels are present.

**in 2.0, only `matchLabels` is supported**, for example:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: minimal-host
spec:
  hostname: host.example.com
  mappingSelector:
    matchLabels:
      examplehost: host
```

The above `Host` will associate with these `Mapping`s:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  mapping-with-label-match
  labels:
    examplehost: host          # This matches the Host's mappingSelector.
spec:
  prefix: /httpbin/
  service: http://httpbin.org
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  mapping-with-hostname-match
spec:
  hostname: host.example.com   # This is an exact match of the Host's hostname.
  prefix: /httpbin/
  service: http://httpbin.org
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  mapping-with-hostname-glob-match
spec:
  hostname: "*.example.com"    # This glob matches the Host's hostname too.
  prefix: /httpbin/
  service: http://httpbin.org
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  mapping-with-both-matches
  labels:
    examplehost: host          # This matches the Host's mappingSelector.
spec:
  hostname: "*.example.com"    # This glob matches the Host's hostname.
  prefix: /httpbin/
  service: http://httpbin.org
```

It will _not_ associate with any of these:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  skip-mapping-wrong-label
  labels:
    examplehost: staging       # This doesn't match the Host's mappingSelector.
spec:
  prefix: /httpbin/
  service: http://httpbin.org
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  skip-mapping-wrong-hostname
spec:
  hosname: "bad.example.com"  # This doesn't match the Host's hostname.
  prefix: /httpbin/
  service: http://httpbin.org
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  skip-mapping-still-wrong
  labels:
    examplehost: staging       # This doesn't match the Host's mappingSelector,
spec:                          # and if the Host specifies mappingSelector AND the
  hostname: host.example.com   # Mapping specifies hostname, BOTH must match. So
  prefix: /httpbin/            # the matching hostname isn't good enough.
  service: http://httpbin.org
```

Future versions of $productName$ will support `matchExpressions` as well.

> **Note:** In $productName$ version `3.2`, a bug with how `Hosts` are associated with `Mappings` was fixed. The `mappingSelector` field in `Hosts` was not
properly being enforced in prior versions. If any single label from the selector was matched then the `Host` would be associated with the `Mapping` instead
of requiring all labels in the selector to be present. Additonally, if the `hostname` of the `Mapping` matched the `hostname` of the `Host` then they would be associated
regardless of the configuration of `mappingSelector`.
In version `3.2` this bug was fixed and a `Host` will only be associated with a `Mapping` if **all** labels required by the selector are present.
This brings the `mappingSelector` field in-line with how label selectors are used throughout Kubernetes. To avoid unexpected behavior after the upgrade,
add all labels that `Hosts` have in their `mappingSelector` to `Mappings` you want to associate with the `Host`. You can opt-out of this fix and return to the old
`Mapping`/`Host` association behavior by setting the environment variable `DISABLE_STRICT_LABEL_SELECTORS` to `"true"` (default: `"false"`). A future version of
$productName$ may remove the ability to opt-out of this bugfix.

## Secure and insecure requests

A **secure** request arrives via HTTPS; an **insecure** request does not. By default, secure requests will be routed and insecure requests will be redirected (using an HTTP 301 response) to HTTPS. The behavior of insecure requests can be overridden using the `requestPolicy` element of a `Host`:

```yaml
requestPolicy:
  insecure:
    action: insecure-action
    additionalPort: insecure-port
```

The `insecure-action` can be one of:

* `Redirect` (the default): redirect to HTTPS
* `Route`: go ahead and route as normal; this will allow handling HTTP requests normally
* `Reject`: reject the request with a 400 response

```yaml
requestPolicy:
  insecure:
    additionalPort: -1   # This is how to disable the default redirection from 8080.
```

Some special cases to be aware of here:

* **Case matters in the actions:** you must use e.g. `Reject`, not `reject`.
* The `X-Forwarded-Proto` header is honored when determining whether a request is secure or insecure. For more information, see "Load Balancers, the `Host` Resource, and `X-Forwarded-Proto`" below.
* ACME challenges with prefix `/.well-known/acme-challenge/` are always forced to be considered insecure, since they are not supposed to arrive over HTTPS.
* $AESproductName$ provides native handling of ACME challenges. If you are using this support, $AESproductName$ will automatically arrange for insecure ACME challenges to be handled correctly. If you are handling ACME yourself - as you must when running $OSSproductName$ - you will need to supply appropriate `Host` resources and Mappings to correctly direct ACME challenges to your ACME challenge handler.

## TLS settings

The `Host` is responsible for high-level TLS configuration in $productName$. There are
several settings covering TLS:

### `tlsSecret` enables TLS termination

`tlsSecret` specifies a Kubernetes `Secret` is **required** for any TLS termination to occur. No matter what other TLS
configuration is present, TLS termination will not occur if `tlsSecret` is not specified.

The following `Host` will configure $productName$ to read a `Secret` named
`tls-cert` for a certificate to use when terminating TLS.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  acmeProvider:
    authority: none
  tlsSecret:
    name: tls-cert
```

### `tlsContext` links to a `TLSContext` for additional configuration

`tlsContext` specifies a [`TLSContext`](#) to use for additional TLS information. Note that you **must** still
define `tlsSecret` for TLS termination to happen. It is an error to supply both `tlsContext` and `tls`.

See the [TLS discussion](../tls) for more details.

### `tls` allows manually providing additional configuration

`tls` allows specifying most of the things a `TLSContext` can, inline in the `Host`. Note that you **must** still
define `tlsSecret` for TLS termination to happen. It is an error to supply both `tlsContext` and `tls`.

See the [TLS discussion](../tls) for more details.

## Load balancers, the `Host` resource, and `X-Forwarded-Proto`

In a typical installation, $productName$ runs behind a load balancer. The
configuration of the load balancer can affect how $productName$ sees requests
arriving from the outside world, which can in turn can affect whether $productName$
considers the request secure or insecure. As such:

- **We recommend layer 4 load balancers** unless your workload includes
  long-lived connections with multiple requests arriving over the same
  connection. For example, a workload with many requests carried over a small
  number of long-lived gRPC connections.
- **$productName$ fully supports TLS termination at the load balancer** with a single exception, listed below.
- If you are using a layer 7 load balancer, **it is critical that the system be configured correctly**:
  - The load balancer must correctly handle `X-Forwarded-For` and `X-Forwarded-Proto`.
  - The `l7Depth` element in the [`Listener` CRD](../../running/listener) must be set to the number of layer 7 load balancers the request passes through to reach $productName$ (in the typical case, where the client speaks to the load balancer, which then speaks to $productName$, you would set `l7Depth` to 1). If `l7Depth` remains at its default of 0, the system might route correctly, but upstream services will see the load balancer's IP address instead of the actual client's IP address.

It's important to realize that Envoy manages the `X-Forwarded-Proto` header such that it **always** reflects the most trustworthy information Envoy has about whether the request arrived encrypted or unencrypted. If no `X-Forwarded-Proto` is received from downstream, **or if it is considered untrustworthy**, Envoy will supply an `X-Forwarded-Proto` that reflects the protocol used for the connection to Envoy itself. The `l7Depth` element is also used when determining trust for `X-Forwarded-For`, and it is therefore important to set it correctly. Its default of 0 should always be correct when $productName$ is behind only layer 4 load balancers; it should need to be changed **only** when layer 7 load balancers are involved.

### CRD specification

The `Host` CRD is formally described by its protobuf specification. Developers who need access to the specification can find it [here](https://github.com/emissary-ingress/emissary/blob/v2.1.0/api/getambassador.io/v2/Host.proto).
