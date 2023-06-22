import Alert from '@material-ui/lab/Alert';

# Intercepts

When intercepting a service, the Telepresence Traffic Manager ensures
that a Traffic Agent has been injected into the intercepted workload.
The injection is triggered by a Kubernetes Mutating Webhook and will
only happen once. The Traffic Agent is responsible for redirecting
intercepted traffic to the developer's workstation.

An intercept is either global or personal.

### Global intercet
This intercept will intercept all`tcp` and/or `udp` traffic to the
intercepted service and send all of that traffic down to the developer's
workstation. This means that a global intercept will affect all users of
the intercepted service.

### Personal intercept
This intercept will intercept specific HTTP requests, allowing other HTTP
requests through to the regular service. The selection is based on http
headers or paths, and allows for intercepts which only intercept traffic
tagged as belonging to a given developer.

There are two ways of configuring an intercept:
- one from the [CLI](./cli) directly
- one from an [Intercept Specification](./specs)

## Intercept behavior when using single-user versus team mode.

Switching the Traffic Manager from `single-user` mode to `team` mode changes
the Telepresence defaults in two ways.


First, in team mode, Telepresence will require that the user is logged in to
Ambassador Cloud, or is using an api-key. The team mode aldo causes Telepresence
to default to a personal intercept using `--http-header=auto --http-path-prefix=/`.
Personal intercepts are important for working in a shared cluster with teammates,
and is important for the preview URL functionality below.  See `telepresence intercept --help`
for  information on using the `--http-header` and `--http-path-xxx` flags to
customize which requests that are intercepted.

Secondly, team mode causes Telepresence to default to`--preview-url=true`. This
tells Telepresence to take advantage of Ambassador Cloud to create a preview URL
for this intercept, creating a shareable URL that automatically sets the
appropriate headers to have requests coming from the preview URL be
intercepted.

## Supported workloads

Kubernetes has various
[workloads](https://kubernetes.io/docs/concepts/workloads/).
Currently, Telepresence supports intercepting (installing a
traffic-agent on) `Deployments`, `ReplicaSets`, and `StatefulSets`.

<Alert severity="info">

While many of our examples use Deployments, they would also work on
ReplicaSets and StatefulSets

</Alert>
