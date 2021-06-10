# Transform a Deployment to a Rollout

Argo Rollouts needs a Rollout resource to know what strategy to apply when rolling out a new version (canary or blue-green).
When you are migrating a Deployment to a Rollout to change your deployment strategy, you can reference an existing Deployment
since <a href="https://github.com/argoproj/argo-rollouts/releases/tag/v1.0.0" target="_blank">Argo Rollouts v1.0.0</a>.
When doing this operation, you should proceed as follows:

1. Create a Rollout resource.
1. Reference an existing Deployment using the `workloadRef` field.
1. Apply the new Rollout resource in your cluster.
1. Scale-down the existing Deployment by changing the `replicas` field to zero.
1. To perform future updates of your pod specs, the change should be made to the Pod template field of the Deployment.

Here is an example of a new Rollout manifest:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-rollout
spec:
  replicas: 5
  workloadRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-deployment
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: {duration: 10s}
```

And the changes that should be brought to the existing Deployment:

```diff
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
- replicas: 5
+ replicas: 0
```
