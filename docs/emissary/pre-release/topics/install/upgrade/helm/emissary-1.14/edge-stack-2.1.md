import Alert from '@material-ui/lab/Alert';

# Upgrade $productName$ 1.14.2 to $AESproductName$ $version$ (Helm)

<Alert severity="info">
  This guide covers migrating from $productName$ 1.14.2 to $AESproductName$ $version$. If
  this is not your <b>exact</b> situation, see the <a href="../../../../migration-matrix">migration
  matrix</a>.
</Alert>

<Alert severity="warning">
  This guide is written for upgrading an installation originally made using Helm.
  If you did not install with Helm, see the <a href="../../../yaml/emissary-1.14/edge-stack-2.1">YAML-based
  upgrade instructions</a>.
</Alert>

We're pleased to introduce $AESproductName$ $version$! The 2.X family introduces a number of
changes to allow $productName$ to more gracefully handle larger installations (including
multitenant or multiorganizational installations), reduce memory footprint, and improve
performance. In keeping with [SemVer](https://semver.org), $productName$ 2.X introduces
some changes that aren't backward-compatible with 1.X. These changes are detailed in
[Major Changes in $productName$ 2.X](../../../about/changes-2.x).

You can upgrade from $productName$ to $AESproductName$ with a few simple commands. When you upgrade to $AESproductName$, you'll be able to access additional capabilities such as **automatic HTTPS/TLS termination, Swagger/OpenAPI support, API catalog, Single Sign-On, and more.** For more about the differences between $AESproductName$ and $OSSproductName$, see the [Editions page](/editions).

## Migration Overview

<Alert severity="warning">
  <b>Read the migration instructions below</b> before making any changes to your
  cluster!
</Alert>

The recommended strategy for migration is to run $productName$ 1.14.2 and $AESproductName$
$version$ side-by-side in the same cluster. This gives $AESproductName$ $version$
and $AESproductName$ 1.14.2 access to all the same configuration resources, with some
important caveats:

1. **$productName$ 1.14.2 will not see any `getambassador.io/v3alpha1` resources.**

   This is intentional; it provides a way to apply configuration only to 
   $AESproductName$ $version$, while not interfering with the operation of your
   $productName$ 1.14.2 installation.

2. **If needed, you can use labels to further isolate configurations.**

   If you need to prevent your $AESproductName$ $version$ installation from
   seeing a particular bit of $productName$ 1.14.2 configuration, you can apply
   a Kubernetes label to the configuration resources that should be seen by
   your $AESproductName$ $version$ installation, then set its
   `AMBASSADOR_LABEL_SELECTOR` enviroment variable to restrict its configuration
   to only the labelled resources.

   For example, you could apply a `version-two: true` label to all resources
   that should be visible to $AESproductName$ $version$, then set
   `AMBASSADOR_LABEL_SELECTOR=version-two=true` in its Deployment.

3. **Check `AuthService` and `RateLimitService` resources, if any.**

   If you have an [`AuthService`](../../running/services/auth-service) or
   [`RateLimitService`](../../running/services/rate-limit-service) installed, make
   sure that they are using the [namespace-qualified DNS name](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services).
   If they are not, the initial migration tests may fail.

You can also migrate by [installing $AESproductName$ $version$ in a separate cluster](../migrate-to-2-alternate).
This permits absolute certainty that your $productName$ 1.14.2 configuration will not be
affected by changes meant for $AESproductName$ $version$, and it eliminates concerns about
ACME, but it is more effort.

## Side-by-Side Migration Steps

Migration is a six-step process:

1. **Convert older configuration resources to `getambassador.io/v2`.**

   $productName$ 2.X does not support `getambassador.io/v0` or `getambassador.io/v1`
   resources. If you are still using any of these resources, convert them to
   `getambassador.io/v2` before beginning migration.

2. **Install new CRDs.**

   Before installing $AESproductName$ $version$ itself, you must configure your
   Kubernetes cluster to support its new `getambassador.io/v3alpha1` configuration
   resources. Note that `getambassador.io/v2` resources are still supported, but **you
   must install support for `getambassador.io/v3alpha1`** to run $AESproductName$ $version$,
   even if you intend to continue using only `getambassador.io/v2` resources for some
   time.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes-crds.yaml && \
   kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system 
   ```

   <Alert severity="info">
     $AESproductName$ $version$ includes a Deployment in the `emissary-system` namespace
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

3. **Install $AESproductName$ $version$.**

   After installing the new CRDs, you need to install $AESproductName$ $version$ itself
   **in the same namespace as your existing $productName$ 1.14.2 installation**. It's important
   to use the same namespace so that the two installations can see the same secrets, etc.

   Typically, $productName$ 1.14.2 was installed in the `default` namespace. If you installed
   $productName$ 1.14.2 in a different namespace, change the namespace in the commands below.

   - If you do not need to set `AMBASSADOR_LABEL_SELECTOR`:

      ```bash
      helm install -n default edge-stack datawire/edge-stack && \
      kubectl rollout status  -n default deployment/edge-stack -w
      ```

   - If you do need to set `AMBASSADOR_LABEL_SELECTOR`, use `--set`, for example:

      ```bash
      helm install -n default edge-stack datawire/edge-stack \
        --set emissary-ingress.env.AMBASSADOR_LABEL_SELECTOR="version-two=true" && \
      kubectl rollout status -n default deployment/edge-stack -w
      ```

   <Alert severity="warning">
     You must use the <a href="https://github.com/datawire/edge-stack/"><code>edge-stack</code> Helm chart</a> to install $AESproductName$ $version$.
     Do not use the <a href="https://github.com/emissary-ingress/emissary/tree/release/v1.14/charts/ambassador"><code>ambassador</code> Helm chart</a>.
   </Alert>

4. **Install `Listener`s and `Host`s as needed.**

   An important difference between $productName$ 1.14.2 and $AESproductName$ $version$ is the
   new **mandatory** `Listener` CRD. Also, when running both installations side by side,
   you will need to make sure that a `Host` is present for the new $AESproductName$ $version$
   Service. For example:

   ```bash
   kubectl apply -f - <<EOF
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Listener
   metadata:
     name: ambassador-http-listener
   spec:
     port: 8080
     protocol: HTTPS
     securityModel: XFP
     hostBinding:
       namespace:
         from: ALL
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Listener
   metadata:
     name: ambassador-https-listener
   spec:
     port: 8443
     protocol: HTTPS
     securityModel: XFP
     hostBinding:
       namespace:
         from: ALL
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Host
   metadata:
     name: emissary-host
   spec:
     hostname: $EMISSARY_HOSTNAME
     tlsSecret:
       name: $EMISSARY_TLS_SECRET
   EOF
   ```

   This example requires that you know the hostname for the $productName$ Service (`$EMISSARY_HOSTNAME`)
   and that you have created a TLS Secret for it in `$EMISSARY_TLS_SECRET`.

5. **Test!**

   Your $AESproductName$ $version$ installation can support the `getambassador.io/v2`
   configuration resources used by $productName$ 1.14.2, but you may need to make some
   changes to the configuration, as detailed in the documentation on 
   [configuring $productName$ Communications](../../../howtos/configure-communications)
   and [updating CRDs to `getambassador.io/v3alpha1`](../convert-to-v3alpha1). 

   <Alert severity="info">
     Kubernetes will not allow you to have a <code>getambassador.io/v3alpha1</code> resource
     with the same name as a <code>getambassador.io/v2</code> resource or vice versa: only
     one version can be stored at a time.<br/>
     <br/>
     If you find that your $AESproductName$ $version$ installation and your $productName$ 1.14.2
     installation absolutely must have resources that are only seen by one version or the
     other way, see overview section 2, "If needed, you can use labels to further isolate configurations".
   </Alert>

   **If you find that you need to roll back**, just reinstall your 1.14.2 CRDs, delete your 
   installation of $AESproductName$ $version$, and delete the `emissary-system` namespace.

6. **When ready, switch over to $AESproductName$ $version$.**

   You can run $productName$ 1.14.2 and $AESproductName$ $version$ side-by-side as long as you care
   to. However, taking full advantage of $productName$ 2.X's capabilities **requires**
   [updating your configuration to use `getambassador.io/v3alpha1` configuration resources](../convert-to-v3alpha1),
   since some useful features in $AESproductName$ $version$ are only available using 
   `getambassador.io/v3alpha1` resources.

   When you're ready to have $AESproductName$ $version$ handle traffic on its own, switch
   your original $productName$ 1.14.2 Service to point to $AESproductName$ $version$. Use
   `kubectl edit ambassador` and change the `selectors` to:

   ```
   app.kubernetes.io/instance: edge-stack
   app.kubernetes.io/name: edge-stack
   profile: main
   ```

   Once that is done, it's safe to remove the `ambassador-admin` Service and the `ambassador`
   Deployment:

   ```
   kubectl delete service/ambassador-admin deployment/ambassador
   ```

   You may also want to redirect DNS to the `edge-stack` Service and remove the
   `ambassador` Service.

   Once $productName$ 1.14.2 is no longer running, you may [convert](..convert-to-v3alpha1)
   any remaining `getambassador.io/v2` resources to `getambassador.io/v3alpha1`.

6. What's next?

   Now that you have $AESproductName$ up and running, check out the [Getting Started](../../../../../../edge-stack/latest/tutorials/getting-started) guide for recommendations on what to do next and take full advantage of its features.
