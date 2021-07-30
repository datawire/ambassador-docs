import Alert from '@material-ui/lab/Alert';
import { LoginText } from '../../../../../src/components/LoginText';

# Canary Rollout Quick Start

In this guide we'll give you everything you need to perform a canary rollout of a new Kubernetes service using GitOps best practices, but without needing to write lots of YAML!

  <Alert severity="info">
    Although you won't be writing lots of YAML, all of the Argo CD and Rollouts configuration you will generate from the cloud user interface will be visible in the GitHub pull request that is automatically created. You can inspect this YAML before merging the pull request to start the GitOps flow that will rollout your updated service.
  </Alert>

<div class="docs-article-toc">
<h3>Contents</h3>

* [Prerequisites](#prerequisites)
    * [Own Environment](#own-environment)
    * [Demo Cluster](#demo-cluster)
* [1. Connect your cluster to Ambassador Cloud](#1-connect-your-cluster-to-ambassador-cloud)
* [2. Install Argo CD & Argo Rollouts](#2-install-argo-cd--argo-rollouts)
* [3. Fork the rollouts-demo repo](#3-fork-the-rollouts-demo-repo)
* [4. Update the service manifests with the proper git repo and branch](#4-update-the-service-manifests-with-the-proper-git-repo-and-branch)
* [5. Apply the manifests in your cluster and see the service being reported in the service catalog](#5-apply-the-manifests-in-your-cluster-and-see-the-service-being-reported-in-the-service-catalog)
* [6. Configure GitHub & DockerHub integration](#6-configure-github--dockerhub-integration)
* [7. Configure Argo CD](#7-configure-argo-cd)
* [8. Create a Rollout](#8-create-a-rollout)
* [9. Review & merge PR](#9-review--merge-pr)
* [10. Watch progress](#10-watch-progress)

</div>

## Prerequisites

### Own Environment

If you want to get started with canary rollouts on your own environment, you will need to have **Edge Stack version 1.12 or greater** or **Emissary-ingress 1.13 or greater** installed in your cluster.

**Install** Edge Stack <a href="/docs/edge-stack/1.13/tutorials/getting-started/">from here</a> if needed.

<Alert severity="info">Canary Rollouts Coming Soon for Edge Stack and Emissary-ingress 2.0 and greater!</Alert>

If you already have Edge Stack or Emissary-ingress installed, **check your version** by running this command (adjust your namespace if necessary):

```
kubectl get deploy --namespace ambassador ambassador -o jsonpath='{.spec.template.spec.containers[0].image}'
```
[Upgrade Edge Stack to the latest version](/docs/edge-stack/1.13/topics/install/upgrading/) if needed.

### Demo Cluster

You can also use one of our free demo clusters that comes bundled with a supported version of Edge Stack.

1. <a href="https://app.getambassador.io/cloud/demo-cluster-download-popup" onClick={(e) => {window.open('https://app.getambassador.io/cloud/demo-cluster-download-popup', 'ambassador-cloud-demo-cluster', 'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=550,height=750'); e.preventDefault(); }} target="_blank"><LoginText /></a>  The archive contains all the tools and configurations you need to complete this guide.

2.  Extract the archive file, open the `ambassador-demo-cluster` folder, and run the installer script (the commands below might vary based on where your browser saves downloaded files).

  <Alert severity="info">
    This step will also install some dependency packages onto your laptop using npm, you can see those packages at <code>ambassador-demo-cluster/edgey-corp-nodejs/DataProcessingService/package.json</code>.
  </Alert>

  ```
  cd ~/Downloads
  unzip ambassador-demo-cluster.zip -d ambassador-demo-cluster
  cd ambassador-demo-cluster
  ./install.sh
  ```

3. The demo cluster we provided already has Edge Stack installed. List the services in the `ambassador` namespace:

  ```
   $ kubectl get services -n ambassador

    NAME               TYPE           CLUSTER-IP    EXTERNAL-IP       PORT(S)                      AGE
    ambassador-redis   ClusterIP      10.43.7.10    <none>            6379/TCP                     45h
    ambassador-admin   ClusterIP      10.43.97.79   <none>            8877/TCP,8005/TCP            45h
    ambassador         LoadBalancer   10.43.63.9    173.255.117.234   80:32132/TCP,443:31845/TCP   45h
  ```

## 1. Connect your cluster to Ambassador Cloud

<Alert severity="info">
  If you are using a demo cluster or followed the <a href="/docs/edge-stack/1.13/tutorials/getting-started/">Edge Stack quick start</a>, you can skip this step.
</Alert>


1. <ConnectClusterText />

2. At the top, click **Add Services** then click **Connection Instructions** in the Edge Stack installation section.

3. Follow the prompts to name the cluster and click **Generate a Cloud Token**.

4. Follow the prompts to install the cloud token into your cluster.

5. When the token installation completes, refresh the Service Catalog page.

<Alert severity="success"><b>Victory!</b> All the Services running in your cluster are now listed in Service Catalog! When you complete the next steps of this quickstart this will provide visibility into the current rollout status of each service.</Alert>

## 2. Install Argo CD & Argo Rollouts

In order to install Argo CD and Argo Rollouts in your cluster run the commands bellow:

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

## 3. Fork the rollouts-demo repo

Fork the <a href="https://github.com/datawire/rollouts-demo" target="_blank">rollouts demo repository</a> and clone your fork into your local environment.
This repo contains a series of Kubernetes services that you will add to the service catalog and use to perform a rollout.

## 4. Update the service manifests with the proper git repo and branch

In the cloned repository directory, edit the `manifests/service.yaml` file and replace the `a8r.io/repository` with the URL of your forked repository.

The annotations section of your `service.yaml` file should look something like the following excerpt, with `MY_GITHUB_ACCOUNT` replaced with the GitHub account in which you forked the rollouts-demo repository.
```diff
metadata:
  labels:
    app: rollout-demo
  name: rollout-demo
  annotations:
    a8r.io/description: Demo service to try the rollout feature
    a8r.io/owner: Ambassador Labs
    a8r.io/documentation: https://www.getambassador.io/docs/cloud/latest/service-catalog/howtos/rollout/
-   a8r.io/repository: git@github.com:datawire/rollouts-demo.git
+   a8r.io/repository: git@github.com:MY_GITHUB_ACCOUNT/rollouts-demo.git
    a8r.io/support: https://a8r.io/Slack
```

Commit and push your changes to your fork:

```
git add manifests/service.yaml && git commit -m "Update service repo url" && git push
```

## 5. Apply the manifests in your cluster and see the service being reported in the service catalog

From your root of your locally forked rollouts-demo repository, apply the Kubernetes manifests to your cluster:

```
kubectl apply -f ./manifests
```

<Alert severity="info">Go to the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> and you should now see the `rollout-demo` service reported in Ambassador Cloud!</Alert>

## 6. Configure GitHub & DockerHub integration

In Ambassador Cloud, go to the <a href="https://app.getambassador.io/cloud/settings/teams" target="_blank">Teams Settings page</a> and click the "Integrations" button for your current team.

### GitHub

Click the "Enable" button in the GitHub section.
You will be taken to github.com and asked in which account you want to install Ambassador DCP.
Select the account in which you forked the rollouts-demo repo.
On the new page that opens scroll down to the "Repository access" section, and click on "Only select repositories".
Then click on the dropdown menu directly below this option and select your forked rollouts-demo repo.
Click "Save" and you will be taken back to the Ambassador Cloud integrations page.

### DockerHub

Click the "Enable" button in the DockerHub section and enter your DockerHub username and an access token so that Ambassador Cloud can query for available image tags.
You can <a href="https://hub.docker.com/settings/security" target="_blank">generate a DockerHub access token</a> via your hub.docker.com account security settings.

## 7. Configure Argo CD

From the Ambassador Cloud <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, click the "Rollout" button for the "rollout-demo" service and select "Configure Argo for your service" and follow the instructions. This will:
1. generate a deployment key in your forked repository;
1. configure Argo CD with that deployment key to monitor your repository;
1. install an Argo CD Application that represents the "rollout-demo" service

## 8. Create a Rollout

Remaining on the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, click the "Rollout" button for the "rollout-demo" service, this should show the instructions to create a rollout.

Fill in the form with the following information:
- Image Tag: `hashicorp/http-echo 0.2.3`
- Rollout Duration: 2 minutes
- Weight increment: 10%
- Number of pods: 3

Click "Start Rollout".

<Alert severity="success">Congrats! From the UI you have automatically generated a GitHub pull request that contains all of the necessary Kubernetes rollout YAML configuration.</Alert>

## 9. Review & merge PR

After clicking Start Rollout the slideout will close and you will be shown the service rollouts page where one "Pending" rollout is shown.
Click the "Pull Request" button.
A new browser tab will be opened and you will be taken to github.com where you can review and merge the PR on GitHub.
Click on the "Files changed" tab in the pull request and explore all of the rollouts code that has been generated for you.
Next, click back to the "Conversation" tab, click "Merge Pull Request", and click "Confirm merge".
Now quickly navigate back to your browser tab with the Ambassador Cloud service catalog to watch the progress.

## 10. Watch the Rollout progress from Ambassador Cloud

From the service rollouts page you can watch the rollout progress of your new version.
Note how the "Current Canary Weight" progress bar increases in steps in the amount you specified above in the "weights increment".


<Alert severity="success">Victory! You have successfully performed a GitOps style canary rollout of a new service without having to write lots of YAML.</Alert>

## What's next?

Explore some of the popular content on canary rollouts:

* [Canary concepts](../concepts/canary/): Learn more about canary rollouts and Argo
* [Canary rollouts and observability](../howtos/observability/): Explore how observability is a prerequisite of effective canary releases.
* [Ambassador Cloud Rollouts reference](../reference/ambassador-cloud-rollouts/): Dive into the details of Argo configurations and Ambassador Cloud rollouts annotations.
