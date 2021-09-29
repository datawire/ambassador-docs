import Alert from '@material-ui/lab/Alert';

# Install with Helm

<Alert severity="info">
  We're pleased to introduce $productName$ 2.0! The 2.X family introduces a number of 
  changes to allow $productName$ to more gracefully handle larger installations
  (including multitenant or multiorganizational installations), reduce memory footprint,
  and improve performance. For more information on 2.X, please check the&nbsp;
  <a href="../../release-notes">release notes</a>.
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


Install the $productName$ Chart with the following command:

   ```
	helm install -n $productNamespace$ --create-namespace \
		$productHelmName$ --devel \
		datawire/$productHelmName$ && \
	kubectl rollout status  -n $productNamespace$ deployment/$productDeploymentName$ -w
   ```

For more advanced configuration and details about helm values,
[please see the helm chart.](https://github.com/emissary-ingress/emissary/blob/master/charts/emissary-ingress/README.md)

## Upgrading an existing installation

**Note: Do not use these instructions** to migrate from $OSSproductName$ to $AESproductName$. See [Migrating to $AESproductName$](../upgrade-to-edge-stack/) instead.

Upgrading an existing installation of $productName$ is a two-step process:

1. First, apply any CRD updates:

   ```
    kubectl apply -f https://app.getambassador.io/yaml/emissary/latest/emissary-crds.yaml
   ```

2. Next, upgrade $productName$ itself:

   ```
    helm repo update
    helm upgrade -n $productNamespace$ \
        $productHelmName$ --devel \
        datawire/$productHelmName$ && \
    kubectl rollout status  -n $productNamespace$ deployment/$productDeploymentName$ -w
   ```

  This will upgrade the image and deploy and other necessary resources for $productName$.
