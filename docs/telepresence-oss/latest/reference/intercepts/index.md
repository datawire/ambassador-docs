import Alert from '@material-ui/lab/Alert';

# Intercepts

When intercepting a service, the Telepresence Traffic Manager ensures
that a Traffic Agent has been injected into the intercepted workload.
The injection is triggered by a Kubernetes Mutating Webhook and will
only happen once. The Traffic Agent is responsible for redirecting
intercepted traffic to the developer's workstation.

### Global intercept
This intercept will intercept all`tcp` and/or `udp` traffic to the
intercepted service and send all of that traffic down to the developer's
workstation. This means that a global intercept will affect all users of
the intercepted service.

## Supported workloads

Kubernetes has various
[workloads](https://kubernetes.io/docs/concepts/workloads/).
Currently, Telepresence supports intercepting (installing a
traffic-agent on) `Deployments`, `ReplicaSets`, and `StatefulSets`.

<Alert severity="info">

While many of our examples use Deployments, they would also work on
ReplicaSets and StatefulSets

</Alert>
