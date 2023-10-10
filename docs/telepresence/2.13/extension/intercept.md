---
title: "Create an intercept with the Telepresence Docker extension"
description: "With Telepresence Docker extension, you leverage the full potential of the Telepresence CLI in Docker Desktop."
indexable: true
---

# Create an intercept

With the Telepresence for Docker extension, you can create intercepts from one of your Kubernetes clusters, directly in the extension, or you can upload an [intercept specification](../../reference/intercepts/specs#specification) to run more complex intercepts. These intercepts route the cluster traffic through a proxy URL to your local Docker container. Follow the instructions below to create an intercept with Docker Desktop.

## Prerequisites

Before you begin, you need:
- [Docker Desktop](https://www.docker.com/products/docker-desktop). 
- The [Telepresence ](../../../../../kubernetes-learning-center/telepresence-docker-extension/) extension [installed](../install). 
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/), the Kubernetes command-line tool.

## Connect to Ambassador Cloud through the Telepresence Docker extension.

   1. Click the Telepresence extension in Docker Desktop, then click **Get Started**.

   2. You'll be redirected to Ambassador Cloud for login, you can authenticate with **Docker**, Google, GitHub or GitLab account.
   <p align="center">
    <img src="../images/docker_extension_login.png" />
   </p>

## Create an Intercept from a Kubernetes service

   1. Select the Kubernetes context you would like to connect to.
   <p align="center">
    <img src="../images/docker_extension_connect_to_cluster.png" />
   </p>

   2. Once Telepresence is connected to your cluster you will see a list of services you can connect to. If you don't see the service you want to intercept, you may need to change namespaces in the dropdown menu.
   <p align="center">
      <img src="../images/docker_extension_start_intercept_page.png" />
   </p>

   3. Click the **Intercept** button on the service you want to intercept. You will see a popup to help configure your intercept, and intercept handlers.
   <p align="center">
      <img src="../images/docker_extension_start_intercept_popup.png" />
   </p>
 
   4. Telepresence will start an intercept on the service and your local container on the designated port. You will then be redirected to a management page where you can view your active intercepts.
   <p align="center">
      <img src="../images/docker_extension_running_intercepts_page.png" />
   </p>


## Create an Intercept from an Intercept Specification.

   1. Click the dropdown on the **Connect** button to activate the option to upload an intercept specification. 
   <p align="center">
    <img src="../images/docker_extension_button_drop_down.png" />
   </p>

   2. Click **Upload Telepresence Spec** to run your intercept specification.
   <p align="center">
    <img src="../images/docker_extension_upload_spec_button.png" />
   </p>

   3. Once your specification has been uploaded, the extension will process it and redirect you to the running intercepts page after it has been started. 

   4. The intercept information now shows up in the Docker Telepresence extension. You can now [test your code](#test-your-code).
   <p align="center">
    <img src="../images/docker_extension_running_intercepts_page.png" />
   </p>

   <Alert severity="info">
      For more information on Intercept Specifications see the docs <a href="/docs/telepresence/latest/reference/intercepts/specs">here</a>.
   </Alert>

## Test your code

Now you can make your code changes in your preferred IDE. When you're finished, build a new container with your code changes and restart your intercept.

Click `view` next to your preview URL to open a browser tab and see the changes you've made in real time, or you can share the preview URL with teammates so they can review your work.