import Alert from '@material-ui/lab/Alert';

# Upgrade $OSSproductName$ $version$ to $AESproductName$ $version$ (Helm)

<Alert severity="info">
  This guide covers migrating from $OSSproductName$ $version$ to $AESproductName$ $version$. If
  this is not your <b>exact</b> situation, see the <a href="../../../../migration-matrix">migration
  matrix</a>.
</Alert>

<Alert severity="warning">
  This guide is written for upgrading an installation originally made using Helm.
  If you did not install with Helm, see the <a href="../../../yaml/emissary-3.1/edge-stack-3.1">YAML-based
  upgrade instructions</a>.
</Alert>

You can upgrade from $OSSproductName$ to $AESproductName$ with a few simple commands. When you upgrade to $AESproductName$, you'll be able to access additional capabilities such as **automatic HTTPS/TLS termination, Swagger/OpenAPI support, API catalog, Single Sign-On, and more.** For more about the differences between $AESproductName$ and $OSSproductName$, see the [Editions page](/editions).

## Migration Overview

<Alert severity="warning">
  <b>Read the migration instructions below</b> before making any changes to your
  cluster!
</Alert>

The recommended strategy for migration is to run $OSSproductName$ $version$ and $AESproductName$
$version$ side-by-side in the same cluster. This gives $AESproductName$ $version$
and $AESproductName$ $version$ access to all the same configuration resources, with some
important notes:

1. **If needed, you can use labels to further isolate configurations.**

   If you need to prevent your $AESproductName$ $version$ installation from
   seeing a particular bit of $OSSproductName$ $version$ configuration, you can apply
   a Kubernetes label to the configuration resources that should be seen by
   your $AESproductName$ $version$ installation, then set its
   `AMBASSADOR_LABEL_SELECTOR` environment variable to restrict its configuration
   to only the labelled resources.

   For example, you could apply a `version-two: true` label to all resources
   that should be visible to $AESproductName$ $version$, then set
   `AMBASSADOR_LABEL_SELECTOR=version-two=true` in its Deployment.

2. **$AESproductName$ ACME and `Filter`s will be disabled while $OSSproductName$ is still running.**

   Since $AESproductName$ and $OSSproductName$ share configuration, $AESproductName$ cannot
   configure its ACME or other filter processors without also affecting $OSSproductName$. This
   migration process is written to simply disable these $AESproductName$ features to make
   it simpler to roll back, if needed. Alternate, you can isolate the two configurations
   as described above.

3. **Be careful to only have one $productName$ Agent running at a time.**

   The $productName$ Agent is responsible for communications between
   $productName$ and Ambassador Cloud. If multiple versions of the Agent are
   running simultaneously, Ambassador Cloud could see conflicting information
   about your cluster.

   The best way to avoid multiple agents when installing with Helm is to use
   `--set emissary-ingress.agent.enabled=false` to tell Helm not to install a
   new Agent with $productName$ $version$. Once testing is done, you can switch
   Agents safely.

4. **Be careful about label selectors on Kubernetes Services!**

   If you have services in $OSSproductName$ 3.X that use selectors that will match
   Pods from $AESproductName$ $version$, traffic will be erroneously split between
   $OSSproductName$ 3.X and $AESproductName$ $version$. The labels used by $AESproductName$
   $version$ include:

   ```yaml
   app.kubernetes.io/name: edge-stack
   app.kubernetes.io/instance: edge-stack
   app.kubernetes.io/part-of: edge-stack
   app.kubernetes.io/managed-by: getambassador.io
   product: aes
   profile: main
   ```

You can also migrate by [installing $AESproductName$ $version$ in a separate cluster](../../../../migrate-to-3-alternate/).
This permits absolute certainty that your $OSSproductName$ $version$ configuration will not be
affected by changes meant for $AESproductName$ $version$, but it is more effort.

## Side-by-Side Migration Steps

Migration is a six-step process:

