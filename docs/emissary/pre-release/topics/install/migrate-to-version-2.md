import Alert from '@material-ui/lab/Alert';

# $productName$ 2.X Migration Guide

<Alert severity="info">
  This guide covers migrating from $productName$ 1.X to $productName$ 2.X. To upgrade within
  the same major version, see the <a href="../upgrading">Upgrading $productName$ Guide</a>.
</Alert>

We're pleased to introduce $productName$ $version$! The 2.X family introduces a number of
changes to allow $productName$ to more gracefully handle larger installations (including
multitenant or multiorganizational installations), reduce memory footprint, and improve
performance. In keeping with [SemVer](https://semver.org), $productName$ 2.X introduces
some changes that aren't backward-compatible with 1.X. These changes are detailed in
[Major Changes in $productName$ 2.0.0](../../../about/changes-2.0.0).

## Migration Overview

<Alert severity="warning">
  <b>Read the migration instructions below</b> before making any changes to your
  cluster!
</Alert>

Migration is a six-step process:

1. **Install migration CRDs.**

   ```
   kubectl apply -f https://app.getambassador.io/yaml/$version$/$productYAMLPath$/$productDockerImage$-migration.yaml
   ```

   The migration CRDs configure the Kubernetes cluster with basic support for the
   `getambassador.io/v3alpha1` CRDs.

2. **Install $productName$ $version$.**

   The [recommended strategy](../migrate-to-2-recommended) is to run $productName$ $version$
   and $productName$ 1.14.2 side-by-side in the same cluster, with each having a different
   Kubernetes Service. This allows the two to share most or all of their configuration
   while still keeping traffic isolated for ease of testing $productName$ $version$. 

   In this configuration, $productName$ $version$ will use both `getambassador.io/v2`
   and `getambassador.io/v3alpha1` resources for configuration; $productName$ 1.X will
   only use the `getambassador.io/v2` resources.

   Alternately, you can [install $productName$ $version$ in a separate cluster](../migrate-to-2-alternate).
   This is somewhat safer, but is more effort.

3. **Test!**

   Your $productName$ $version$ installation can support the `getambassador.io/v2`
   configuration resources used by $productName$ 1.X, but you may need to make some
   changes to the configuration, as detailed in the documentation on 
   [configuring $productName$ Communications](../../../howtos/configure-communications)
   and [updating CRDs to `getambassador.io/v3alpha1`](../convert-to-v3alpha1). (At
   minimum, you'll need to add [`Listener`s](../../running/listener) as needed.)

   <Alert severity="info">
    Kubernetes will not allow you to have a <code>getambassador.io/v3alpha1</code> resource
    with the same name as a <code>getambassador.io/v2</code> resource or vice versa: only
    one version can be stored at a time.<br/>
    <br/>
    If you find that your $productName$ $version$ installation and your $productName$ 1.X
    installation absolutely must have resources that are only seen by one version or the
    other way, the simplest way forward is to give the two deployments different
    <code>AMBASSADOR_LABEL_SELECTOR</code> values, then using matching labels on
    configuration resources to indicate which resources should be used by each installation.<br/>
   </Alert>

   If you find that you need to roll back, just reinstall your 1.X CRDs and delete your 
   installation of $productName$ $version$.

4. **Shut down $productName$ 1.14.2.**

   Shutting down $productName$ 1.14.2 is the first step of switching to a configuration
   using just `getambassador.io/v3alpha1`. 

   <Alert severity="info">
     You can still roll back to $productName$ 1.14.2 at this point by simply reinstalling it
     (using the same namespace, `AMBASSADOR_ID`, and `AMBASSADOR_LABEL_SELECTOR`, if applicable).
   </Alert>

5. **Install the final CRDs.**

   <Alert severity="info">
     <b>Rolling back to $productName$ 1.14.2 after this step is not possible.</b> Use caution,
     and make sure that $productName$ $version$ is functioning correctly before taking this step!
   </Alert>

   ```
   kubectl apply -f https://app.getambassador.io/yaml/$version$/$productYAMLPath$/$productCRDName$
   ```

   This lets the Kubernetes cluster know to start treating new configuration resources as
   `getambassador.io/v3alpha1` by default.

6. **Finally, [upgrade other configuration resources.](../convert-to-v3alpha1)**

   At this point it is safe to [fully update your resources to `getambassador.io/v3alpha1`](../convert-to-v3alpha1).

   $productName$ 2.X supports the same `getambassador.io/v2` configuration resources used
   by $productName$ 1.X. However, taking full advantage of $productName$ 2.X's capabilities
   **requires** updating your configuration to use `getambassador.io/v3alpha1` configuration
   resources. Since there are differences between `getambassador.io/v2` and
   `getambassador.io/v3alpha1`, some edits will be required to change configuration versions.

   <Alert severity="warning">
     $productName$ 2.X does not support <code>getambassador.io/v0</code>
     or <code>getambassador.io/v1</code> resources. Convert these resources to 
     <code>getambassador.io/v2</code> before beginning migration.
   </Alert>
