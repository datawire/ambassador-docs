import Alert from '@material-ui/lab/Alert';

# Upgrade $productName$ 3.3.Z to $productName$ $version$ (YAML)

<Alert severity="info">
  This guide covers migrating from $productName$ 3.3.Z to $productName$ $version$. If
  this is not your <b>exact</b> situation, see the <a href="../../../../migration-matrix">migration
  matrix</a>.
</Alert>

<Alert severity="warning">
  This guide is written for upgrading an installation made without using Helm.
  If you originally installed with Helm, see the <a href="../../../helm/edge-stack-3.3/edge-stack-3.X">Helm-based
  upgrade instructions</a>.
</Alert>

Since $productName$'s configuration is entirely stored in Kubernetes resources, upgrading between
versions is straightforward.

### Resources to check before migrating to $version$.

<Alert severity="warning">
  As of $productName$ 3.4.Z, the <code>LightStep</code> tracing driver is no longer supported. To ensure you do not drop any tracing data, be sure to read below before upgrading.
</Alert>

$productName$ 3.4 has been upgraded from Envoy 1.23 to Envoy 1.24.1 which removed support for the `LightStep` tracing driver. The team at LightStep and the maintainers of Envoy-Proxy recommend that users instead leverage the OpenTelemetry Collector to send tracing information to LightStep. We have written a guide which can be found here <a href="/docs/emissary/3.4/howtos/tracing-lightstep">Distributed Tracing with OpenTelemetry and Lightstep</a> that outlines how to set this up. **It is important that you follow this upgrade path prior to upgrading or you will drop tracing data.**

## Migration Steps

Migration is a two-step process:

1. **Install new CRDs.**

   After reviewing the changes in 3.x and confirming that you are ready to upgrade, the process is the same as upgrading minor versions
   in previous version of $productName$ and does not require the complex migration steps that the migration from 1.x tto 2.x required.

   Before installing $productName$ $version$ itself, you need to update the CRDs in
   your cluster. This is mandatory during any upgrade of $productName$.

   ```bash
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes-crds.yaml
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
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes.yaml && \
   kubectl rollout status -n $productNamespace$ deployment/edge-stack -w
   ```
