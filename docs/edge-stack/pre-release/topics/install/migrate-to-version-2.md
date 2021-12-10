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

The recommended strategy for migration is to run $productName$ 1.X and $productName$
$version$ side-by-side in the same cluster. This gives $productName$ $version$
and $productName$ 1.X access to all the same configuration resources, with some
important caveats:

1. **$productName$ 1.X will not see any `getambassador.io/v3alpha1` resources.**

   This is intentional; it provides a way to apply configuration only to 
   $productName$ $version$, while not interfering with the operation of your
   $productName$ 1.X installation.

2. **If needed, you can use labels to further isolate configurations.**

   If you need to prevent your $productName$ $version$ installation from
   seeing a particular bit of $productName$ 1.X configuration, you can apply
   a Kubernetes label to the configuration resources that should be seen by
   your $productName$ $version$ installation, then set its
   `AMBASSADOR_LABEL_SELECTOR` enviroment variable to restrict its configuration
   to only the labelled resources.

   For example, you could apply a `version-two: true` label to all resources
   that should be visible to $productName$ $version$, then set
   `AMBASSADOR_LABEL_SELECTOR=version-two=true` in its Deployment.

3. **If $productName$ 1.X is using ACME, $productName$ $version$ cannot also use ACME.**

   The processes that handle ACME challenges cannot be managed by both $productName$
   1.X and $productName$ $version$ at the same time. The simplest way of managing this
   is to let $productName$ 1.X handle ACME during the migration, to allow for a smoother
   rollback if necessary.

   This is the most common case requiring isolated configurations as described above.

You can also migrate by [installing $productName$ $version$ in a separate cluster](../migrate-to-2-alternate).
This permits absolute certainty that your $productName$ 1.X configuration will not be
affected by changes meant for $productName$ $version$, and it eliminates concerns about
ACME, but it is more effort.

## Side-by-Side Migration Steps

Migration is a six-step process:

1. **Convert older configuration resources to `getambassador.io/v2`.**

   $productName$ 2.X does not support <code>getambassador.io/v0</code> or
   <code>getambassador.io/v1</code> resources. If you are still using any of these
   resources, convert them to <code>getambassador.io/v2</code> before beginning migration.

2. **Isolate configurations if using ACME.**

   If your $productName$ 1.X installation is using ACME, you must isolate the
   configurations of $productName$ 1.X and $productName$ $version$ using labels,
   so that you can prevent $productName$ $version$ from attempting to use ACME
   at the same time:

   ```
   # Label all Ambassador CRDs as being OK for $productName$ 2.X...
   kubectl label ambassador-crds --all version-two=true

   # ...but then mark Hosts as _not_ OK for $productName$ 2.X.
   kubectl label hosts --all version-two-
   ```

   **Repeat the above for each namespace where you have $productName$ configuration
   resources.** This prevents $productName$ $version$ from trying to manage ACME on existing
   `Host`s.

3. **Install new CRDs.**

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

4. **Install $productName$ $version$.**

   After installing the new CRDs, you need to install $productName$ $version$ itself.
   This is most easily done with [Helm](../helm).

   - If you do not need to set `AMBASSADOR_LABEL_SELECTOR`:

      ```bash
      helm install -n $productNamespace$ --create-namespace \
        $productHelmName$ datawire/$productHelmName$ && \
      kubectl rollout status  -n $productNamespace$ deployment/$productDeploymentName$ -w
      ```

   - If you do need to set `AMBASSADOR_LABEL_SELECTOR`, use `--set`, for example:

      ```bash
      helm install -n $productNamespace$ --create-namespace \
        $productHelmName$ datawire/$productHelmName$ \
        --set emissary.env.AMBASSADOR_LABEL_SELECTOR="version-two=true" && \
      kubectl rollout status  -n $productNamespace$ deployment/$productDeploymentName$ -w
      ```

   <Alert severity="warning">
     You must use the <a href="https://github.com/datawire/edge-stack/"><code>$productHelmName$</code> Helm chart</a> to install $productName$ 2.X.
     Do not use the <a href="https://github.com/emissary-ingress/emissary/tree/release/v1.14/charts/ambassador"><code>ambassador</code> Helm chart</a>.
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

5. **Test!**

   Your $productName$ $version$ installation can support the `getambassador.io/v2`
   configuration resources used by $productName$ 1.X, but you may need to make some
   changes to the configuration, as detailed in the documentation on 
   [configuring $productName$ Communications](../../../howtos/configure-communications)
   and [updating CRDs to `getambassador.io/v3alpha1`](../convert-to-v3alpha1). 

   - At minimum, you'll need to add [`Listener`s](../../running/listener) as needed.

   - If  your $productName$ 1.X installation is using ACME, you'll also need to duplicate
     your `Host`s:

      - Make sure the duplicate `Host` uses `apiVersion: getambassador.io/v3alpha1`.
      - Make sure the duplicate `Host` has a different resource name.
      - Make sure the duplicate `Host` has the same `tlsSecret` and `hostname` as the original!
      - Make sure the duplicate `Host` has ACME disabled.

   <Alert severity="info">
    Kubernetes will not allow you to have a <code>getambassador.io/v3alpha1</code> resource
    with the same name as a <code>getambassador.io/v2</code> resource or vice versa: only
    one version can be stored at a time.<br/>
    <br/>
    If you find that your $productName$ $version$ installation and your $productName$ 1.X
    installation absolutely must have resources that are only seen by one version or the
    other way, see overview section 2, "If needed, you can use labels to further isolate configurations".
   </Alert>

   **If you find that you need to roll back**, just reinstall your 1.X CRDs and delete your 
   installation of $productName$ $version$.

6. **When ready, shut down $productName$ 1.X.**

   You can run $productName$ 1.X and $productName$ $version$ as long as you care to. 
   However, taking full advantage of $productName$ 2.X's capabilities **requires**
   [updating your configuration to use `getambassador.io/v3alpha1` configuration resources](../convert-to-v3alpha1),
   since some useful features in $productName$ $version$ are only available using 
   `getambassador.io/v3alpha1` resources.

   Once $productName$ 1.X is no longer running, you may [convert](..convert-to-v3alpha1)
   any remaining `getambassador.io/v2` resources to `getambassador.io/v3alpha1`. 

   If your $productName$ 1.X installation was managing ACME, you will also need to 
   re-enable ACME on your `getambassador.io/v3alpha1` `Host`s, as appropriate.

