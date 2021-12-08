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
[Major Changes in $productName$ 2.X](../../../about/changes-2.x).

## Migration Overview

<Alert severity="warning">
  <b>Read the migration instructions below</b> before making any changes to your
  cluster!
</Alert>

Migration is a five-step process:

1. **Convert older configuration resources to `getambassador.io/v2`.**

   $productName$ 2.X does not support <code>getambassador.io/v0</code> or
   <code>getambassador.io/v1</code> resources. If you are still using any of these
   resources, convert them to <code>getambassador.io/v2</code> before beginning migration.

2. **Install new CRDs.**

   Before installing $productName$ $version$ itself, you must configure your
   Kubernetes cluster to support its new `getambassador.io/v3alpha1` configuration
   resources:

   ```
   kubectl apply -f https://app.getambassador.io/yaml/$version$/$productYAMLPath$/$productCRDName$
   ```

   Note that `getambassador.io/v2` resources are still supported, but **you must
   install support for `getambassador.io/v3alpha1`** to run $productName$ $version$,
   even if you intend to continue using only `getambassador.io/v2` resources for some
   time.

   <Alert severity="info">
     At this point, both <code>getambassador/v2</code> and <code>getambassador/v3alpha1</code>
     CRDs will be defined, but only <code>getambassador/v2</code> CRDs will be usable until
     the next step.
   </Alert>

3. **Install $productName$ $version$.**

   After installing the new CRDs, you need to install $productName$ $version$ itself.
   The [recommended strategy](../migrate-to-2-recommended) is to run $productName$ $version$
   and $productName$ 1.X side-by-side in the same cluster, with each having a different
   Kubernetes Service. This allows the two to share most or all of their configuration
   while still keeping traffic isolated for ease of testing $productName$ $version$. 

   In this configuration, $productName$ $version$ will use both `getambassador.io/v2`
   and `getambassador.io/v3alpha1` resources for configuration, and $productName$ 1.X will
   only use the `getambassador.io/v2` resources.

   Alternately, you can [install $productName$ $version$ in a separate cluster](../migrate-to-2-alternate).
   This permits absolute certainty that your $productName$ 1.X configuration will not be
   affected by changes meant for $productName$ $version$, but is more effort.

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

4. **Test!**

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

   **If you find that you need to roll back**, just reinstall your 1.X CRDs and delete your 
   installation of $productName$ $version$.

4. **When ready, shut down $productName$ 1.X.**

   You can run $productName$ 1.X and $productName$ $version$ as long as you care to. 
   However, taking full advantage of $productName$ 2.X's capabilities **requires**
   [updating your configuration to use `getambassador.io/v3alpha1` configuration resources](../convert-to-v3alpha1),
   since some useful features in $productName$ $version$ are only available using 
   `getambassador.io/v3alpha1` resources.

   Once $productName$ 1.X is no longer running, you may [convert](..convert-to-v3alpha1)
   any remaining `getambassador.io/v2` resources to `getambassador.io/v3alpha1`.
