# Install with Helm

[Helm](https://helm.sh) is a package manager for Kubernetes that automates the release and management of software on Kubernetes. $productName$ can be installed via a Helm chart with a few simple steps, depending on if you are deploying for the first time, upgrading $productName$ from an existing installation, or migrating from $productName$.

## Before you begin

The $productName$ Helm chart is hosted by Datawire and published at `https://www.getambassador.io`.

Start by adding this repo to your helm client with the following command:

```
helm repo add datawire https://www.getambassador.io
```

Both Helm 2 and Helm 3 are supported. To enable CRD creation in Helm 2, the `crd-install` hook is included in the CRD manifests. When installing with Helm 3, the following message will be output to `stderr`:
```
manifest_sorter.go:175: info: skipping unknown hook: "crd-install"
```
Since this hook is required for Helm 2 support it **IS NOT AN ERROR AND CAN BE SAFELY IGNORED**.

## Install with Helm

When you run the Helm chart, it installs $productName$. You can
deploy it with either version of the tool. 

1. If you are installing $productName$ **for the first time on your cluster**, create the `ambassador` namespace for $productName$:

   ```
   kubectl create namespace ambassador
   ```

2. **Helm 3 users:** Install the $productName$ Chart with the following command:

   ```
   helm install ambassador --namespace ambassador datawire/ambassador
   ```

3. **Helm 2 users**: Install the $productName$ Chart with the following command:

   ```
   helm install --name ambassador --namespace ambassador datawire/ambassador
   ```

4. Finish the installation by running the following command: `edgectl install` (optional) \*
5. Provide an email address when prompted to receive notices if your domain or TLS certificate is about to expire. (optional)

  Your terminal should print something similar to the following:
  ```
     $ edgectl install
     -> Installing $productName$ 1.0.
     -> Existing $productName$ installation detected.
     -> Automatically configuring TLS.
     Please enter an email address. We’ll use this email address to notify you prior to domain and certification expiration [None]: john@example.com.
     -> Obtaining a TLS certificate from Let’s Encrypt.  

     Congratulations, you’ve successfully installed $productName$ in your Kubernetes cluster. Visit https://random-word.edgestack.me to access your $productName$ installation and for additional configuration.
  ```  

  \* [Edge Control](../../using/edgectl/edge-control) (`edgectl`) automatically configures TLS for your instance and provisions a domain name for your $productName$.  This is not necessary if you already have a domain name and certificates.  

  This will install the necessary deployments, RBAC, Custom Resource Definitions, etc. for $productName$ to route traffic. Details on how to configure $productName$ using the Helm chart can be found in the Helm chart [README](https://github.com/datawire/ambassador/tree/master/charts/ambassador).

6. [Set up Service Catalog](../../../tutorials/getting-started/#2-routing-traffic-from-the-edge) to view all of your service metadata in Ambassador Cloud.

## Upgrading an existing $productName$ installation

**Note:** If your existing installation is running $OSSproductName$, **do not use these instructions**. See [Migrating to $AESproductName$](#migrating-to-the-ambassador-edge-stack) instead.

Upgrading an existing installation of $productName$ is a two-step process:

1. First, apply any CRD updates (as of Helm 3, this is not supported in the chart itself):

   ```
   kubectl apply -f https://www.getambassador.io/yaml/aes-crds.yaml
   ```

2. Next, upgrade $productName$ itself:

   ```
   helm upgrade ambassador datawire/ambassador
   ```

  This will upgrade the image and deploy and other necessary resources for $productName$.

3. [Set up Service Catalog](../../../tutorials/getting-started/#3-connect-your-cluster-to-ambassador-cloud) to view all of your service metadata in Ambassador Cloud.

## Migrating to $AESproductName$

If you have an existing $OSSproductName$ installation but are not yet running $AESproductName$, the upgrade process is somewhat different than above.

**Note:** It is strongly encouraged for you to move your $OSSproductName$ release to the `ambassador` namespace as shown below. If this isn't an option for you, remove the `--namespace ambassador` argument to `helm upgrade`.

1. Upgrade CRDs for $productName$.

   To take full advantage of $productName$, you'll need the new `Host` CRD, and you'll need the new `getambassador.io/v2` version of earlier CRDs. To upgrade all the CRDs, run

   ```
   kubectl apply -f https://www.getambassador.io/yaml/aes-crds.yaml
   ```

2. Upgrade your $productName$ installation.

   If you're using **Helm 3**, simply run

   ```
   helm upgrade --namespace ambassador ambassador datawire/ambassador
   ```

   If you're using **Helm 2**, you need to modify the command slightly:

   ```
   helm upgrade --set crds.create=false --namespace ambassador ambassador datawire/ambassador
   ```

At this point, $AESproductName$ should be running with the same functionality as $OSSproductName$ as well as the added features of $AESproductName$. It's safe to do any validation required and roll-back if necessary.

**Note:** $AESproductName$ will be installed with an `AuthService` and `RateLimitService`. If you are using these plugins, set `authService.create=false` and/or `rateLimit.create=false` to avoid any conflict while testing the upgrade.
