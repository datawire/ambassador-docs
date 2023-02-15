import Alert from '@material-ui/lab/Alert';

# Upgrade $OSSproductName$ $version$ to $AESproductName$ $version$ (YAML)

<Alert severity="info">
  This guide covers migrating from $OSSproductName$ $version$ to $AESproductName$ $version$. If
  this is not your <b>exact</b> situation, see the <a href="../../../../migration-matrix">migration
  matrix</a>.
</Alert>

<Alert severity="warning">
  This guide is written for upgrading an installation made without using Helm.
  If you originally installed with Helm, see the <a href="../../../helm/emissary-3.5/edge-stack-3.X">Helm-based
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
   $OSSproductName$ 2.4 and $AESproductName$ $version$. The labels used by $AESproductName$
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
   your cluster. This is mandatory during any upgrade of $productName$.

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

   We publish three manifests for different namespaces. Use only the one that
   matches the namespace into which you installed $OSSproductName$ $version$:

   - [`aes-emissaryns-migration.yaml`] for the `emissary` namespace;
   - [`aes-defaultns-migration.yaml`] for the `default` namespace; and
   - [`aes-ambassadorns-migration.yaml`] for the `ambassador` namespace.

   All three files are set up as follows:

   - They set the `AES_ACME_LEADER_DISABLE` environment variable; you'll enable ACME towards the end of
     the migration.
   - They do NOT create any `AuthService` or a `RateLimitService`, since your $OSSproductName$ may have
     these defined. Again, you'll manage these at the end of migration.
   - They do NOT set `AMBASSADOR_LABEL_SELECTOR`.
   - They do NOT install the Ambassador Agent, since there is already an Ambassador Agent running for
     $OSSproductName$ $version$.

   If any of these do not match your situation, download [`aes-emissaryns-migration.yaml`] and edit it
   as needed.

   [`aes-emissaryns-migration.yaml`]: https://app.getambassador.io/yaml/edge-stack/$version$/aes-emissaryns-migration.yaml
   [`aes-defaultns-migration.yaml`]: https://app.getambassador.io/yaml/edge-stack/$version$/aes-defaultns-migration.yaml
   [`aes-ambassadorns-migration.yaml`]: https://app.getambassador.io/yaml/edge-stack/$version$/aes-ambassadorns-migration.yaml

   Assuming you're using the `emissary` namespace, as was typical for $OSSproductName$ $version$:

   **If you need to set `AMBASSADOR_LABEL_SELECTOR`**, download `aes-emissaryns-migration.yaml` and edit it to
   do so.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes-emissaryns-migration.yaml && \
   kubectl rollout status -n emissary deployment/aes -w
   ```

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
   kubectl scale -n emissary deployment/emissary-ingress-agent --replicas=0
   ```

   Once that's done, install the new Agent:

   ```
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes-emissaryns-agent.yaml && \
   kubectl rollout status -n emissary deployment/edge-stack-agent -w
   ```

6. **Finally, enable ACME and filtering in $productName$ $version$.**

   <Alert severity="warning">
      Enabling filtering correctly in $productName$ $version$ <i>requires</i> that no
      <code>AuthService</code> or <code>RateLimitService</code> resources be present; see
      below for more.
   </Alert>

   First, make sure that no `AuthService` or `RateLimitService` resources are present; delete
   these if necessary.

   - If you are currently using an external authentication service that provides functionality
     you'll still require, turn it into an [`External` `Filter`] (with a [`FilterPolicy`] to
     direct requests that need it correctly).

   - If you are currently using a `RateLimitService`, you can set up
     [Edge Stack Rate Limiting] instead.

   [`External` `Filter`]: ../../../../../../howtos/ext-filters#2-configure-aesproductname-authentication
   [`FilterPolicy`]: ../../../../../../howtos/ext-filters#2-configure-aesproductname-authentication
   [Edge Stack Rate Limiting]: ../../../../../using/rate-limits

   After making sure no `AuthService` or `RateLimitService` resources are present, scale the
   $OSSproductName$ Deployment to 0:

   ```bash
   kubectl scale -n emissary deployment/emissary-ingress --replicase=0
   ```

   Once that's done, apply resources specific to $AESproductName$:

   ```bash
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/resources-migration.yaml
   ```

   Then, finally, enable ACME and filtering in $productName$ $version$:

   ```bash
   kubectl set env -n emissary deployment/aes AES_ACME_LEADER_DISABLE-
   kubectl rollout status -n emissary deployment/aes -w
   ````

Congratulations! At this point, $productName$ $version$ is fully running, and
it's safe to remove the old `emissary` and `emissary-agent` Deployments:

```
kubectl delete -n emissary deployment/emissary deployment/emissary-agent
```

You may also want to redirect DNS to the `edge-stack` Service and remove the
`ambassador` Service.
