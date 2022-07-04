---
Title: Argo Installation
description: Install and configure Argo
---
test
# Installing Argo

To install Argo, you need the current version of Edge Stack installed in your cluster. Follow the [Edge Stack installation guide](../../../run/latest/install-edge-stack) to set this up in your environment.

## Connect your cluster to Ambassador Cloud

Once you've installed Edge Stack, connect your cluster to Ambassador Cloud:

1. Log in to [Ambassador Cloud](https://app.getambassador.io/cloud/) with your preferred identity provider.
2. In Ambassador Cloud, click **Add Services** in the upper-right of the screen, then click **Connection Instructions** in the Edge Stack installation section.
3. Follow the prompts to name the cluster, then click **Generate a Cloud Token**.
4. Follow the next set of prompts to install the cloud token into your cluster.
5. Once the token installation is complete, refresh the Service Catalog page.

## Install Argo CD & Argo Rollouts

Ambassador Labs reccomends you install you can install Argo CD and Argo Rollouts in your cluster with Helm, though you can also do this manually through Kubernetes YAML: 

### Install with Helm (recommended)

Enter the following commands to install Argo CD and Argo Rollouts in your cluster with Helm:

```shell
# Add the Repo:
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Create ArgoCD namespace and install:
kubectl create namespace argocd && \
helm install --namespace argocd --generate-name argo/argo-cd

# Create Argo Rollouts namespace and install:
kubectl create namespace argo-rollouts && \
helm install --namespace argo-rollouts --generate-name argo/argo-rollouts
```

Next, enter the following:

```shell
# Adjust the api version of EdgeStack
kubectl patch deployment -n argo-rollouts \
    $(kubectl get -nargo-rollouts -l app.kubernetes.io/component=rollouts-controller deploy -o=jsonpath='{.items[].metadata.name}') \
    -p '{"spec":{"template":{"spec":{"containers":[{"name":"argo-rollouts", "args":["--ambassador-api-version","getambassador.io/v3alpha1"]}]}}}}'
```

### Install with Kubernetes YAML

Enter the following commands to install Argo CD and Argo Rollouts in your cluster with Kubernetes YAML:

```shell
# Create ArgoCD namespace and install:
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Create Argo Rollouts namespace and install:
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/download/v1.1.0/install.yaml

```

Next, enter the following:

```shell
# Adjust the api version of EdgeStack
kubectl patch deployment -n argo-rollouts \
    $(kubectl get -nargo-rollouts -l app.kubernetes.io/component=rollouts-controller deploy -o=jsonpath='{.items[].metadata.name}') \
    -p '{"spec":{"template":{"spec":{"containers":[{"name":"argo-rollouts", "args":["--ambassador-api-version","getambassador.io/v3alpha1"]}]}}}}'
```

## Add and apply a manifests folder in your repository

Once you have Ambassador Cloud connected to your cluster, you need to create a specific directory for you manifests. If you don'talready have a `manifests` directory, create a new directory called `manifests`. 

From your root of your locally forked rollouts-demo repository, apply the Kubernetes manifests to your cluster:

```
kubectl apply -f ./manifests
```

Once you add the manifests folder, you can log into [Ambassador Cloud](https://app.getambassador.io/cloud/services/) and go to the Service Catalog to see your services. 

### Enable integration with GitHub, DockerHub, or GitLab

While in Ambassador Cloud, you need to configure the repository and the container registry to use with rollouts. Click your user icon in the top-right of the page, click **Settings**, then click **Teams**.

Here you can set integrations with your team's services. Click **Enable** and follow the prompts to complete the setup process.
