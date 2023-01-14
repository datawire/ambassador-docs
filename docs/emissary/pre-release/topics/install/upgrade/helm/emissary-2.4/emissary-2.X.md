import Alert from '@material-ui/lab/Alert';

# Upgrade $productName$ 2.4.Z (Helm)

<Alert severity="info">
  This guide covers migrating from $productName$ 2.4.Z to $productName$ $versionTwoX$. If
  this is not your <b>exact</b> situation, see the <a href="../../../../migration-matrix">migration
  matrix</a>.
</Alert>

<Alert severity="warning">
  This guide is written for upgrading an installation originally made using Helm.
  If you did not install with Helm, see the <a href="../../../yaml/emissary-2.4/emissary-2.X">YAML-based
  upgrade instructions</a>.
</Alert>

Since $productName$'s configuration is entirely stored in Kubernetes resources, upgrading between minor
versions is straightforward.

Migration is a two-step process:

1. **Install new CRDs.**

   Before installing $productName$ $versionTwoX$ itself, you need to update the CRDs in
   your cluster; Helm will not do this for you. This is mandatory during any upgrade of $productName$.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/emissary/$versionTwoX$/emissary-crds.yaml
   kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system
   ```

   <Alert severity="info">
     $productName$ $versionTwoX$ includes a Deployment in the `emissary-system` namespace
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
    There is a known issue with the <code>emissary-apiext</code> service that impacts all $productName$ 2.x and 3.x users. Specifically, the TLS certificate used by apiext expires one year after creation and does not auto-renew. All users who are running $productName$/$AESproductName$ 2.x or 3.x with the apiext service should proactively renew their certificate as soon as practical by running <code>kubectl delete --all secrets --namespace=emissary-system</code> to delete the existing certificate, and then restart the <code>emissary-apiext</code> deployment with <code>kubectl rollout restart deploy/emissary-apiext -n emissary-system</code>.
    This will create a new certificate with a one year expiration. We will issue a software patch to address this issue well before the one year expiration. Note that certificate renewal will not cause any downtime.
   </Alert>

2. **Install $productName$ $versionTwoX$.**

   After installing the new CRDs, use Helm to install $productName$ $versionTwoX$. Start by
   making sure that your `datawire` Helm repo is set correctly:

   ```bash
   helm repo remove datawire
   helm repo add datawire https://app.getambassador.io
   helm repo update
   ```

   Then, update your $productName$ installation in the `$productNamespace$` namespace.
   If necessary for your installation (e.g. if you were running with
   `AMBASSADOR_SINGLE_NAMESPACE` set), you can choose a different namespace.

   ```bash
   helm upgrade -n $productNamespace$ \
        $productHelmName$ datawire/$productHelmName$ && \
   kubectl rollout status  -n $productNamespace$ deployment/emissary-ingress -w
   ```

   <Alert severity="warning">
    You must use the <a href="https://artifacthub.io/packages/helm/datawire/emissary-ingress/$ossChartVersion$"><code>$productHelmName$</code> Helm chart</a> for $productName$ 2.X.
    Do not use the <a href="https://artifacthub.io/packages/helm/datawire/ambassador/6.9.3"><code>ambassador</code> Helm chart</a>.
   </Alert>
