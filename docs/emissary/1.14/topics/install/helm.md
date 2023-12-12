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

1. **Helm 3 users:** Install the $productName$ Chart with the following command:

   ```
   helm install ambassador datawire/ambassador --set enableAES=false
   ```

2. **Helm 2 users**: Install the $productName$ Chart with the following command:

   ```
   helm install --name ambassador datawire/ambassador --set enableAES=false
   ```

3. [Set up Service Catalog](../../../tutorials/getting-started/#2-routing-traffic-from-the-edge) to view all of your service metadata in Ambassador Cloud.

## Create a Mapping

In a typical configuration workflow, Custom Resource Definitions (CRDs) are used to define the intended behavior of $productName$. In this example, we'll deploy a sample service and create a `Mapping` resource. Mappings allow you to associate parts of your domain with different URLs, IP addresses, or prefixes.

1. First, apply the YAML for the [“Quote of the Moment" service](https://github.com/datawire/quote).

  ```
  kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/quickstart/qotm.yaml
  ```

2. Copy the configuration below and save it to a file called `quote-backend.yaml` so that you can create a Mapping on your cluster. This Mapping tells $productName$ to route all traffic inbound to the `/backend/` path to the `quote` Service.

  ```yaml
  ---
  apiVersion: getambassador.io/v2
  kind: Mapping
  metadata:
    name: quote-backend
  spec:
    prefix: /backend/
    service: quote

3. Apply the configuration to the cluster by typing the command `kubectl apply -f quote-backend.yaml`.

4. Grab the IP of your $productName$

   ```shell
   export EMISSARY_LB_ENDPOINT=$(kubectl get svc ambassador \
  -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
   ```

5. Test the configuration by typing `curl -Lk https://$EMISSARY_LB_ENDPOINT/backend/` or `curl -Lk https://<hostname>/backend/`. You should see something similar to the following:

   ```
   $ curl -Lk http://$EMISSARY_LB_ENDPOINT/backend/
   {
    "server": "idle-cranberry-8tbb6iks",
    "quote": "Non-locality is the driver of truth. By summoning, we vibrate.",
    "time": "2019-12-11T20:10:16.525471212Z"
   }

## A single source of configuration

In $productName$, Kubernetes serves as the single source of
configuration. This enables a consistent configuration workflow.

1. To see your mappings via the command line, run `kubectl get mappings`

2. If you created `Mappings` or other resources in another namespace, you can view them by adding `-n <namespace>` to the `kubectl get` command or add `-A` to view resources from every namespace. Without these flags, you will only see resources in the default namespace.

   ```
   $ kubectl get mappings
     NAME            SOURCE HOST   SOURCE PREFIX   DEST SERVICE   STATE   REASON
     quote-backend                 /backend/       quote
   ```

## Upgrading an existing $productName$ installation

**Note:** If your existing installation is running $OSSproductName$, **do not use these instructions**. See [Migrating to $AESproductName$](#migrating-to-aesproductname) instead.

Upgrading an existing installation of $productName$ is a two-step process:

1. First, apply any CRD updates (as of Helm 3, this is not supported in the chart itself):

   ```
   kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/aes-crds.yaml
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
   kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/aes-crds.yaml
   ```

2. Upgrade your $productName$ installation.

   If you're using **Helm 3**, simply run

   ```
   helm upgrade --namespace ambassador ambassador datawire/ambassador --set enableAES=true
   ```

   If you're using **Helm 2**, you need to modify the command slightly:

   ```
   helm upgrade --set crds.create=false --namespace ambassador ambassador datawire/ambassador --set enableAES=true
   ```

At this point, $AESproductName$ should be running with the same functionality as $OSSproductName$ as well as the added features of $AESproductName$. It's safe to do any validation required and roll-back if necessary.

**Note:** $AESproductName$ will be installed with an `AuthService` and `RateLimitService`. If you are using these plugins, set `authService.create=false` and/or `rateLimit.create=false` to avoid any conflict while testing the upgrade.

## Test your Mapping over HTTPS after upgrading to $AESproductName$

Upgrading to $AESproductName$ will provide automatic TLS support if you have not already configured it.

1. Grab the IP of your $AESproductName$
   - Note: Make sure to remove `-n ambassador` if you decided to not migrate to the `ambassador` namespace when upgrading to $AESproductName$

   ```shell
   export AMBASSADOR_LB_ENDPOINT=$(kubectl -n ambassador get svc ambassador \
  -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
   ```

2. Try submitting a request to the quote service that you deployed above

   ```
   $ curl -Lk https://$AMBASSADOR_LB_ENDPOINT/backend/
   {
     "server": "idle-cranberry-8tbb6iks",
     "quote": "Non-locality is the driver of truth. By summoning, we vibrate.",
     "time": "2021-02-26T15:55:06.884798988Z"
   }
   ```
