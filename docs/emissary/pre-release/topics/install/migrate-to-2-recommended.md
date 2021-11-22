import Alert from '@material-ui/lab/Alert';

# $productName$ 2.X Migration Guide

## Install $productName$ $version$ alongside $productName$ 1.X

**This is the recommended migration path** when migrating from $productName$ 1.X to
$productName$ 2.X.It will preserve the functionality of your existing $productName$ 1.X
installation until the new $productName$ 2.X installation is verified to work, and it
does not require changing any resources to `getambassador.io/v3alpha1` until after the
$productName$ 1.X installation is shut down.

1. **Install migration CRDs.**

   If you haven't already installed the migration CRDs, do so now:

   ```
   kubectl apply -f https://app.getambassador.io/yaml/$version$/$productYAMLPath$/$productDockerImage$-migration.yaml
   ```

   The migration CRDs configure the Kubernetes cluster with basic support for the
   `getambassador.io/v3alpha1` CRDs.

2. Next, install $productName$ $version$ alongside 1.X. This is most easily done with
   [Helm](../helm) and its canary option.

   ```bash
   example goes here
   ```

   <Alert severity="warning">
     You must use the <code>$productHelmName$</code> Helm chart to install $productName$ 2.X.
     Do not use the <code>ambassador</code> Helm chart.
   </Alert>

3. At this point, $productName$ 1.X and $productName$ $version$ are running simultaneously, 
   reading the same `getambassador.io/v2` configuration resources. $productName$ $version$
   will also honor `getambassador.io/v3alpha1` resources.
