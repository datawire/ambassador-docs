# Install with Helm

[Helm](https://helm.sh) is a package manager for Kubernetes that automates the release and management of software on Kubernetes. $productName$ can be installed via a Helm chart with a few simple steps, depending on if you are deploying for the first time, upgrading $productName$ from an existing installation, or migrating from $productName$.

## Before you begin

The $productName$ Helm chart is hosted by Datawire and published at `https://app.getambassador.io`.

Start by adding this repo to your helm client with the following command:

```
helm repo add datawire https://app.getambassador.io
```

Only Helm 3 is supported. At present, the `crd-install` hook is still included in the CRD manifests as a holdover from Helm 2, so the following message on `stderr` **IS NOT AN ERROR AND CAN BE SAFELY IGNORED**:
```
manifest_sorter.go:175: info: skipping unknown hook: "crd-install"
```

## Install with Helm

1. If you are installing $productName$ **for the first time on your cluster**, create the `ambassador` namespace for $productName$:

   ```
   kubectl create namespace ambassador
   ```

2. Install the $productName$ Chart with the following command:

   ```
   helm install emissary --namespace ambassador datawire/emissary
   ```

  This will install the necessary deployments, RBAC, Custom Resource Definitions, etc. for $productName$ to route traffic. Details on how to configure $productName$ using the Helm chart can be found in the Helm chart [README](https://github.com/emissary-ingress/emissary/tree/$branch$/charts/emissary-ingress).

6. [Set up Service Catalog](../../../tutorials/getting-started/#2-routing-traffic-from-the-edge) to view all of your service metadata in Ambassador Cloud.

## Upgrading an existing installation

**Note: Do not use these instructions** to migrate from $OSSproductName$ to $AESproductName$. See [Migrating to $AESproductName$](#migrating-to-the-ambassador-edge-stack) instead.

Upgrading an existing installation of $productName$ is a two-step process:

1. First, apply any CRD updates:

   ```
   kubectl apply -f https://app.getambassador.io/yaml/emissary/$version$/emissary-crds.yaml
   ```

2. Next, upgrade $productName$ itself:

   ```
   helm upgrade emissary datawire/emissary
   ```

  This will upgrade the image and deploy and other necessary resources for $productName$.

3. [Set up Service Catalog](../../../tutorials/getting-started/#3-connect-your-cluster-to-ambassador-cloud) to view all of your service metadata in Ambassador Cloud.

## Migrating to $AESproductName$

If you have an existing $OSSproductName$ installation but are not yet running $AESproductName$, the upgrade process is somewhat different than above.

**Note:** It is strongly encouraged for you to move your $OSSproductName$ release to the `ambassador` namespace as shown below. If this isn't an option for you, remove the `--namespace ambassador` argument to `helm upgrade`.

1. Upgrade CRDs for $productName$.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes-crds.yaml
   ```

2. Upgrade your $productName$ installation.

   ```
   helm upgrade --namespace ambassador ambassador datawire/edge-stack
   ```

At this point, $AESproductName$ should be running with the same functionality as $OSSproductName$ as well as the added features of $AESproductName$. It's safe to do any validation required and roll-back if necessary.

**Note:** $AESproductName$ will be installed with an `AuthService` and `RateLimitService`. If you are using these plugins, set `authService.create=false` and/or `rateLimit.create=false` to avoid any conflict while testing the upgrade.
