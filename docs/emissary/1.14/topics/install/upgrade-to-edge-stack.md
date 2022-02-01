# Upgrade to $AESproductName$

If you currently have the open source version of $OSSproductName$, you can upgrade to $AESproductName$ with a few simple commands. When you upgrade to $AESproductName$, you'll be able to access additional capabilities such as **automatic HTTPS/TLS termination, Swagger/OpenAPI support, API catalog, Single Sign-On, the Edge Policy Console UI, and more.** For more about the differences between $AESproductName$ and $OSSproductName$, see the [Editions page](/editions).

## Upgrading on supported Kubernetes environments

`edgectl` can automate the upgrade from installations that match the following criteria:

* $OSSproductName$ has been installed (and is still managed by) the
  [Ambassador Operator](../../install/aes-operator/).
* the `AmbassadorInstallation` has:
  * the `ambassador` name and `ambassador` namespace
  * `installOSS: true`

> **Note:** It is always advised to migrate your install of $OSSproductName$ to the `ambassador` namespace before upgrading to $AESproductName$ with any method.

First, install `edgectl` by following the instructions
[here](/docs/edge-stack/latest/topics/using/edgectl/edge-control/#installing-edge-control).

Then, use the following command to upgrade the $OSSproductName$ installation to $AESproductName$:

```
edgectl upgrade
```

## Upgrading from other installations

**Prerequisites**:

* You must have properly installed $OSSproductName$ previously following [these](../install-ambassador-oss) instructions.
* You must have TLS configured and working properly on your $OSSproductName$ instance

**To upgrade your instance of $OSSproductName$**:

1. [Apply the migration manifest](#1-apply-the-migration-manifest)
2. [Test the new Deployment](#2-test-the-new-deployment)
3. [Redirect traffic](#3-redirect-traffic)
4. [Delete the old Deployment](#4-delete-the-old-deployment)
5. [Update and restart](#5-update-and-restart)
6. [Access the Edge Policy Console](#6-access-the-edge-policy-console)
7. [What's next?](#7-whats-next)

## Before you begin

Make sure that you follow the steps in the given order - not doing that might crash your $OSSproductName$ installation or make it inconsistent.

Check if you have an [`AuthService`](../../running/services/auth-service) or
[`RateLimitService`](../../running/services/rate-limit-service) installed. If
you do, make sure that they are using the [namespace-qualified DNS name](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services).
If they are not, the initial migration tests may fail.

## 1. Apply the migration manifest

First, install $AESproductName$ alongside your existing $OSSproductName$ installation so you can test your workload against the new deployment.

Note: Make sure you apply the manifests in the same namespace as your current $OSSproductName$ installation.

Use the following command to install $AESproductName$, replacing `<namespace>` appropriately:

```
kubectl apply -n <namespace> -f https://app.getambassador.io/yaml/ambassador-docs/$version$/oss-migration.yaml
```

## 2. Test the new Deployment

At this point, you have $OSSproductName$ and $AESproductName$ running side by side in your cluster. $AESproductName$ is configured using the same configuration (Mappings, Modules, etc) as your current $OSSproductName$.

Get the IP address to connect to $AESproductName$ by running the following command:
`kubectl get service test-aes -n <namespace>`

Test that $AESproductName$ is working properly.

## 3. Redirect traffic

Once you’re satisfied with the new deployment, update your current $OSSproductName$ service to redirect traffic to $AESproductName$.

Edit the current $OSSproductName$ service with `kubectl edit service -n <namespace> ambassador` and change the selector to `product: aes`.

## 4. Delete the old Deployment

You can now safely delete the older $OSSproductName$ deployment and $AESproductName$ service.

```
kubectl delete deployment -n <namespace> ambassador
kubectl delete service -n <namespace> test-aes
```

## 5. Update and restart

Apply the new CRDs, resources and restart the $AESproductName$ pod for changes to take effect:

```
kubectl apply -n <namespace> -f https://app.getambassador.io/yaml/ambassador-docs/$version$/aes-crds.yaml && \
kubectl apply -n <namespace> -f https://app.getambassador.io/yaml/ambassador-docs/$version$/resources-migration.yaml && \
kubectl rollout restart deployment/aes
```

## 6. Access the Edge Policy Console

You can now access the Edge Policy Console with the following options:
* `edgectl login -n <namespace> <AES_host>` or
* `https://{{AES_URL}}/edge_stack/admin`

## 7. What's next?

Now that you have $AESproductName$ up and running, check out the [Getting Started](../../../tutorials/getting-started) guide for recommendations on what to do next and take full advantage of its features.
