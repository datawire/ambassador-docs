import Alert from '@material-ui/lab/Alert';

# Upgrade $productName$ 2.0.5 to $productName$ $versionTwoX$ (YAML)

<Alert severity="info">
  This guide covers migrating from $productName$ 2.0.5 to $productName$ $versionTwoX$. If
  this is not your <b>exact</b> situation, see the <a href="../../../../migration-matrix">migration
  matrix</a>.
</Alert>

<Alert severity="warning">
  This guide is written for upgrading an installation made without using Helm.
  If you originally installed with Helm, see the <a href="../../../helm/edge-stack-2.0/edge-stack-2.X">Helm-based
  upgrade instructions</a>.
</Alert>

<Alert severity="warning">
  <b>Upgrading from $productName$ 2.0.5 to $productName$ $versionTwoX$ typically requires downtime.</b>
  In some situations, Ambassador Labs Support may be able to assist with a zero-downtime migration;
  contact support with questions.
</Alert>

Migrating from $productName$ 2.0.5 to $productName$ $versionTwoX$ is a three-step process:

1. **Install new CRDs.**

   Before installing $productName$ $versionTwoX$ itself, you need to update the CRDs in
   your cluster. This is mandatory during any upgrade of $productName$.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$versionTwoX$/aes-crds.yaml
   kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system
   ```

   <Alert severity="info">
     $productName$ $versionTwoX$ includes a Deployment in the `emissary-system` namespace
     called <code>emissary-apiext</code>. This is the APIserver extension
     that supports converting $productName$ CRDs between <code>getambassador.io/v2</code>
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

2. **Delete $productName$ 2.0.5 Deployment.**

   <Alert severity="warning">
     Delete <b>only</b> the Deployment for $productName$ 2.0.5 in order to preserve all of
     your existing configuration.
   </Alert>

   Use `kubectl` to delete the Deployment for $productName$ 2.0.5. Typically, this will be found
   in the `ambassador` namespace.

   ```
   kubectl delete -n ambassador deployment edge-stack
   ```

3. **Install $productName$ $versionTwoX$.**

   After installing the new CRDs, use Helm to install $productName$ $versionTwoX$. This will install
   in the `$productNamespace$` namespace. If necessary for your installation (e.g. if you were
   running with `AMBASSADOR_SINGLE_NAMESPACE` set), you can download `aes.yaml` and edit as
   needed.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$versionTwoX$/aes.yaml && \
   kubectl rollout status -n $productNamespace$ deployment/edge-stack -w
   ```
