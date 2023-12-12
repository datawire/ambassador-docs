---
    description: Rollouts in Ambassador Labs' Argo
---

import Alert from '@material-ui/lab/Alert';

# Ambassador Cloud Rollouts

Ambassador Cloud allows you to progressively rollout new versions of your services listed in the Service Catalog.

This feature leverages [Argo CD](../../concepts/argo/) to automatically monitor changes to a Git repository
and apply them to your Kubernetes cluster, following a [GitOps](../../concepts/gitops/) approach. At this
point, [Argo Rollouts](../../concepts/argo/) comes in to control how traffic coming from Edge Stack gets
sent to the new version of your service.

## Flow

Upon creation of a rollout, Ambassador Cloud will prompt for a few questions:
- **Image tag**: new docker image version to rollout.
- **Rollout duration**: amount of time on which to spread the rollout steps between 0% and 100% traffic sent to the canary version.
- **Weight increment**: increment to the percentage of traffic routed to the canary version, distributed over the rollout duration.
- **Number of pods**: number of replicas (pods) your application should be running at the end of the rollout duration.

Once this information has been provided, Ambassador Cloud will look for Kubernetes manifests at the [path](#a8riorolloutsscmpath) of
the [repository](#a8riorepository) and update them as follows:

If no `Rollout` object is found matching the [deployment manifest name](#a8riorolloutsdeployment) (which should only
happen the first time a rollout is created), then Ambassador Cloud will look for a `Deployment` object matching that same name.
If found, a new `Rollout` manifest will be created referring to that deployment object and configured with the
[mappings](#a8riorolloutsmappings). A new [canary](/docs/argo/latest/concepts/canary/) service based on the current service specs
will also be created to allow Argo Rollouts to control the flow between the two versions.

The rollout steps will then be resolved based on the provided rollout duration and weight increment along with the
new number of pods. Ambassador Cloud will also search for a container (either in the `Rollout` or `Deployment` manifest) that
has an `image` property matching the configured [image name](#a8riorolloutsimage-reponame) and update it with the
provided new image tag.

Ambassador Cloud will then update those manifests on a new branch, open a pull request targeting the
[base branch](#a8riorolloutsscmbranch) and show you that new rollout in the service rollouts page. You'll see a
"Merge pull request" button that will take you to the pull request where you can approve and merge it.

Once the pull request is merged, Argo CD will detect that a new version of the `Application` has been pushed on the
repository and will sync the new manifests in the Kubernetes cluster. Once applied, Argo Rollouts will proceed to the
progressive delivery of the `Rollout` object and its progress will be reported in Ambassador Cloud.

## Helm support

Ambassador Cloud supports the detection of Helm charts at the [path](#a8riorolloutsscmpath) of
the [repository](#a8riorepository) by checking if a `Chart.yaml` file is present. In this case, the update is
as follows:

1. A new Helm values file named following the convention **a8r-values-<ENVIRONMENT_name>.yaml** (for example, **a8r-values-staging.yaml**)
is generated with the values for the rollout configuration. These values will later be used to configure the
`Rollout` manifest.
2. If you already have a `Rollout` object matching the [deployment manifest name](#a8riorolloutsdeployment) in the **templates** folder,
you should configure it to use the values from the Ambassador values file. You can follow this example:
   ```yaml
   apiVersion: argoproj.io/v1alpha1
   kind: Rollout
   metadata:
     name: {{ include "mychart.fullname" . }}
     labels:
       {{- include "mychart.labels" . | nindent 4 }}
     {{- with .Values.ambassador.rollouts.annotations }}
     annotations:
       {{- toYaml . | nindent 4}}
     {{- end}}
   spec:
       replicas: {{ .Values.ambassador.rollouts.replicas }}
       revisionHistoryLimit: 5
       strategy:
         canary:
           canaryService: {{ include "mychart.fullname" . }}-canary
           stableService: {{ include "mychart.fullname" . }}-stable
           {{- with .Values.ambassador.rollouts.trafficMappings }}
           trafficRouting:
             ambassador:
               mappings:
               {{- toYaml . | nindent 10 }}
           {{- end}}
           {{- with .Values.ambassador.rollouts.steps }}
           steps:
           {{- toYaml . | nindent 8}}
           {{- end}}
       template:
         spec:
           containers:
             - name: {{ .Chart.Name }}
               securityContext:
                 {{- toYaml .Values.securityContext | nindent 12 }}
               image: "{{ .Values.ambassador.rollouts.image.repository }}:{{ .Values.ambassador.rollouts.image.tag | default .Chart.AppVersion }}"
               imagePullPolicy: {{ .Values.imagePullPolicy }}
               resources:
                 {{- toYaml .Values.resources | nindent 12 }}
           # ...
           # The rest of the file is omitted for simplicity.
   ```

3. If there is no `Rollout` object that matches the [deployment manifest name](#a8riorolloutsdeployment) in the **templates** folder,
use the example above to create one. More information about the `Rollout`. This should only occur the first time a rollout is created.
For more information about `Rollout` spec see [the official Argo Rollouts documentation](https://argoproj.github.io/argo-rollouts/features/specification/).
4. Create a `Service` object for the canary pods by duplicating the existing service and appending `-canary` to its name.
5. Create a `Mapping` object pointing to the "stable" `Service`.
6. Ambassador Cloud updates the manifests on a new branch. Then opens a pull request to target the
[base branch](#a8riorolloutsscmbranch). The new rollout appears in the service's rollouts page, with a "Merge pull request" button.
Click on this button to open the pull request page, where you can approve and merge it.
7. Before you merge the pull request, disable the Argo Application's auto-sync feature in case you have it enabled. You will
re-enable it back in step 9. Once the pull request is merged, Argo CD will detect that a new version of the `Application` has
been pushed on the repository.
8. Now you will have to configure your Argo Application to use the Ambassador Helm values file
**after** your own. This configuration is found in the `Parameters` section of your Application.
<Alert severity="warning">
    By default, Argo CD fetches data from your repository every 3 minutes. If you still don't see the Ambassador
    Helm values file and don't want to wait any longer, you can run a "Refresh" or "Hard Refresh" of the
    application to allow Argo CD to see the new <i>values</i> file generated by Ambassador Cloud.
</Alert>
9. Finally, it's time to re-enable the Application's auto-sync or refresh your application. Argo CD will detect that the `Application`
is out of sync and will update the manifests in the cluster to match the ones in the repository. Argo Rollouts will proceed to the
progressive delivery of the `Rollout` object and its progress is reported in Ambassador Cloud.

## Configuration

The following annotations are leveraged to make the Rollouts flow possible.

### Source Control Management

#### `a8r.io/repository`

The repository on which to bring changes.

#### `a8r.io/rollouts.scm.url`

The URL of the repository in which the manifests or the Helm Chart is. If this annotation is not present, it will default to the `a8r.io/repository`.

#### `a8r.io/rollouts.scm.path`

The path in which the Kubernetes manifests should be found.

#### `a8r.io/rollouts.scm.branch`

The branch to target when pull requests are opened by Ambassador Cloud to rollout a new version.

### Container Image Repository

#### `a8r.io/rollouts.image-repo.type`

The image repository type. Accepted values are `dockerhub` or `gitlab`.

#### `a8r.io/rollouts.image-repo.name`

The name of the image repository. This is used by Ambassador Cloud to identify which container to update in the Kubernetes manifests to update with the new image version. Per example, if the container to update's specs contain: `image: datawire/demo-image:1.2.3`, the value for the annotation should be `datawire/demo-image`.

<Alert severity="warning">
  If <strong>a8r.io/rollouts.image-repo.type</strong> is set to <strong>gitlab</strong>, <strong>a8r.io/rollouts.image-repo.name</strong> must be the <strong>Repository ID</strong> of the GitLab Container Registry you are trying to use.<br/>
  For example, given the URL <strong>https://gitlab.com/datawire/rollouts</strong>, the <strong>Repository ID</strong> will be <strong>datawire/rollouts</strong>.
</Alert>

### Manifests

#### `a8r.io/rollouts.deployment`

Name of the Kubernetes `Deployment` or `Rollout` object to update for rollouts.

#### `a8r.io/rollouts.mappings`

Coma separated list of Mapping objects that should control rollout traffic.
