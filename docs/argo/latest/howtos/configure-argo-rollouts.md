import Alert from '@material-ui/lab/Alert';

# Configure Canary Rollout in your Cluster


In this guide we'll give you everything you need to perform a canary rollout in your own cluster using GitOps best practices, but without needing to write lots of YAML!

  <Alert severity="info">
    Although you won't be writing lots of YAML, all of the Argo CD and Rollouts configuration you will generate from the cloud user interface will be visible in the GitHub pull request that is automatically created. You can inspect this YAML before merging the pull request to start the GitOps flow that will rollout your updated service.
  </Alert>

<div class="docs-article-toc">
<h3>Contents</h3>

* [Prerequisites](#prerequisites)
* [1. Connect your cluster to Ambassador Cloud](#1-connect-your-cluster-to-ambassador-cloud)
* [2. Install Argo CD & Argo Rollouts](#2-install-argo-cd--argo-rollouts)
* [3. Update the service manifests with the proper git repo and branch](#3-update-the-service-manifests-with-the-proper-git-repo-and-branch)
* [4. Apply the manifests in your cluster](#4-apply-the-manifests-in-your-cluster)
* [5. Configure Your Repository And Container Registry](#5-configure-your-repository-and-container-registry)
* [6. Configure Argo CD](#6-configure-argo-cd)
* [7. Create a Rollout](#7-create-a-rollout)
* [8. Review & merge PR](#8-review--merge-pr)
* [9. Watch progress](#9-watch-progress)

</div>

## Prerequisites

If you want to get started with canary rollouts on your own environment, you will need to have **Edge Stack version 1.12 or greater** or **Emissary-ingress 1.13 or greater** installed in your cluster.

**Install** Edge Stack <a href="/docs/edge-stack/1.13/tutorials/getting-started/">from here</a> if needed.

<Alert severity="info">Canary Rollouts Coming Soon for Edge Stack and Emissary-ingress 2.0 and greater!</Alert>

If you already have Edge Stack or Emissary-ingress installed, **check your version** by running this command (adjust your namespace if necessary):

```
kubectl get deploy --namespace ambassador ambassador -o jsonpath='{.spec.template.spec.containers[0].image}'
```
[Upgrade Edge Stack to the latest version](/docs/edge-stack/1.13/topics/install/upgrading/) if needed.

## 1. Connect your cluster to Ambassador Cloud

1. Log in to [Ambassador Cloud](https://app.getambassador.io/cloud/) with your preferred identity provider.

2. At the top, click **Add Services** then click **Connection Instructions** in the Edge Stack installation section.

3. Follow the prompts to name the cluster and click **Generate a Cloud Token**.

4. Follow the prompts to install the cloud token into your cluster.

5. When the token installation completes, refresh the Service Catalog page.

<Alert severity="success"><b>Victory!</b> All the Services running in your cluster are now listed in Service Catalog! When you complete the next steps of this guide, it will provide visibility into the current rollout status of each service.</Alert>

## 2. Install Argo CD & Argo Rollouts

In order to install Argo CD and Argo Rollouts in your cluster run the commands bellow:

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```
## 3. Get a manifests folder in your repository

Inside of your repository, you will need a specific directory in which your manifests will live. Create a directory called `manifests` and inside of it add your services files. For example, add a `service.yaml` file.

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
    a8r.io/support: https://a8r.io/Slack
    a8r.io/rollouts.scm.path: manifests
    a8r.io/rollouts.scm.branch: main
    a8r.io/rollouts.image-repo.type: dockerhub
    a8r.io/rollouts.image-repo.name: hashicorp/http-echo
    a8r.io/rollouts.deployment: rollout-demo
    a8r.io/rollouts.mappings: rollout-demo-mapping
```
<Alert severity="info">
  Fore more information on the required annotations <a href="/docs/argo/latest/reference/ambassador-cloud-rollouts/#configuration">go to Ambassador Cloud Rollouts Configuration</a> page.
</Alert>

## 4. Apply the manifests in your cluster

From your root of your locally forked rollouts-demo repository, apply the Kubernetes manifests to your cluster:

```
kubectl apply -f ./manifests
```

<Alert severity="info">
  Go to the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> and you should now see the your service reported in Ambassador Cloud!
</Alert>

## 5. Configure your repository and container registry


### GitHub

Click the <strong>Enable</strong> button in the GitHub section.
You will be taken to github.com and asked in which account you want to install Ambassador DCP.
Select the account in which you forked the rollouts-demo repo.
On the new page that opens scroll down to the "Repository access" section, and click on <strong>Only select repositories</strong>.
Then click on the dropdown menu directly below this option and select your forked rollouts-demo repo.
Click <strong>Save</strong> and you will be taken back to the Ambassador Cloud integrations page.

### DockerHub
Click the <strong>Enable</strong> button in the DockerHub section and enter your DockerHub username and an access token so that Ambassador Cloud can query for available image tags.
You can <a href="https://hub.docker.com/settings/security" target="_blank">generate a DockerHub access token</a> via your hub.docker.com account security settings.

### GitLab
Click the <strong>Enable</strong> button in the GitLab section and enter your GitLab token.
You can <a href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank">generate a personal access token</a> via your GitLab Profile Settings.
<Alert severity="info">
  You will need to make sure the <strong>api</strong> scope is selected when generating the token for the integration to work properly with your repository. If you are only using the GitLab Container Registry, you will only need to select the <strong>read_registry</strong> scope.
</Alert>

## 6. Configure Argo CD

From the Ambassador Cloud <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, click the "Rollout" button for the "rollout-demo" service and select "Configure Argo for your service" and follow the instructions. This will:
1. generate a deployment key in your forked repository;
1. configure Argo CD with that deployment key to monitor your repository;
1. install an Argo CD Application that represents the "rollout-demo" service

## 7. Create a Rollout

Remaining on the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, click the "Rollout" button for the "rollout-demo" service, this should show the instructions to create a rollout.

Fill in the form with the following information:
- Image Tag: `hashicorp/http-echo 0.2.3`
- Rollout Duration: 2 minutes
- Weight increment: 10%
- Number of pods: 3

Click "Start Rollout".

<Alert severity="success">Congrats! From the UI you have automatically generated a GitHub pull request that contains all of the necessary Kubernetes rollout YAML configuration.</Alert>

## 8. Review & merge PR

After clicking Start Rollout the slideout will close and you will be shown the service rollouts page where one "Not Merged" rollout is shown.
Click the "Pull Request" button.
A new browser tab will be opened and you will be taken to github.com where you can review and merge the PR on GitHub.
Click on the "Files changed" tab in the pull request and explore all of the rollouts code that has been generated for you.
Next, click back to the "Conversation" tab, click "Merge Pull Request", and click "Confirm merge".
Now quickly navigate back to your browser tab with the Ambassador Cloud service catalog to watch the progress.

## 9. Watch the Rollout progress from Ambassador Cloud

From the service rollouts page you can watch the rollout progress of your new version.
Note how the "Current Canary Weight" progress bar increases in steps in the amount you specified above in the "weights increment".


<Alert severity="success">Victory! You have successfully performed a GitOps style canary rollout of a new service without having to write lots of YAML.</Alert>

## What's next?

Explore some of the popular content on canary rollouts:

* [Canary concepts](../concepts/canary/): Learn more about canary rollouts and Argo
* [Canary rollouts and observability](../howtos/observability/): Explore how observability is a prerequisite of effective canary releases.
* [Ambassador Cloud Rollouts reference](../reference/ambassador-cloud-rollouts/): Dive into the details of Argo configurations and Ambassador Cloud rollouts annotations.