1. **Install new CRDs.**

   Before installing $productName$ $version$ itself, you need to update the CRDs in
   your cluster; Helm will not do this for you. This is mandatory during any upgrade of $productName$.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes-crds.yaml && \
   kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system
   ```

   <Alert severity="info">
     $AESproductName$ $version$ includes a Deployment in the `emissary-system` namespace
     called <code>emissary-apiext</code>. This is the APIserver extension
     that supports converting $OSSproductName$ CRDs between <code>getambassador.io/v2</code>
     and <code>getambassador.io/v3alpha1</code>. This Deployment needs to be running at
     all times.
   </Alert>

   <Alert severity="warning">
     If the <code>emissary-apiext</code> Deployment's Pods all stop running,
     you will not be able to use <code>getambassador.io/v3alpha1</code> CRDs until restarting
     the <code>emissary-apiext</code> Deployment.
   </Alert>

   <Alert severity="warning">
    There is a known issue with the <code>emissary-apiext</code> service that impacts all $productName$ 2.x and 3.x users. Specifically, the TLS certificate used by apiext expires one year after creation and does not auto-renew. All users who are running $productName$/$OSSproductName$ 2.x or 3.x with the apiext service should proactively renew their certificate as soon as practical by running <code>kubectl delete --all secrets --namespace=emissary-system</code> to delete the existing certificate, and then restart the <code>emissary-apiext</code> deployment with <code>kubectl rollout restart deploy/emissary-apiext -n emissary-system</code>.
    This will create a new certificate with a one year expiration. We will issue a software patch to address this issue well before the one year expiration. Note that certificate renewal will not cause any downtime.
   </Alert>

2. **Install $AESproductName$ $version$.**

   After installing the new CRDs, you need to install $AESproductName$ $version$ itself
   **in the same namespace as your existing $OSSproductName$ $version$ installation**. It's important
   to use the same namespace so that the two installations can see the same secrets, etc.

   <Alert severity="warning">
     <b>Make sure that you set the various `create` flags when running Helm.</b> This prevents
     $AESproductName$ $version$ from trying to configure filters that will adversely affect
     $OSSproductName$ $version$.
   </Alert>

   Start by making sure that your `datawire` Helm repo is set correctly:

   ```bash
   helm repo remove datawire
   helm repo add datawire https://app.getambassador.io
   helm repo update
   ```

   Typically, $OSSproductName$ $version$ was installed in the `emissary` namespace. If you installed
   $OSSproductName$ $version$ in a different namespace, change the namespace in the commands below.

   - If you do not need to set `AMBASSADOR_LABEL_SELECTOR`:

      ```bash
      helm install -n emissary \
           --set emissary-ingress.agent.enabled=false \
           edge-stack datawire/edge-stack && \
      kubectl rollout status  -n emissary deployment/edge-stack -w
      ```

   - If you do need to set `AMBASSADOR_LABEL_SELECTOR`, use `--set`, for example:

      ```bash
      helm install -n emissary \
           --set emissary-ingress.agent.enabled=false \
           --set emissary-ingress.env.AMBASSADOR_LABEL_SELECTOR="version-two=true" \
           edge-stack datawire/edge-stack && \
      kubectl rollout status -n emissary deployment/edge-stack -w
      ```

   <Alert severity="warning">
     You must use the <a href="https://artifacthub.io/packages/helm/datawire/edge-stack/$aesChartVersion$"><code>$productHelmName$</code> Helm chart</a> to install $AESproductName$ $version$.
   </Alert>

3. **Test!**

   Your $AESproductName$ $version$ installation should come up running with the configuration
   resources used by $OSSproductName$ $version$, including `Listener`s and `Host`s.

   <Alert severity="info">
     If you find that your $AESproductName$ $version$ installation and your $OSSproductName$ $version$
     installation absolutely must have resources that are only seen by one version or the
     other way, see overview section 1, "If needed, you can use labels to further isolate configurations".
   </Alert>

   **If you find that you need to roll back**, just reinstall your $OSSproductName$ $version$ CRDs
   and delete your installation of $AESproductName$ $version$.

4. **When ready, switch over to $AESproductName$ $version$.**

   You can run $OSSproductName$ $version$ and $AESproductName$ $version$ side-by-side as long as you care
   to. When you're ready to have $AESproductName$ $version$ handle traffic on its own, switch
   your original $OSSproductName$ $version$ Service to point to $AESproductName$ $version$. Use
   `kubectl edit -n emissary service emissary-ingress` and change the `selectors` to:

   ```yaml
   app.kubernetes.io/instance: edge-stack
   app.kubernetes.io/name: edge-stack
   profile: main
   ```

   Repeat using `kubectl edit service ambassador-admin` for the `ambassador-admin`
   Service.

5. **Install the $productName$ $version$ Ambassador Agent.**

   First, scale the $OSSproductName$ agent to 0:

   ```
   kubectl scale -n emissary deployment/emissary-agent --replicas=0
   ```

   Once that's done, install the new Agent:

   ```bash
   helm upgrade -n emissary \
        --set emissary-ingress.agent.enabled=true \
        $productHelmName$ datawire/$productHelmName$ && \
   kubectl rollout status -n emissary-ingress deployment/edge-stack -w
   ```

6. **Finally, enable ACME and filtering in $productName$ $version$.**

   First, scale the $OSSproductName$ Deployment to 0:

   ```
   kubectl scale -n emissary deployment/emissary --replicase=0
   ```

   Once that's done, enable ACME and filtering in $productName$ $version$:

   ```bash
   helm upgrade -n emissary \
        --set emissary-ingress.agent.enabled=true
        edge-stack datawire/edge-stack && \
   kubectl rollout status -n emissary deployment/edge-stack -w
   ````

Congratulations! At this point, $productName$ $version$ is fully running, and
it's safe to remove the old `emissary` and `emissary-agent` Deployments:

```
kubectl delete -n emissary deployment/emissary deployment/emissary-agent
```

You may also want to redirect DNS to the `edge-stack` Service and remove the
`ambassador` Service.
