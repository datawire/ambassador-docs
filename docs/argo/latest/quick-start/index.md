import Alert from '@material-ui/lab/Alert';
import { LogInText } from '../../../../../src/components/Docs/LogInText';
import { DownloadDemo } from '../../../../../src/components/Docs/DownloadDemo';

# Canary Rollout Quick Start

In this guide we'll give you everything you need to perform a canary rollout of a new Kubernetes service using GitOps best practices, but without needing to write lots of YAMLs!

  <Alert severity="info">
    Although you won't be writing lots of YAML, all of the Argo CD and Rollouts configuration you will generate from the cloud user interface will be visible in the GitHub pull request that is automatically created. You can inspect this YAML before merging the pull request to start the GitOps flow that will rollout your updated service.
  </Alert>

<div class="docs-article-toc">
<h3>Contents</h3>

* [1. Create a Demo Cluster](#1-create-a-demo-cluster)
* [2. Create a Rollout](#2-create-a-rollout)
* [3. Review & merge PR](#3-review--merge-pr)
* [4. Watch progress](#4-watch-progress)

</div>

## 1. Create a Demo Cluster

Click the following link to claim a demo cluster to be used for this rollout demo.

## 2. Create a Rollout

Remaining on the <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, click the "Rollout" button for the "rollout-demo" service, this should show the instructions to create a rollout.

Fill in the form with the following information:
- Image Tag: `hashicorp/http-echo 0.2.3`
- Rollout Duration: 2 minutes
- Weight increment: 10%
- Number of pods: 3

Click "Start Rollout".

<Alert severity="success">Congrats! From the UI you have automatically generated a GitHub pull request that contains all of the necessary Kubernetes rollout YAML configuration.</Alert>

## 3. Review & merge PR

After clicking Start Rollout the slideout will close and you will be shown the service rollouts page where one "Pending" rollout is shown.
Click the "Pull Request" button.
A new browser tab will be opened and you will be taken to github.com where you can review and merge the PR on GitHub.
Click on the "Files changed" tab in the pull request and explore all of the rollouts code that has been generated for you.
Next, click back to the "Conversation" tab, click "Merge Pull Request", and click "Confirm merge".
Now quickly navigate back to your browser tab with the Ambassador Cloud service catalog to watch the progress.

## 4. Watch the Rollout progress from Ambassador Cloud

From the service rollouts page you can watch the rollout progress of your new version.
Note how the "Current Canary Weight" progress bar increases in steps in the amount you specified above in the "weights increment".


<Alert severity="success">Victory! You have successfully performed a GitOps style canary rollout of a new service without having to write lots of YAML.</Alert>

## What's next?

Explore some of the popular content on canary rollouts:

* [Canary concepts](../concepts/canary/): Learn more about canary rollouts and Argo
* [Canary rollouts and observability](../howtos/observability/): Explore how observability is a prerequisite of effective canary releases.
* [Ambassador Cloud Rollouts reference](../reference/ambassador-cloud-rollouts/): Dive into the details of Argo configurations and Ambassador Cloud rollouts annotations.
