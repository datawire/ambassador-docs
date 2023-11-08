---
title: "Telepresence for Docker installation and connection guide"
description: "Learn how to install and update Ambassador Labs' Telepresence for Docker."
indexable: true
---

# Install and connect the Telepresence Docker extension

[Docker](https://docker.com), the popular containerized runtime environment, now offers the [Telepresence](../../../../../kubernetes-learning-center/telepresence-docker-extension/) extension for Docker Desktop. With this extension, you can quickly install Telepresence and begin using its features with your Docker containers in a matter of minutes.

## Install Telepresence for Docker

Telepresence for Docker is available through the Docker Destktop. To install Telepresence for Docker:

1. Open Docker Desktop.
2. In the Docker Dashboard, click **Add Extensions** in the left navigation bar. 
3. In the Extensions Marketplace, search for the Ambassador Telepresence extension. 
4. Click **Install**.

## Connect to Ambassador Cloud through the Telepresence extension.

   After you install the Telepresence extension in Docker Desktop, you need to generate an API key to connect the Telepresence extension to Ambassador Cloud. 

   1. Click the Telepresence extension in Docker Desktop, then click **Get Started**.

   2. Click the **Get API Key** button to open Ambassador Cloud in a browser window.

   3. Sign in with your Google, Github, or Gitlab account.
      Ambassador Cloud opens to your profile and displays the API key.

   4. Copy the API key and paste it into the API key field in the Docker Dashboard.

## Connect to your cluster in Docker Desktop.

   1. Select the desired clister from the dropdown menu and click **Next**.
   This cluster is now set to kubectl's current context.

   2. Click **Connect to [your cluster]**.
   Your cluster is connected and you can now create [intercepts](../intercept/).