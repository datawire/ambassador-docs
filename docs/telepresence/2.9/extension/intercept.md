---
title: "Create an intercept with Telepreence for Docker"
description: "Create an intercept with Telepresence for Docker. With Telepresence, you can create intercepts to debug, "
indexable: true
---

# Create an intercept

With the Telepresence for Docker extension, you can create [personal intercepts](../../concepts/intercepts/?intercept=personal). These intercepts route the cluster traffic through a proxy UTL to your local Docker container. Follow the instructions below to create an intercept with Docker Desktop.

## Prerequisites

Before you begin, you need:
- [Docker Desktop](https://www.docker.com/products/docker-desktop). 
- The [Telepresence ](../../../../../kubernetes-learning-center/telepresence-docker-extension/) extension [installed](../install). 
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/), the Kubernetes command-line tool.

This guide assumes you have a Kubernetes deployment with a running service, and that you can run a copy of that service in a docker container on your laptop.

## Copy the service you want to intercept 

Once you have the Telepresence extension [installed and connected](../install/) the Telepresence extension, you need to copy the service. To do this, use the `docker run` command with the following flags:

   ```console
   $ docker run --rm -it --network host <your image>
   ```

The Telepresence extension requires the target service to be on the host network. This allows Telepresence to share a network with your container. The mounted network device redirects cluster-related traffic back into the cluster.

## Intercept a service

In Docker Desktop, the Telepresence extension shows all the services in the namespace.

   1. Choose a service to intercept and click the **Intercept** button. 

   2. Select the service port for the intercept from the dropdown.

   3. Enter the target port of the service you previously copied in the Docker container.

   4. Click **Submit** to create the intercept.

The intercept now shows up in the Docker Telepresence extension.

## Test your code

Now you can make your code changes in your preferred IDE. When you're finished, build a new container with your code changes and run your container on Docker's host network. All the traffic previously routed to and from your Kubernetes service is now routed to and from your local container. 

Click the globe icon next to your intercept to get the preview URL. From here, you can view the intercept details in Ambassador Cloud, open the preview URL in your browser to see the changes you've made in realtime, or you can share the preview URL with teammates so they can review your work.