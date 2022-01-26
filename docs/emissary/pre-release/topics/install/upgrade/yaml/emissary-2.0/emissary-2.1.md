import Alert from '@material-ui/lab/Alert';

# Upgrade $productName$ 2.0.5 to $productName$ $version$ (YAML)

<Alert severity="info">
  This guide covers migrating from $productName$ 2.0.5 to $productName$ $version$. If
  this is not your <b>exact</b> situation, see the <a href="../../../../migration-matrix">migration
  matrix</a>.
</Alert>

<Alert severity="warning">
  This guide is written for upgrading an installation made without using Helm.
  If you originally installed with Helm, see the <a href="../../../helm/emissary-2.0/emissary-2.1">Helm-based
  upgrade instructions</a>.
</Alert>

Since $productName$'s configuration is entirely stored in Kubernetes resources, no special process
is necessary to upgrade $productName$.

Migration is a two-step process:

1. **Install new CRDs.**

   Before installing $productName$ $version$ itself, you need to update the CRDs in
   your cluster; Helm will not do this for you. This will allow supporting
   `getambassador.io/v2` resources as well as `getambassador.io/v3alpha1`; it is mandatory.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/$productYAMLPath$/$version$/$productCRDName$
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

2. **Install $productName$ $version$.**

   After installing the new CRDs, upgrade $productName$ $version$:

      ```bash
      kubectl apply -f https://app.getambassador.io/yaml/$productYAMLPath$/$version$/$productYAMLFile$ && \
      kubectl rollout status  -n emissary deployment/emissary-ingress -w
      ```
