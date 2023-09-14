import Alert from '@material-ui/lab/Alert';

# Introduction to the Mapping resource

$productName$ is designed around a [declarative, self-service management model](../../concepts/gitops-continuous-delivery). The core resource used to support application development teams who need to manage the edge with $productName$ is the `Mapping` resource.

<Alert severity="warning">
  Remember that <code>Listener</code> and <code>Host</code> resources are
  &nbsp;<b>required</b>&nbsp;for a functioning $productName$ installation that can route traffic!<br/>
  <a href="../../running/listener">Learn more about <code>Listener</code></a>.<br/>
  <a href="../../running/host-crd">Learn more about <code>Host</code></a>.
</Alert>

## Quick example

At its core a `Mapping` resource maps a `resource` to a `service`:

| Required attribute        | Description               |
| :------------------------ | :------------------------ |
| `name`                    | is a string identifying the `Mapping` (e.g. in diagnostics) |
| [`prefix`](#resources)    | is the URL prefix identifying your [resource](#resources) |
| [`service`](#services)    | is the name of the [service](#services) handling the resource; must include the namespace (e.g. `myservice.othernamespace`) if the service is in a different namespace than $productName$ |

These resources are defined as Kubernetes Custom Resource Definitions. Here's a simple example that maps all requests to `/httpbin/` to the `httpbin.org` web service:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  httpbin-mapping
spec:
  prefix: /httpbin/
  service: http://httpbin.org
```

## Applying a Mapping resource

A `Mapping` resource can be managed using the same workflow as any other Kubernetes resources (e.g., `service`, `deployment`). For example, if the above `Mapping` is saved into a file called `httpbin-mapping.yaml`, the following command will apply the configuration directly to $productName$:

```
kubectl apply -f httpbin-mapping.yaml
```

For production use, the general recommended best practice is to store the file in a version control system and apply the changes with a continuous deployment pipeline. For more detail, see [the Ambassador Operating Model](../../concepts/gitops-continuous-delivery).

## Extending Mappings

`Mapping` resources support a rich set of annotations to customize the specific routing behavior.  Here's an example service for implementing the CQRS pattern (using HTTP):

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
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  cqrs-put
spec:
  prefix: /cqrs/
  method: PUT
  service: putcqrs
```

More detail on each of the available annotations are discussed in subsequent sections.

## Resources

To $productName$, a `resource` is a group of one or more URLs that all share a common prefix in the URL path. For example:

```
https://ambassador.example.com/resource1/foo
https://ambassador.example.com/resource1/bar
https://ambassador.example.com/resource1/baz/zing
https://ambassador.example.com/resource1/baz/zung
```

all share the `/resource1/` path prefix, so it can be considered a single resource. On the other hand:

```
https://ambassador.example.com/resource1/foo
https://ambassador.example.com/resource2/bar
https://ambassador.example.com/resource3/baz/zing
https://ambassador.example.com/resource4/baz/zung
```

share only the prefix `/` -- you _could_ tell $productName$ to treat them as a single resource, but it's probably not terribly useful.

Note that the length of the prefix doesn't matter: if you want to use prefixes like `/v1/this/is/my/very/long/resource/name/`, go right ahead, $productName$ can handle it.

Also note that $productName$ does not actually require the prefix to start and end with `/` -- however, in practice, it's a good idea. Specifying a prefix of

```
/man
```

would match all of the following:

```
https://ambassador.example.com/man/foo
https://ambassador.example.com/mankind
https://ambassador.example.com/man-it-is/really-hot-today
https://ambassador.example.com/manohmanohman
```

which is probably not what was intended.

## Services

$productName$ routes traffic to a `service`. A `service` is defined as:

```
[scheme://]service[.namespace][:port]
```

Where everything except for the `service` is optional.

- `scheme` can be either `http` or `https`; if not present, the default is `http`.
- `service` is the name of a service (typically the service name in Kubernetes or Consul); it is not allowed to contain the `.` character.
- `namespace` is the namespace in which the service is running. Starting with $productName$ 1.0.0, if not supplied, it defaults to the namespace in which the Mapping resource is defined. The default behavior can be configured using the [`ambassador` Module](../../running/ambassador). When using a Consul resolver, `namespace` is not allowed.
- `port` is the port to which a request should be sent. If not specified, it defaults to `80` when the scheme is `http` or `443` when the scheme is `https`. Note that the [resolver](../../running/resolvers) may return a port in which case the `port` setting is ignored.

Note that while using `service.namespace.svc.cluster.local` may work for Kubernetes resolvers, the preferred syntax is `service.namespace`.

## Best practices for configuration

$productName$'s configuration is assembled from multiple YAML blocks which are managed by independent application teams. This implies:

- $productName$'s configuration should be under version control.

    While you can always read back the $productName$'s configuration from Kubernetes or its diagnostic service, the $productName$ will not do versioning for you.

- Be aware that the $productName$ tries to not start with a broken configuration, but it's not perfect.

    Gross errors will result in $productName$ refusing to start, in which case `kubectl logs` will be helpful. However, it's always possible to e.g. map a resource to the wrong service, or use the wrong `rewrite` rules. $productName$ can't detect that on its own, although its diagnostic pages can help you figure it out.

- Be careful of mapping collisions.

    If two different developers try to map `/user/` to something, this can lead to unexpected behavior. $productName$'s canary-deployment logic means that it's more likely that traffic will be split between them than that it will throw an error -- again, the diagnostic service can help you here.

**Note:** Unless specified, mapping attributes cannot be applied to any other resource type.
