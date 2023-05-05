---
    description: In this guide, we'll walk through the process of deploying $productName$ in Kubernetes for ingress routing.
---

import Alert from '@material-ui/lab/Alert';

# Install manually

<Alert severity="warning">
  To migrate from $productName$ 1.X to $productName$ 2.X, see the
  <a href="../migrate-to-version-2"> $productName$ 2.X Migration Guide</a>. This guide
  <b> will not work</b> for that, due to changes to the configuration resources used
  for $productName$ 2.X.
</Alert>

<Alert severity="info">
  We're pleased to introduce $productName$ 2.0! The 2.X family introduces a number of
  changes to allow $productName$ to more gracefully handle larger installations
  (including multitenant or multiorganizational installations), reduce memory footprint,
  and improve performance. For more information on 2.X, please check the&nbsp;
  <a href="../../../release-notes">release notes</a>.
</Alert>

In this guide, we'll walk you through installing $productName$ in your Kubernetes cluster.

The manual install process does not allow for as much control over configuration
as the [Helm install method](../helm), so if you need more control over your $productName$
installation, it is recommended that you use helm.

## Before you begin

$productName$ is designed to run in Kubernetes for production. The most essential requirements are:

* Kubernetes 1.11 or later
* The `kubectl` command-line tool

## Install or Upgrade with YAML

$productName$ is typically deployed to Kubernetes from the command line. If you don't have Kubernetes, you should use our [Docker](../docker) image to deploy $productName$ locally.

1. In your terminal, run the following command:

    ```
    kubectl create namespace $productNamespace$ || true
    kubectl apply -f https://app.getambassador.io/yaml/emissary/$version$/emissary-crds.yaml && \
    kubectl apply -f https://app.getambassador.io/yaml/emissary/$version$/emissary-ingress.yaml && \
    kubectl -n $productNamespace$ wait --for condition=available --timeout=90s deploy $productDeploymentName$
    ```

2. Determine the IP address or hostname of your cluster by running the following command:

    ```
    kubectl get -n $productNamespace$ service $productDeploymentName$ -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}"
    ```

    Your load balancer may take several minutes to provision your IP address. Repeat the provided command until you get an IP address.

3. Next Steps

   $productName$ should now be successfully installed and running, but in order to get started deploying Services and test routing to them you need to configure a few more resources.

   - [The `Listener` Resource](../../running/listener/) is required to configure which ports the $productName$ pods listen on so that they can begin responding to requests.
   - [The `Mapping` Resouce](../../using/intro-mappings/) is used to configure routing requests to services in your cluster.
   - [The `Host` Resource](../../running/host-crd/) configures TLS termination for enabling HTTPS communication.
   - Explore how $productName$ [configures communication with clients](../../../howtos/configure-communications)

  <Alert severity="info">
     We strongly recommend following along with our <a href="../../../tutorials/getting-started">Quickstart Guide</a> to get started by creating a <code>Listener</code>, deploying a simple service to test with, and setting up a <code>Mapping</code> to route requests from $productName$ to the demo service.
  </Alert>
