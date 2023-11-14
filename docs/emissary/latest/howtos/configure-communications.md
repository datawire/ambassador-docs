import Alert from '@material-ui/lab/Alert';

Configuring $productName$ Communications
========================================

For $productName$ to do its job of managing network communications for your services, it first needs to know how its own communications should be set up. This is handled by a combination of resources: the `Listener`, the `Host`, and the `TLSContext`.

- `Listener`: defines where, and how, $productName$ should listen for requests from the network.
- `Host`: defines which hostnames $productName$ should care about, and how to handle different kinds of requests for those hosts. `Host`s can be associated with one or more `Listener`s.
- `TLSContext`: defines whether, and how, $productName$ will manage TLS certificates and options. `TLSContext`s can be associated with one or more `Host`s.

Once the basic communications setup is in place, $productName$ `Mapping`s and `TCPMapping`s can be associated with `Host`s to actually do routing.

<Alert severity="warning">
  Remember that <code>Listener</code> and <code>Host</code> resources are&nbsp;
  <b>required</b>&nbsp;for a functioning $productName$ installation that can route traffic!<br/>
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a>.<br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>.
</Alert>

<Alert severity="warning">
  Remember than $productName$ does not make sure that a wildcard <code>Host</code> exists! If the
  wildcard behavior is needed, a <code>Host</code> with a <code>hostname</code> of <code>"*"</code>
  must be defined by the user.
</Alert>

<Alert severity="info">
  Several different resources work together to configure communications. A working knowledge of all of them
  can be very useful:<br/>
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a>.<br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>.<br/>
  <a href="../../topics/using/intro-mappings">Learn more about <code>Mapping</code></a>.<br/>
  <a href="../../topics/using/tcpmappings">Learn more about <code>TCPMapping</code></a>.<br/>
  <a href="../../topics/running/tls/#tlscontext">Learn more about <code>TLSContext</code></a>.
</Alert>

A Note on TLS
-------------

[TLS] can appear intractable if you haven't set up [certificates] correctly. If you're
having trouble with TLS, always [check the logs] of your $productName$ Pods and look for
certificate errors.

[TLS]: ../../topics/running/tls
[certificates]: ../../topics/running/tls#certificates-and-secrets
[check the logs]: ../../topics/running/debugging#review-logs

Examples / Cookbook
-------------------

### Basic HTTP and HTTPS

A useful configuration is to support either HTTP or HTTPS, in this case on either port 8080 or port 8443. This
tends to make it as easy as possible to communicate with the services behind the $productName$ instance. It uses
two `Listener`s and at least one `Host`.


#### `Listener`s:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: http-listener
spec:
  port: 8080
  protocol: HTTPS  # NOT A TYPO, see below
  securityModel: XFP
  hostBinding:
    namespace:
      from: SELF   # See below
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: https-listener
spec:
  port: 8443
  protocol: HTTPS
  securityModel: XFP
  hostBinding:
    namespace:
      from: SELF   # See below
```

- Both `Listener`s use `protocol: HTTPS` to allow Envoy to inspect incoming connections, determine
  whether or not TLS is in play, and set `X-Forwarded-Proto` appropriately. The `securityModel` then specifies
  that `X-Forwarded-Proto` will determine whether requests will be considered secure or insecure.

- The `hostBinding` shown here will allow any `Host` in the same namespace as the `Listener`s
  to be associated with both `Listener`s; in turn, that will allow access to that `Host`'s
  `Mapping`s from either port. For greater control, use a `selector` instead.

- Note that the `Listener`s do not specify anything about TLS certificates. The `Host`
  handles that; see below.

<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a>
</Alert>

#### `Host`

This example will assume that we expect to be reachable as `foo.example.com`, and that the `foo.example.com`
certificate is stored in the Kubernetes `Secret` named `foo-secret`:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
spec:
  hostname: "foo.example.com"
  tlsSecret:
    name: foo-secret
  requestPolicy:
    insecure:
      action: Redirect
```

- The `tlsSecret` specifies the certificate in use for TLS termination.
- The `requestPolicy` specifies routing HTTPS and redirecting HTTP to HTTPS.
- Since the `Host` does not specify a `selector`, only `Mapping`s with a `hostname` that matches
  `foo.example.com` will be associated with this `Host`.
- **Note well** that simply defining a `TLSContext` is not sufficient to terminate TLS: you must define either
  a `Host` or an `Ingress`.
