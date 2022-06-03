---
    description: In this guide, we'll walk through the process of deploying $productName$ in Kubernetes for ingress routing.
---

import Alert from '@material-ui/lab/Alert';

# Install manually

<Alert severity="warning">

  To migrate from $productName$ 1.X to $productName$ 2.X, see the
  [$productName$ migration matrix](../migration-matrix/).  This guide
  **will not work** for that, due to changes to the configuration
  resources used for $productName$ 2.X.

</Alert>

In this guide, we'll walk you through installing $productName$ in your Kubernetes cluster.

The manual install process does not allow for as much control over configuration
as the [Helm install method](../helm), so if you need more control over your $productName$
installation, it is recommended that you use helm.

## Before you begin

$productName$ is designed to run in Kubernetes for production. The most essential requirements are:

* Kubernetes 1.11 or later
* The `kubectl` command-line tool

## Install with YAML

$productName$ is typically deployed to Kubernetes from the command line. If you don't have Kubernetes, you should use our [Docker](../docker) image to deploy $productName$ locally.

1. In your terminal, run the following command:

    ```
    kubectl create namespace $productNamespace$ || true
    kubectl apply -f https://app.getambassador.io/yaml/emissary/$version$/emissary-crds.yaml && \
    kubectl apply -f https://app.getambassador.io/yaml/emissary/$version$/emissary-emissaryns.yaml && \
    kubectl -n $productNamespace$ wait --for condition=available --timeout=90s deploy $productDeploymentName$
    ```

   <Alert severity="info">
     $productName$ $version$ includes a Deployment in the $productNamespace$ namespace
     called <code>$productDeploymentName$-apiext</code>. This is the APIserver extension
     that supports converting $productName$ CRDs between <code>getambassador.io/v2</code>
     and <code>getambassador.io/v3alpha1</code>. This Deployment needs to be running at
     all times.
   </Alert>

   <Alert severity="warning">
     If the <code>$productDeploymentName$-apiext</code> Deployment's Pods all stop running,
     you will not be able to use <code>getambassador.io/v3alpha1</code> CRDs until restarting
     the <code>$productDeploymentName$-apiext</code> Deployment.
   </Alert>

2. Determine the IP address or hostname of your cluster by running the following command:

    ```
    kubectl get -n $productNamespace$ service $productDeploymentName$ -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}"
    ```

    Your load balancer may take several minutes to provision your IP address. Repeat the provided command until you get an IP address.

3. Next Steps

   $productName$ shold now be successfully installed and running, but in order to get started deploying Services and test routing to them you need to configure a few more resources.

   - [The `Listener` Resource](../../running/listener/) is required to configure which ports the $productName$ pods listen on so that they can begin responding to requests.
   - [The `Mapping` Resouce](../../using/intro-mappings/) is used to configure routing requests to services in your cluster.
   - [The `Host` Resource](../../running/host-crd/) configures TLS termination for enabling HTTPS communication.
   - Explore how $productName$ [configures communication with clients](../../../howtos/configure-communications)

  <Alert severity="info">
     We strongly recommend following along with our <a href="../../../tutorials/getting-started">Quickstart Guide</a> to get started by creating a <code>Listener</code>, deploying a simple service to test with, and setting up a <code>Mapping</code> to route requests from $productName$ to the demo service.
  </Alert>

## Upgrading an existing installation

See the [migration matrix](../migration-matrix) for instructions about upgrading
$productName$.
