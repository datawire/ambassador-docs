import Alert from '@material-ui/lab/Alert';

# Rollout Quick Start

This guide takes you through the rollout of a new version of a service along with the required configuration.

<div class="docs-article-toc">
<h3>Contents</h3>

* [1. Report your service to Ambassador Cloud](#1-report-your-service-to-ambassador-cloud)

</div>

## Prerequisites

Rollouts require **Edge Stack version 1.12 or greater** or **API Gateway 1.13 or greater** to be installed in your cluster. You can also use a <a href="https://app.getambassador.io/cloud/demo-cluster-download-popup" onClick={(e) => {window.open('https://app.getambassador.io/cloud/demo-cluster-download-popup', 'ambassador-cloud-demo-cluster', 'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=550,height=750'); e.preventDefault(); }} target="_blank">demo cluster</a>.

**TODO: Explain how to use the demo cluster if we want to keep this path.**

**Install** Edge Stack <a href="../../../../edge-stack/latest/tutorials/getting-started/">from here</a> if needed.

If you already have Edge Stack or the API Gateway installed, **check your version** by running this command (adjust your namespace if necessary):

```
kubectl get deploy --namespace ambassador ambassador -o jsonpath='{.spec.template.spec.containers[0].image}'
```
[Upgrade Edge Stack to the latest version](../../../../edge-stack/latest/topics/install/upgrading/) if needed.

**TODO: Configure the AES agent to report to your cloud account** 

## Fork the rollouts-demo repo

Fork the <a href="https://github.com/datawire/rollouts-demo" target="_blank">rollouts demo repository</a> and clone it in your local environment.

## Update the service manifests with the proper git repo and branch

In the cloned repository directory, edit the `manifests/service.yaml` file and replace the `a8r.io/repository` with the URL of your forked repository.

Note that the repository URL needs to be in the `git@github.com:owner/repo.git` format.

Commit and push:

```
git add manifests/service.yaml && git commit -m "Update service repo url" && git push
```

## Apply the manifests in your cluster and see the service being reported in the service catalog

From your cloned repository, apply the Kubernetes manifests in your cluster:

```
kubectl apply -f ./manifests
```

<Alert severity="info">Go to the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> and you should now see the `rollout-demo` service reported in DCP!</Alert>

## Configure GitHub & DockerHub integration

In the DCP, go to the <a href="https://app.getambassador.io/cloud/settings/teams" target="_blank">Teams Settings page</a> and click the "Integrations" button for your current team.

### Github

Click the "Configure" button in the Github section and install the Ambassador DCP Github App in your forked repository. Click "Save" and you should be taken back to the integrations page.

### DockerHub

Skip?

## Install Argo CD & Argo Rollouts

Back on the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, click the "Rollout" button for the "rollout-demo" service and select "Install Argo in your cluster" and follow the instructions. This will:
1. install Argo CD in your cluster; 
1. install Argo Rollouts in your cluster.

## Configure Argo CD

Still on the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, click the "Rollout" button for the "rollout-demo" service and select "Configure Argo for your service" and follow the instructions. This will:
1. generate a deployment key in your forked repository;
1. configure Argo CD with that deployment key to monitor your repository;
1. install an Argo CD Application that represents the "rollout-demo" service

## Create a Rollout

Still on the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, click the "Rollout" button for the "rollout-demo" service, this should show the instructions to create a rollout.

Fill in the form with the following information:
- Image Tag: `hashicorp/http-echo 0.2.3`
- Rollout Duration: 2 minutes
- Weight increment: 10%
- Number of pods: 3

Click "Start Rollout".

## Review & merge PR

You should then be taken to the service rollouts page where one "Pending" rollout is shown. Click the "Pull Request" button to review and merge the PR on GitHub.

## Watch progress

Once merged, go back to the service rollouts page and see the process