- Note that if no `Host` is present, but a TLS secret named `fallback-secret` is available, the system will
  currently define a `Host` using `fallback-secret`. **This behavior is subject to change.**

<Alert severity="info">
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### HTTP-Only

Another straightforward configuration is to support only HTTP, in this case on port 8080. This uses a single
`Listener` and a single `Host`:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: http-listener
spec:
  port: 8080
  protocol: HTTP
  securityModel: INSECURE
  hostBinding:
    namespace:
      from: SELF   # See below
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
spec:
  hostname: "foo.example.com"
  requestPolicy:
    insecure:
      action: Route
```

- Here, we listen only on port 8080, and only for HTTP. HTTPS will be rejected.
- Since requests are only allowed using HTTP, we declare all requests `INSECURE` by definition.
- The `Host` specifies routing HTTP, rather than redirecting it.


<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### TLS using ACME ($AESproductName$ only)

This scenario uses ACME to get certificates for `foo.example.com` and `bar.example.com`. HTTPS traffic to either
host is routed; HTTP traffic to `foo.example.com` will be redirected to HTTPS, but HTTP traffic to `bar.example.com`
will be rejected outright.

Since this example uses ACME, **it is only supported in $AESproductName$**.

For demonstration purposes, we show this example listening for HTTPS on port 9999, using `X-Forwarded-Proto`.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: https-listener-9999
spec:
  port: 9999
  protocol: HTTPS
  securityModel: XFP
  hostBinding:     # Edit as needed
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
spec:
  hostname: foo.example.com
  acmeProvider:
    email: julian@example.com
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: bar-host
spec:
  hostname: bar.example.com
  acmeProvider:
    email: julian@example.com
  requestPolicy:
    insecure:
      action: Reject
```

(`Mapping`s are not shown.)

- Our `Listener`s will accept HTTPS and HTTP on port 9999, and the protocol used will dictate whether
  the requests are secure (HTTPS) or insecure (HTTP).
- `foo-host` defaults to ACME with Let's Encrypt, since `acmeProvider.authority` is not provided.
- `foo-host` defaults to redirecting insecure requests, since the default for `requestPolicy.insecure.action` is `Redirect`.
- `bar-host` uses Let's Encrypt as well, but it will reject insecure requests.

**If you use ACME for multiple Hosts, add a wildcard Host too.**
This is required to manage a known issue. This issue will be resolved in a future Ambassador Edge Stack release.

<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### Multiple TLS Certificates

This scenario uses TLS without ACME. Each of our two `Host`s uses a distinct TLS certificate. HTTPS
traffic to either`foo.example.com` or `bar.example.com` is routed, but this time `foo.example.com` will redirect
HTTP requests, while `bar.example.com` will route them.

Since this example does not use ACME, it is supported in $productName$ as well as $AESproductName$.

For demonstration purposes, we show this example listening for HTTPS on port 4848, using `X-Forwarded-Proto`.

```yaml
---
apiVersion: v1
kind: Secret
type: kubernetes.io/tls
metadata:
  name: foo-example-secret
data:
  tls.crt: -certificate PEM-
  tls.key: -secret key PEM-
---
apiVersion: v1
kind: Secret
type: kubernetes.io/tls
metadata:
  name: bar-example-secret
data:
  tls.crt: -certificate PEM-
  tls.key: -secret key PEM-
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: https-listener-4848
spec:
  port: 4848
  protocol: HTTPS
  securityModel: XFP
  hostBinding:     # Edit as needed
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
spec:
  hostname: foo.example.com
  tlsSecret:
    name: foo-example-secret
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: bar-host
spec:
  hostname: bar.example.com
  tlsSecret:
    name: bar-example-secret
  requestPolicy:
    insecure:
      action: Route
```

- `foo-host` and `bar-host` simply reference the `tlsSecret` to use for termination.
   - If the secret involved contains a wildcard cert, or a cert with multiple SAN, both `Host`s could
     reference the same `tlsSecret`.
- `foo-host` relies on the default insecure routing action of `Redirect`.
- `bar-host` must explicitly specify routing HTTP.


<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### Using a `TLSContext`

If you need to share other TLS settings between two `Host`s, you can reference a `TLSContext` as well as
the `tlsSecret`. This is the same as the previous example, but we use a `TLSContext` to set `ALPN` information,
and we assume that the `Secret` contains a wildcard cert.

