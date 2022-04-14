import Alert from '@material-ui/lab/Alert';
import {getBaseUIUrl} from '../../../../../src/utils/getBaseUrl';
import InstallArgoTabs from './InstallArgoTabs';

# Configure Canary Rollout in your Cluster


In this guide we'll give you everything you need to perform a canary rollout in your own cluster using GitOps best practices, but without needing to write lots of YAML!

  <Alert severity="info">
    Although you won't be writing lots of YAML, all of the Argo CD and Rollouts configuration you will generate from the cloud user interface will be visible in the GitHub pull request that is automatically created. You can inspect this YAML before merging the pull request to start the GitOps flow that will rollout your updated service.
  </Alert>

<div class="docs-article-toc">
<h3>Contents</h3>

- [Configure Canary Rollout in your Cluster](#configure-canary-rollout-in-your-cluster)
  - [Prerequisites](#prerequisites)
  - [1. Connect your cluster to Ambassador Cloud](#1-connect-your-cluster-to-ambassador-cloud)
  - [2. Fork the rollouts-demo git repository](#2-fork-the-rollouts-demo-git-repository)
  - [3. Install Argo CD & Argo Rollouts](#3-install-argo-cd--argo-rollouts)
  - [4. Get a manifests folder in your repository](#4-get-a-manifests-folder-in-your-repository)
  - [5. Apply the manifests in your cluster](#5-apply-the-manifests-in-your-cluster)
  - [6. Configure your repository and container registry](#6-configure-your-repository-and-container-registry)
    - [6.1 GitHub](#61-github)
    - [6.2 DockerHub](#62-dockerhub)
    - [6.3 GitLab](#63-gitlab)
  - [7. Configure Argo CD](#7-configure-argo-cd)
  - [8. Create a Rollout](#8-create-a-rollout)
  - [9. Review & merge](#9-review--merge)
  - [10. Watch the Rollout progress from Ambassador Cloud](#10-watch-the-rollout-progress-from-ambassador-cloud)
  - [What's next?](#whats-next)

</div>

## Prerequisites

If you want to get started with canary rollouts on your own environment, you will need to have **Edge Stack version 2.0.4 or greater** or **Emissary-ingress 2.0.4 or greater** installed in your cluster.

**Install** Edge Stack <a href="/docs/edge-stack/latest/tutorials/getting-started/">from here</a> if needed.

If you already have Edge Stack or Emissary-ingress installed, **check your version** by running this command (adjust your namespace if necessary):

```shell
kubectl get deploy --namespace ambassador edge-stack -o jsonpath='{.spec.template.spec.containers[0].image}'
```
[Upgrade Edge Stack to the latest version](/docs/edge-stack/latest/topics/install/upgrading/) if needed.

## 1. Connect your cluster to Ambassador Cloud

1. Log in to [Ambassador Cloud](https://app.getambassador.io/cloud/) with your preferred identity provider.

2. At the top, click **Add Services** then click **Connection Instructions** in the Edge Stack installation section.

3. Follow the prompts to name the cluster and click **Generate a Cloud Token**.

4. Follow the prompts to install the cloud token into your cluster.

5. When the token installation completes, refresh the Service Catalog page.

<Alert severity="success"><b>Victory!</b> All the Services running in your cluster are now listed in Service Catalog! When you complete the next steps of this guide, it will provide visibility into the current rollout status of each service.</Alert>

## 2. Fork the rollouts-demo git repository

A demo [repository](https://github.com/datawire/rollouts-demo) has been created for this specific tutorial using Rollouts on the Ambassador Control Plane.

Clone your forked repository, which will be referenced later on in this tutorial.

```shell
git clone https://github.com/<YOUR_ORG>/rollouts-demo.git
```

## 3. Install Argo CD & Argo Rollouts

In order to install Argo CD and Argo Rollouts in your cluster run the commands below:

<InstallArgoTabs />

```shell
# Adjust the api version of EdgeStack
kubectl patch deployment -n argo-rollouts \
    $(kubectl get -nargo-rollouts -l app.kubernetes.io/component=rollouts-controller deploy -o=jsonpath='{.items[].metadata.name}') \
    -p '{"spec":{"template":{"spec":{"containers":[{"name":"argo-rollouts", "args":["--ambassador-api-version","getambassador.io/v3alpha1"]}]}}}}'
```

## 4. Get a manifests folder in your repository
Inside of the demo repository, there is a specific directory in which your manifests will live (`./manifests`). This is what maps to the Argo path. You can also add your existing services manifests files that you want to be able to use with Canary Releases, (for example, add a `service.yaml` file). Otherwise, use the path of your existing folder that contains the manifests, relative to the root of your repository, in the `a8r.io/rollouts/scm.path` annotation.

The annotations section of your `service.yaml` file should look something like the following:
```yaml
metadata:
  labels:
    app: rollout-demo
  name: rollout-demo
  annotations:
    a8r.io/description: Demo service to try the rollout feature
    a8r.io/owner: Ambassador Labs
    a8r.io/documentation: https://www.getambassador.io/docs/cloud/latest/service-catalog/howtos/rollout/
    a8r.io/repository: git@github.com:datawire/rollouts-demo.git
    a8r.io/support: http://a8r.io/slack
    a8r.io/rollouts.scm.path: manifests
    a8r.io/rollouts.scm.branch: main
    a8r.io/rollouts.image-repo.type: dockerhub
    a8r.io/rollouts.image-repo.name: hashicorp/http-echo
    a8r.io/rollouts.deployment: rollout-demo
    a8r.io/rollouts.mappings: rollout-demo-mapping
```
<Alert severity="info">
  You will need to replace the repository annotation with your forked repository from step 2. For more information on the required annotations <a href="/docs/argo/latest/reference/ambassador-cloud-rollouts/#configuration">go to Ambassador Cloud Rollouts Configuration</a> page.
</Alert>

## 5. Apply the manifests in your cluster

From your root of your locally forked rollouts-demo repository, apply the Kubernetes manifests to your cluster:

```
kubectl apply -f ./manifests
```

Alternatively, you can register the application via ArgoCD, and Ambassador will pick up the configurations automatically.

```shell
argocd app create rollouts-demo --repo https://github.com/<YOUR_ORG>/rollouts-demo.git --path manifests --dest-namespace default --dest-server https://kubernetes.default.svc --sync-policy auto 
```

<Alert severity="info">
  Verify that this is working by visiting the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> and seeing all your services.
</Alert>

## 6. Configure your repository and container registry
In order to configure the repository and the container registry to use with rollouts, you ned to go to your <a href={`${getBaseUIUrl()}/settings/teams`} target="_blank">team settings</a> and click on the **Integrations** button.

### 6.1 GitHub

Click the **Enable** button in the GitHub section.
You will be taken to github.com and asked in which account you want to install Ambassador DCP.
Select the account in which you forked the rollouts-demo repo.
On the new page that opens scroll down to the "Repository access" section, and click on **Only select repositories**.
Then click on the dropdown menu directly below this option and select your forked rollouts-demo repo.
Click **Save** and you will be taken back to the Ambassador Cloud integrations page.

### 6.2 DockerHub

Click the **Enable** button in the DockerHub section and enter your DockerHub username and an access token so that Ambassador Cloud can query for available image tags.
You can <a href="https://hub.docker.com/settings/security" target="_blank">generate a DockerHub access token</a> via your hub.docker.com account security settings.

### 6.3 GitLab
Click the **Enable** button in the GitLab section and enter your GitLab token.
You can <a href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank">generate a personal access token</a> via your GitLab Profile Settings.
<Alert severity="info">
  You will need to make sure the <strong>api</strong> scope is selected when generating the token for the integration to work properly with your repository.<br />
  If you are only using the GitLab Container Registry, you will only need to select the <strong>read_registry</strong> scope.
</Alert>

## 7. Configure Argo CD

<Alert severity="info">
  If you registered your application directly via ArgoCD in Step 5, you can proceed to the next step.
</Alert>

From the Ambassador Cloud <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, look for the service you want to Rollout and click on it. Click on the **Rollout** button to show the **start rollout slideout** In there, click the **Configure Argo for your service** option and follow the instructions. This will:
1. Generate a deployment key in your forked repository.
1. Configure Argo CD with that deployment key to monitor your repository.
1. Install an Argo CD Application that represents the selected service.
1. If you are using a GitLab repository, it will also configure a webhook in the repository.

## 8. Create a Rollout

Once ArgoCD has been configured in your cluster, you can click the **Rollout** button again to see the **start rollout slideout** where you can select the parameters needed to rollout your service.

Fill in the form with the following information:
- Image Tag
- Rollout Duration
- Weight increment
- Number of pods

Click on **Start Rollout**.

<Alert severity="success">
  Congrats! From the UI you have automatically generated a GitHub pull request or GitLab merge requests that contains all of the necessary Kubernetes rollout YAML configuration.
</Alert>

## 9. Review & merge

After clicking Start Rollout the slideout will close and you will be redirected to the service rollouts page where you will see one card with a badge saying **Not Merged**. This is your **Rollout Card**.
Click the **Pull Request** or **Merge Request** button.
A new browser tab will be opened and you will be taken to your repository where you can review and merge the Pull Request on GitHub or Merge Request on GitLab.
Merge the Pull or Merge Request and go back to your service's rollouts page wher you will see in a few seconds the state of the Rollout Card changing from **Not Merged** to **Merged**.

## 10. Watch the Rollout progress from Ambassador Cloud

After ArgoCD has picked up the chanes, the Rollout Card's state will change to **In Progress** and you can see the rollout progress of your new version.
Note how the **Current Canary Weight** progress bar increases in steps in the amount you specified above in the **weight increment** when creating the rollout.


<Alert severity="success">
  Victory! You have successfully performed a GitOps style canary rollout of a new service without having to write lots of YAML.
</Alert>

## What's next?

Explore some of the popular content on canary rollouts:

* [Canary concepts](../../concepts/canary/): Learn more about canary rollouts and Argo
* [Canary rollouts and observability](../../howtos/observability/): Explore how observability is a prerequisite of effective canary releases.
* [Ambassador Cloud Rollouts reference](../../reference/ambassador-cloud-rollouts/): Dive into the details of Argo configurations and Ambassador Cloud rollouts annotations.
