import Alert from '@material-ui/lab/Alert';

# Install with Helm

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

[Helm](https://helm.sh) is a package manager for Kubernetes that automates the release and management of software on Kubernetes. $productName$ can be installed via a Helm chart with a few simple steps, depending on if you are deploying for the first time, upgrading $productName$ from an existing installation, or migrating from $productName$.

## Before you begin

The $productName$ Helm chart is hosted by Datawire and published at `https://app.getambassador.io`.

Start by adding this repo to your helm client with the following command:

```
helm repo add datawire https://app.getambassador.io
helm repo update
```

## Install with Helm

When you run the Helm chart, it installs $productName$.


1. Install the $productName$ Chart with the following command:

    ```
	 helm install -n $productNamespace$ --create-namespace \
		 $productHelmName$ datawire/$productHelmName$ && \
	 kubectl rollout status  -n $productNamespace$ deployment/$productDeploymentName$ -w
    ```

2. Next Steps

   $productName$ shold now be successfully installed and running, but in order to get started deploying Services and test routing to them you need to configure a few more resources.

   - [The `Listener` Resource](../../running/listener/) is required to configure which ports the $productName$ pods listen on so that they can begin responding to requests.
   - [The `Mapping` Resouce](../../using/intro-mappings/) is used to configure routing requests to services in your cluster.
   - [The `Host` Resource](../../running/host-crd/) configures TLS termination for enabling HTTPS communication.
   - Explore how $productName$ [configures communication with clients](../../../howtos/configure-communications)

  <Alert severity="info">
     We strongly recommend following along with our <a href="../../../tutorials/getting-started">Quickstart Guide</a> to get started by creating a <code>Listener</code>, deploying a simple service to test with, and setting up a <code>Mapping</code> to route requests from $productName$ to the demo service.
  </Alert>


For more advanced configuration and details about helm values,
[please see the helm chart.](https://github.com/emissary-ingress/emissary/blob/v2.1.0/charts/emissary-ingress/README.md)

## Upgrading an existing installation

**Note: Do not use these instructions** to migrate from $OSSproductName$ to $AESproductName$. See [Migrating to $AESproductName$](../upgrade-to-edge-stack/) instead.

Upgrading an existing installation of $productName$ is a two-step process:

1. First, apply any CRD updates:

   ```
    kubectl apply -f https://app.getambassador.io/yaml/emissary/$version$/emissary-crds.yaml
   ```

2. Next, upgrade $productName$ itself:

   ```
    helm repo update
    helm upgrade -n $productNamespace$ \
        $productHelmName$ \
        datawire/$productHelmName$ && \
    kubectl rollout status  -n $productNamespace$ deployment/$productDeploymentName$ -w
   ```

  This will upgrade the image and deploy and other necessary resources for $productName$.