```yaml
---
apiVersion: v1
kind: Secret
type: kubernetes.io/tls
metadata:
  name: wildcard-example-secret
data:
  tls.crt: -wildcard here-
  tls.key: -wildcard here-
---
apiVersion: getambassador.io/v3alpha1
kind: TLSContext
metadata:
  name: example-context
spec:
  secret: wildcard-example-secret
  alpn_protocols: [h2, istio]
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: https-listener-4848
spec:
  port: 4848
  protocol: HTTPS
  securityModel: XFP
  hostBinding:     # Edit as needed
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
spec:
  hostname: foo.example.com
  tlsContext:
    name: example-context
  tlsSecret:
    name: wildcard-example-secret
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: bar-host
spec:
  hostname: bar.example.com
  tlsContext:
    name: example-context
  tlsSecret:
    name: wildcard-example-secret
  requestPolicy:
    insecure:
      action: Route
```

- Note that specifying the `tlsSecret` is still necessary, even when `tlsContext` is specified.


<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### ACME With a TLSContext ($AESproductName$ Only)

In $AESproductName$, you can use a `TLSContext` with ACME as well. This example is the same as "TLS using ACME",
but we use a `TLSContext` to set `ALPN` information. Again, ACME is only supported in $AESproductName$.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: TLSContext
metadata:
  name: example-context
spec:
  secret: example-acme-secret
  alpn_protocols: [h2, istio]
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
spec:
  hostname: foo.example.com
  acmeProvider:
    email: julian@example.com
  tlsContext:
    name: example-context
  tlsSecret:
    name: example-acme-secret
```

- Note that we don't provide the `Secret`: the ACME client will create it for us.


<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### Using an L7 Load Balancer to Terminate TLS

In this scenario, a layer 7 load balancer ahead of $productName$ will terminate TLS, so $productName$ will always see HTTP with a known good `X-Forwarded-Protocol`. We'll use that to route HTTPS and redirect HTTP.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: lb-listener
spec:
  port: 8443
  protocol: HTTP
  securityModel: XFP
  l7Depth: 1
  hostBinding:     # This may well need editing for your case!
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
spec:
  hostname: "foo.example.com"
  requestPolicy:
    insecure:
      action: Redirect
```

