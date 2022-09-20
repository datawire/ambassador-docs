import Alert from '@material-ui/lab/Alert';

# Upgrade $productName$ 2.3.X to $productName$ $versionTwoX$ (YAML)

<Alert severity="info">
  This guide covers migrating from $productName$ 2.2.0 or 2.2.2 to $productName$ $versionTwoX$. If
  this is not your <b>exact</b> situation, see the <a href="../../../../migration-matrix">migration
  matrix</a>.
</Alert>

<Alert severity="warning">
  This guide is written for upgrading an installation made without using Helm.
  If you originally installed with Helm, see the <a href="../../../helm/emissary-2.3/emissary-2.4">Helm-based
  upgrade instructions</a>.
</Alert>

Since $productName$'s configuration is entirely stored in Kubernetes resources, upgrading between minor
versions is straightforward.

Migration is a two-step process:

1. **Install new CRDs.**

   Before installing $productName$ $versionTwoX$ itself, you need to update the CRDs in
   your cluster. This is mandatory during any upgrade of $productName$.

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

2. **Install $productName$ $versionTwoX$.**

   After installing the new CRDs, upgrade $productName$ $versionTwoX$.

   <Alert severity="info">
     Our <a href="https://app.getambassador.io/yaml/emissary/$versionTwoX$/emissary-emissaryns.yaml"><code>emissary-emissaryns.yaml</code></a> file
     uses the `emissary` namespace, since this is the default for $productName$.
     We also publish <a href="https://app.getambassador.io/yaml/emissary/$versionTwoX$/emissary-defaultns.yaml"><code>emissary-defaultns.yaml</code></a> for the
     `default` namespace. For any other namespace, you should download one of these files and edit the namespaces manually.
   </Alert>

   ```bash
   kubectl apply -f https://app.getambassador.io/yaml/emissary/$versionTwoX$/emissary-emissaryns.yaml && \
   kubectl rollout status  -n emissary deployment/emissary-ingress -w
   ```
