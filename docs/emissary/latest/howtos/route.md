---
description: "$productName$ uses the Mapping resource to map a resource, like a URL prefix, to a Kubernetes service or web service."
---

import Alert from '@material-ui/lab/Alert';

# Get traffic from the edge

<div class="docs-article-toc">
<h3>Contents</h3>

* [Examples](#examples)
* [Applying a Mapping Resource](#applying-a-mapping-resource)
* [Resources](#resources)
* [Services](#services)
* [Extending Mappings](#extending-mappings)
* [Best Practices](#best-practices)
* [What's next?](#img-classos-logo-srcimageslogopng-whats-next)

</div>

The core $productName$ resource used to manage cluster ingress is the `Mapping` resource.

**A `Mapping` resource routes a URL path (or prefix) to a service (either a Kubernetes service or other web service).**

<Alert severity="warning">
  Remember that <code>Listener</code> and <code>Host</code> resources are&nbsp;
  <b>required</b>&nbsp;for a functioning $productName$ installation that can route traffic!<br/>
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a>.<br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>.
</Alert>

## Examples

This `Mapping` would route requests to `https://<hostname>/webapp/` to the `webapp-svc` Service. **This is not a
complete example on its own; see below.**

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  webapp-mapping
spec:
  prefix: /webapp/
  service: webapp-svc
```

| Name | Type | Description |
| :--- | :--- | :--- |
| `metadata.name` | String | Identifies the Mapping. |
| `spec.prefix` | String | The URL prefix identifying your resource. [See below](#resources) on how $productName$ handles resources. |
| `spec.service` | String | The service handling the resource.  If a Kubernetes service, it must include the namespace (in the format `service.namespace`) if the service is in a different namespace than $productName$. [See below](#services) on service name formatting.|

Here's another example using a web service that maps requests to `/httpbin/` to `http://httpbin.org` (again, **this is not a
complete example on its own; see below**):

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  httpbin-mapping
spec:
  prefix: /httpbin/
  service: http://httpbin.org
  hostname: '*'
```

### Complete example configuration

For demonstration purposes, here's a possible way of combining a `Listener`, a `Host`, and both `Mapping`s above that is complete and functional:

- it will accept HTTP or HTTPS on port 8443;
- $productName$ is terminating TLS;
- HTTPS to `foo.example.com` will be routed as above;
- HTTP to `foo.example.com` will be redirected to HTTPS;
- HTTP or HTTPS to other hostnames will be rejected; and
- the associations between the `Listener`, the `Host`, and the `Mappings` use Kubernetes `label`s.

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
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: listener-8443
spec:
  port: 8443
  protocol: HTTPS
  securityModel: XFP
  hostBinding:
    selector:
      matchLabels:
        exampleName: basic-https
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: foo-host
  labels:
    exampleName: basic-https
spec:
  hostname: "foo.example.com"
  tlsSecret:
    name: foo-example-secret
  selector:
    matchLabels:
      exampleName: basic-https
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  webapp-mapping
  labels:
    exampleName: basic-https
spec:
  prefix: /webapp/
  service: webapp-svc
  hostname: 'foo.example.com'
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  httpbin-mapping
  labels:
    exampleName: basic-https
spec:
  prefix: /httpbin/
  service: http://httpbin.org
  hostname: 'foo.example.com'

```

Note the addition of `label`s and `selector`s to explicitly specify which resources should associate in this example.

<Alert severity="info">
  <a href="../../topics/running/listener">Learn more about <code>Listener</code></a>.<br/>
  <a href="../../topics/running/host-crd">Learn more about <code>Host</code></a>.
</Alert>

## Applying a Mapping resource

A Mapping resource can be managed using the same workflow as any other Kubernetes resources (like a Service or Deployment). For example, if the above Mapping is saved into a file called `httpbin-mapping.yaml`, the following command will apply the configuration directly to $productName$:

```
kubectl apply -f httpbin-mapping.yaml
```

<Alert severity="info">For production use, best practice is to store the file in a version control system and apply the changes with a continuous deployment pipeline. <a href="../../topics/concepts/gitops-continuous-delivery">The Ambassador Operating Model</a> provides more detail.</Alert>

## Resources

To $productName$, a resource is a group of one or more URLs that all share a common prefix in the URL path. For example, these URLs all share the `/resource1/` path prefix, so `/resource1/` can be considered a single resource:

* `https://ambassador.example.com/resource1/foo`
* `https://ambassador.example.com/resource1/bar`
* `https://ambassador.example.com/resource1/baz/zing`

On the other hand, these URLs share only the prefix `/` -- you _could_ tell $productName$ to treat them as a single resource, but it's probably not terribly useful.

* `https://ambassador.example.com/resource1/foo`
* `https://ambassador.example.com/resource2/bar`
* `https://ambassador.example.com/resource3/baz/zing`

Note that the length of the prefix doesn't matter; a prefix like `/v1/this/is/my/very/long/resource/name/` is valid.

Also note that $productName$ does not actually require the prefix to start and end with `/` -- however, in practice, it's a good idea. Specifying a prefix of `/man` would match all of the following, which probably is not what was intended:

* `https://ambassador.example.com/man/foo`
* `https://ambassador.example.com/mankind`
* `https://ambassador.example.com/man-it-is/really-hot-today`

## Services

$productName$ routes traffic to a service. A service is defined as `[scheme://]service[.namespace][:port]`.  Everything except for the service is optional.

- `scheme` can be either `http` or `https`; if not present, the default is `http`.
- `service` is the name of a service (typically the service name in Kubernetes or Consul); it is not allowed to contain the `.` character.
- `namespace` is the namespace in which the service is running. Starting with $productName$ 1.0.0, if not supplied, it defaults to the namespace in which the Mapping resource is defined. The default behavior can be configured using the [Module resource](../../topics/running/ambassador). When using a Consul resolver, `namespace` is not allowed.
- `port` is the port to which a request should be sent. If not specified, it defaults to `80` when the scheme is `http` or `443` when the scheme is `https`. Note that the [resolver](../../topics/running/resolvers) may return a port in which case the `port` setting is ignored.

<Alert severity="info">While using <code>service.namespace.svc.cluster.local</code> may work for Kubernetes resolvers, the preferred syntax is <code>service.namespace</code>.</Alert>


## Extending Mappings

Mapping resources support a rich set of annotations to customize the specific routing behavior.  Here's an example service for implementing the [CQRS pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs) (using HTTP):

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  cqrs-get
spec:
  prefix: /cqrs/
  method: GET
  service: getcqrs
  hostname: '*'
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  cqrs-put
spec:
  prefix: /cqrs/
  method: PUT
  service: putcqrs
  hostname: '*'
```

## Best Practices

$productName$'s configuration is assembled from multiple YAML blocks which are managed by independent application teams. This implies that certain best practices should be followed.

#### $productName$'s configuration should be under version control.

While you can always read back the $productName$'s configuration from Kubernetes or its diagnostic service, the $productName$ will not do versioning for you.

#### $productName$ tries to not start with a broken configuration, but it's not perfect.

Gross errors will result in the $productName$ refusing to start, in which case `kubectl logs` will be helpful. However, it's always possible to map a resource to the wrong service, or use the wrong `rewrite` rules. $productName$ can't detect that on its own, although its [diagnostic service](../../topics/running/diagnostics/) can help you figure it out.

#### Be careful of mapping collisions.

If two different developers try to map `/myservice/` to something, this can lead to unexpected behavior. $productName$'s [canary deployment](../../topics/using/canary/) logic means that it's more likely that traffic will be split between them than that it will throw an error -- again, the diagnostic service can help you here.

#### Unless specified, mapping attributes cannot be applied to any other resource type.

## <img class="os-logo" src="/images/logo.png"/> What's next?

There are many options for [advanced mapping configurations](../../topics/using/mappings), with features like [automatic retries](../../topics/using/retries/), [timeouts](../../topics/using/timeouts/), [rate limiting](../../topics/using/rate-limits/), [redirects](../../topics/using/redirects/), and more.