- We set `l7Depth` to 1 to indicate that there's a single trusted L7 load balancer ahead of us.
- We specifically set this Listener to HTTP-only, but we stick with port 8443 just because we expect people setting up TLS at all to expect to use port 8443. (There's nothing special about the port number, pick whatever you like.)
- Our `Host` does not specify a `tlsSecret`, so $productName$ will not try to terminate TLS.
- Since the `Listener` still pays attention to `X-Forwarded-Proto`, both secure and insecure requests
  are possible, and we use the `Host` to route HTTPS and redirect HTTP.


<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### Using a Split L4 Load Balancer to Terminate TLS

Here, we assume that $productName$ is behind a load balancer setup that handles TLS at layer 4:

- Incoming cleartext traffic is forwarded to $productName$ on port 8080.
- Incoming TLS traffic is terminated at the load balancer, then forwarded to $productName$ _as cleartext_ on port 8443.
- This might involve multiple L4 load balancers, but the actual number doesn't matter.
- The actual port numbers we use don't matter either, as long as $productName$ and the load balancer(s) agree on which port is for which traffic.

We're going to route HTTPS for both `foo.example.com` and `bar.example.com`, redirect HTTP for `foo.example.com`, and reject HTTP for `bar.example.com`.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: split-lb-one-listener
spec:
  protocol: HTTP
  port: 8080
  securityModel: INSECURE
  hostBinding:     # This may well need editing for your case!
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: split-lb-two-listener
spec:
  protocol: HTTP
  port: 8443
  securityModel: SECURE
  hostBinding:     # This may well need editing for your case!
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
spec:
  hostname: foo.example.com
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: bar-host
spec:
  hostname: bar.example.com
  requestPolicy:
    insecure:
      action: Reject
```

- Since L4 load balancers cannot set `X-Forwarded-Protocol`, we don't use it at all here: instead, we dictate that 8080 and 8443 both speak cleartext HTTP, but everything arriving at port 8080 is insecure and everything at port 8443 is secure.


<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### Listening on Multiple Ports

There's no reason you need to use ports 8080 and 8443, or that you're limited to two ports. Here we'll use ports 9001 and 9002 for HTTP, and port 4001 for HTTPS. We'll route traffic irrespective of protocol.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: listener-9001
spec:
  protocol: HTTP
  port: 9001
  securityModel: XFP
  hostBinding:     # This may well need editing for your case!
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: listener-9002
spec:
  protocol: HTTP
  port: 9002
  securityModel: XFP
  hostBinding:     # This may well need editing for your case!
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: listener-4001
spec:
  protocol: HTTPS
  port: 4001
  securityModel: XFP
  hostBinding:     # This may well need editing for your case!
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: route-host
spec:
  requestPolicy:
    insecure:
      action: Route
```

- We can use `X-Forwarded-Proto` for all our `Listener`s: the HTTP-only `Listener`s will set it correctly.
- Each `Listener` can specify only one port, but there's no hardcoded limit on the number of `Listener`s you can have.


<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### Using Labels to Associate `Host`s and `Listener`s

In the examples above, the `Listener`s all associate with any `Host` in their namespace. In this
example, we will use Kubernetes labels to control the association instead.

Here, we'll listen for HTTP to `foo.example.com` on port 8888, and for either HTTP or HTTPS to `bar.example.com` on
port 9999 (where we'll redirect HTTP to HTTPS). Traffic to `baz.example.com` will work on both ports, and we'll route
HTTP for it rather than redirecting.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: listener-8888
spec:
  protocol: HTTP
  port: 8888
  securityModel: XFP
  hostBinding:
    selector:
      matchLabels:
        tenant: foo
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: listener-9999
spec:
  protocol: HTTPS
  port: 9999
  securityModel: XFP
  hostBinding:
    selector:
      matchLabels:
        tenant: bar
---
apiVersion: v1
kind: Secret
type: kubernetes.io/tls
metadata:
  name: bar-secret
data:
  tls.crt: -wildcard here-
  tls.key: -wildcard here-
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
  labels:
    tenant: foo
spec:
  hostname: foo.example.com
  requestPolicy:
    insecure:
      action: Route
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: bar-host
  labels:
    tenant: bar
spec:
  hostname: bar.example.com
  tlsSecret:
    name: bar-secret
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: baz-host
  labels:
    tenant: foo
    tenant: bar
spec:
  hostname: baz.example.com
  tlsSecret:
    name: bar-secret
  requestPolicy:
    insecure:
      action: Route
```

- Note the `labels` on each `Host`, which the `hostBinding` on the `Listener` can reference.
   - Note also that only label selectors are supported at the moment.


<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>

### Wildcard `Host`s and `Mapping`s

In a `Mapping`, the `host` is now treated as a glob rather than an exact match, with the goal of vastly reducing the need for `host_regex`. (The `hostname` in a `Host` has always been treated as a glob).

- **Note that only prefix and suffix matches are supported**, so `*.example.com` and `foo.*` are both fine, but `foo.*.com` will not work -- you'll need to use `host_regex` if you really need that. (This is an Envoy limitation.)

In this example, we'll accept both HTTP and HTTPS, but:

- Cleartext traffic to any host in `lowsec.example.com` will be routed.
- Cleartext traffic to any host in `normal.example.com` will be redirected.
- Any other cleartext traffic will be rejected.

```yaml
---
apiVersion: v1
kind: Secret
type: kubernetes.io/tls
metadata:
  name: example-secret
data:
  tls.crt: -wildcard for *.example.com here-
  tls.key: -wildcard for *.example.com here-
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: listener-8443
spec:
  port: 8443
  protocol: HTTPS
  securityModel: XFP
  hostBinding:     # This may well need editing for your case!
    namespace:
      from: SELF
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: lowsec-host
spec:
  hostname: "*.lowsec.example.com"
  tlsSecret:
    name: example-secret
  requestPolicy:
    insecure:
      action: Route
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: normal-host
spec:
  hostname: "*.normal.example.com"
  tlsSecret:
    name: example-secret
  requestPolicy:          # We could leave this out since
    insecure:             # redirecting is the default, but
      action: Redirect    # it's spelled out for clarity.
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: catchall-host
spec:
  hostname: "*.example.com"
  tlsSecret:
    name: example-secret
  requestPolicy:
    insecure:
      action: Reject
```

- We'll listen for HTTP or HTTPS on port 8443.
- The three `Host`s apply different insecure routing actions depending on the hostname.
- You could also do this with `host_regex`, but using `host` with globs will give better performance.
   - Being able to _not_ associate a given `Mapping` with a given `Host` when the `Mapping`'s
     `host` doesn't match helps a lot when you have many `Host`s.
   - Reliably determining if a regex (for the `Mapping`) matches a glob (for the `Host`) isn't really possible, so we can't prune `host_regex` `Mapping`s at all.

<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a><br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>
</Alert>
