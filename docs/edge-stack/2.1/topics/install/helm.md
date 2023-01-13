import Alert from '@material-ui/lab/Alert';

# Install with Helm

<Alert severity="warning">

  To migrate from $productName$ 1.X to $productName$ 2.X, see the
  [$productName$ migration matrix](../migration-matrix/). This guide
  **will not work** for that, due to changes to the configuration
  resources used for $productName$ 2.X.

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

1. Install the $productName$ CRDs.

   Before installing $productName$ $version$ itself, you must configure your
   Kubernetes cluster to support the `getambassador.io/v3alpha1` and `getambassador.io/v2`
   configuration resources. This is required.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes-crds.yaml
   kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system
   ```

   <Alert severity="info">
     $productName$ $version$ includes a Deployment in the `emissary-system` namespace
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

   <Alert severity="warning">
    There is a known issue with the <code>emissary-apiext</code> service that impacts all $productName$ 2.x and 3.x users. Specifically, the TLS certificate used by apiext expires one year after creation and does not auto-renew. All users who are running $productName$/$OSSproductName$ 2.x or 3.x with the apiext service should proactively renew their certificate as soon as practical by running <code>kubectl delete --all secrets --namespace=emissary-system</code> to delete the existing certificate, and then restart the <code>emissary-apiext</code> deployment with <code>kubectl rollout restart deploy/emissary-apiext -n emissary-system</code>.
    This will create a new certificate with a one year expiration. We will issue a software patch to address this issue well before the one year expiration. Note that certificate renewal will not cause any downtime.
   </Alert>

2. Install the $productName$ Chart with the following command:

    ```
	 helm install -n $productNamespace$ --create-namespace \
		 $productHelmName$ datawire/$productHelmName$ && \
	 kubectl rollout status  -n $productNamespace$ deployment/$productDeploymentName$ -w
    ```

3. Next Steps

   $productName$ shold now be successfully installed and running, but in order to get started deploying Services and test routing to them you need to configure a few more resources.

   - [The `Listener` Resource](../../running/listener/) is required to configure which ports the $productName$ pods listen on so that they can begin responding to requests.
   - [The `Mapping` Resouce](../../using/intro-mappings/) is used to configure routing requests to services in your cluster.
   - [The `Host` Resource](../../running/host-crd/) configures TLS termination for enablin HTTPS communication.
   - Explore how $productName$ [configures communication with clients](../../../howtos/configure-communications)

  <Alert severity="info">
     We strongly recommend following along with our <a href="../../../tutorials/getting-started">Quickstart Guide</a> to get started by creating a <code>Listener</code>, deploying a simple service to test with, and setting up a <code>Mapping</code> to route requests from $productName$ to the demo service.
  </Alert>

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

For more advanced configuration and details about helm values,
[please see the helm chart.](https://github.com/datawire/edge-stack/tree/main/charts/edge-stack/README.md)

## Upgrading an existing installation

See the [migration matrix](../migration-matrix) for instructions about upgrading
$productName$.
