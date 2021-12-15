import Alert from '@material-ui/lab/Alert';

# Upgrade to $AESproductName$

<Alert severity="info">
  The 2.X family introduces a number of changes to allow $productName$ to more gracefully handle
  larger installations (including multitenant or multiorganizational installations), reduce 
  memory footprint, and improve performance. In keeping with <a href="https://semver.org">SemVer</a>,
  $productName$ 2.X introduces some changes that aren't backward-compatible with 1.X, so <b>some
  configuration has changed</b> between 1.X and 2.X: if you're currently running 1.X, <b>please</b>&nbsp;
  read the <a href="/docs/emissary/latest/topics/install/migrate-to-version-2/">migration guide</a>&nbsp;
  before trying to install any 2.X version.<br/>
</Alert>

If you currently have the open source version of $OSSproductName$, you can upgrade to $AESproductName$ with a few simple commands. When you upgrade to $AESproductName$, you'll be able to access additional capabilities such as **automatic HTTPS/TLS termination, Swagger/OpenAPI support, API catalog, Single Sign-On, and more.** For more about the differences between $AESproductName$ and $OSSproductName$, see the [Editions page](/editions).

**Prerequisites**:

* You must have properly installed $OSSproductName$ previously following [these](/docs/emissary/$docsVersion$/topics/install) instructions.
* You must have TLS configured and working properly on your $OSSproductName$ instance

**To upgrade your instance of $OSSproductName$**:

1. [Apply the migration manifest](#1-apply-the-migration-manifest)
2. [Test the new Deployment](#2-test-the-new-deployment)
3. [Redirect traffic](#3-redirect-traffic)
4. [Delete the old Deployment](#4-delete-the-old-deployment)
5. [Update and restart](#5-update-and-restart)
6. [What's next?](#6-whats-next)

## Before you begin

Make sure that you **follow the steps in the given order** - not doing that might crash your $OSSproductName$ installation or make it inconsistent.

Check if you have an [`AuthService`](../../running/services/auth-service) or
[`RateLimitService`](../../running/services/rate-limit-service) installed. If
you do, make sure that they are using the [namespace-qualified DNS name](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services).
If they are not, the initial migration tests may fail.

## 1. Apply the migration CRDs.

   First, install $AESproductName$ alongside your existing $OSSproductName$ installation so you can test your workload against the new deployment.
   
   Note: **Make sure you apply the manifests in the same namespace as your current $OSSproductName$ installation.**
   We publish `aes-defaultns-migration.yaml` for if you have installed $OSSproductName$ in the `default` namespace,
   and `aes-emissaryns-migration.yaml` for if you have installed $OSSProductName$ in the `emissary` namespace. If 
   neither of these is correct for your installation, you'll need to download one of these files and edit it (it
   doesn't matter which one you pick; they are identical except for the namespace).
   
   For the `default` namespace (the default for $OSSproductName$ 1.X):

      ```
      kubectl apply -f https://app.getambassador.io/yaml/edge-stack/latest/aes-crds.yaml && \
      kubectl apply -f https://app.getambassador.io/yaml/edge-stack/latest/aes-defaultns-migration.yaml && \
      kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system 
      ```

   For the `emissary` namespace (the default for $OSSproductName$ 2.X):

      ```
      kubectl apply -f https://app.getambassador.io/yaml/edge-stack/latest/aes-crds.yaml && \
      kubectl apply -f https://app.getambassador.io/yaml/edge-stack/latest/aes-emissaryns-migration.yaml && \
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

## 2. **Install `Listener`s and `Host`s as needed.**

   An important difference between $productName$ 1.X and $productName$ $version$ is the
   new **mandatory** `Listener` CRD. Also, when running both installations side by side,
   you will need to make sure that a `Host` is present for the new $productName$ $version$
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

## 3. Test the new Deployment

At this point, you have $OSSproductName$ and $AESproductName$ running side by side in your cluster. $AESproductName$ is configured using the same configuration (Mappings, Modules, etc) as your current $OSSproductName$.

Get the IP address to connect to $AESproductName$ by running the following command:

```
kubectl get service test-aes -n emissary
```

Test that $AESproductName$ is working properly.

## 4. Redirect traffic

Once you’re satisfied with the new deployment, begin to route traffic to $AESproductName$.

Edit the current $OSSproductName$ service with `kubectl edit service ambassador` and change the
selector to

   ```
   app.kubernetes.io/instance: edge-stack
   app.kubernetes.io/name: edge-stack
   ```

## 4. Delete the old Deployment

You can now safely delete the older $OSSproductName$ deployment and $AESproductName$ service.

```
kubectl delete service/test-aes deploy/ambassador deploy/ambassador-agent
```

## 5. Update and restart

Apply the final resources and restart the $AESproductName$ pod for changes to take effect. **Again, our
published `resources-migration.yaml` assumes that you are using the `default` namespace**; if you are
using a different namespace, you'll need to download and edit the file.

```
kubectl apply -f https://app.getambassador.io/yaml/edge-stack/latest/resources-migration.yaml && \
kubectl rollout restart deployment/aes
```

## 6. What's next?

Now that you have $AESproductName$ up and running, check out the [Getting Started](../../../../../edge-stack/latest/tutorials/getting-started) guide for recommendations on what to do next and take full advantage of its features.
