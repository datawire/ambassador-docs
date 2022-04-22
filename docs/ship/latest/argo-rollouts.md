---
Title: Simple rollouts with Argo and Ambassador Cloud
description: Leverage the power of Ambassador Cloud for quick, painless, and secure rollouts.
---

# Simple rollouts with Argo and Ambassador Cloud

With Argo and Ambassador Cloud, it's easy to create a rollout. Go to the Ambassador Cloud <a href="https://app.getambassador.io/cloud/services" target="_blank">Service Catalog</a> page, find for the service you want to rollout and click on its card. You can also see information about your service along with available actions related to the service. To begin your rollout, click the **Rollout** button to show the **start rollout slideout**, then click **Configure Argo for your service**  and follow the instructions. 

This process does the following:
1. Generates a deployment key in your forked repository.
1. Configures Argo CD with that deployment key to monitor your repository.
1. Installs an Argo CD application that represents the selected service.
1. For users who have [integrated Argo with their GitLab](../installing-argo/#enable-integration-with-github-dockerhub-or-gitlab) repository, this also configures a webhook in the repository.

## Create a Rollout

Once ArgoCD is configured in your cluster, can click the **Rollout** button on the desired service in Ambassador Cloud. Click **start rollout slideout**. From here, you can select the parameters needed to rollout your service.

Fill in the form with the following information:
- Image Tag
- Rollout Duration
- Weight increment
- Number of pods

Click on **Start Rollout**.

## Review and merge

Once you click **Start Rollout**, the slideout closes and you are redirected to the service rollouts page. Here you can see the card with a badge that reads "Not Merged". This is your Rollout Card. 
Click **Pull Request** or **Merge Request** to open a new browser tab. This takes you to your repository where you can review and merge the pull request on GitHub or GitLab, depending on yor configurations.
Your service's rollouts page displays state of the Rollout Card, and the status changesfrom **Not Merged** to **Merged**.

## Observe the Rollout in Ambassador Cloud

After ArgoCD initiates the changes, the Rollout Card state changes to **In Progress**, and you can see the rollout progress of your new version.
The **Current Canary Weight** progress bar increases in steps to the amount you specified in the **weight increment** when the rollout.