---
Title: Edge Stack installation
description: How to install Edge Stack in your Kubernetes environment.
---

# Installing Edge Stack

Edge Stack can be installed with either the [Helm](https://helm.sh) package manager or manually with the [kubectl](https://kubernetes.io/docs/tasks/tools/) command-line tool. For most use cases, Ambassador Labs recommends you use Helm to install Edge Stack.

You can find the installation instructions in the [Ambassador Cloud](https://app.getambassador.io/) setup process, or you can follow the instructions below.

## Install with Helm

Enter the following in your CLI to install Edge Stack with Helm:

```
# Add the Repo:
helm repo add datawire https://app.getambassador.io
helm repo update
 
# Create Namespace and Install:
kubectl create namespace ambassador && \
kubectl apply -f https://app.getambassador.io/yaml/edge-stack/latest/aes-crds.yaml
kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system
helm install edge-stack --namespace ambassador datawire/edge-stack && \
kubectl -n ambassador wait --for condition=available --timeout=90s deploy -lproduct=aes
```

## Manual YAML installation 

Enter the following in your CLI to install Edge Stack manually:

```
kubectl apply -f https://app.getambassador.io/yaml/edge-stack/latest/aes-crds.yaml && \
kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system
kubectl apply -f https://app.getambassador.io/yaml/edge-stack/latest/aes.yaml && \
kubectl -n ambassador wait --for condition=available --timeout=90s deploy -lproduct=aes
```
