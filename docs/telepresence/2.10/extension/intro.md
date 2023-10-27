---
title: "Telepresence for Docker introduction"
description: "Learn about the Telepresence extension for Docker."
indexable: true
---

# Telepresence for Docker

Telepresence is now available as a [Docker Extension](https://www.docker.com/products/extensions/) for Docker Desktop. 

## What is the Telepresence extension for Docker?

The  [Telepresence Docker extension](../../../../../kubernetes-learning-center/telepresence-docker-extension/) is an extension that runs in Docker Desktop. This extension allows you to spin up a selection of your application and run the Telepresence daemons in that container. The Telepresence extension allows you to intercept a service and redirect cloud traffic to other containers on the Docker host network.

## What does the Telepresence Docker extension do?

Telepresence for Docker is designed to simplify your coding experience and test your code faster. Traditionally, you need to build a container within docker with your code changes, push them, wait for it to upload, deploy the changes, verify them, view them, and repeat that process as you continually test your changes. This makes it a slow and cumbersome process when you need to continually test changes.

With the Telepresence extension for Docker Desktop, you can use intercepts to immediately preview changes as you make them, without the need to redeploy after every change. Because the Telepresence extension also enables you to isolate your machine and operate it entirely within the Docker runtime, this means you can make changes without root permission on your machine. 

## How does Telepresence for Docker work?

The Telepresence extension is configured to use Docker's host network (VM network for Windows and Mac, host network on Linux). 

Telepresence runs entirely within containers. The Telepresence daemons run in a container, which can be given commands using the extension UI. When Telepresence intercepts a service, it redirects cloud traffic to other containers on the Docker host network.

## What do I need to begin?

All you need is [Docker Desktop](https://www.docker.com/products/docker-desktop) with the [Ambassador Telepresence extension installed](../install) and the Kubernetes command-line tool [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/).
