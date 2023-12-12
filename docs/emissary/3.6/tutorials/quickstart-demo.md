# $productName$ Tutorial

In this article, you will explore some of the key features of $productName$ by walking through an example workflow and exploring the
Edge Policy Console.

## Prerequisites

You must have [$productName$ installed](../getting-started/) in your
Kubernetes cluster.

## Routing Traffic from the Edge

Like any other Kubernetes object, Custom Resource Definitions (CRDs) are used to
declaratively define $productName$’s desired state. The workflow you are going to
build uses a sample deployment and the `Mapping` CRD, which is the core resource
that you will use with $productName$ to manage your edge. It enables you to route
requests by host and URL path from the edge of your cluster to Kubernetes services.

1. Copy the configuration below and save it to a file named `quote.yaml` so that
you can deploy these resources to your cluster. This basic configuration creates
the `quote` deployment and a service to expose that deployment on port 80.

  ```yaml
  ---
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: quote
    namespace: ambassador
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: quote
    strategy:
      type: RollingUpdate
    template:
      metadata:
        labels:
          app: quote
      spec:
        containers:
        - name: backend
          image: docker.io/datawire/quote:$quoteVersion$
          ports:
          - name: http
            containerPort: 8080
  ---
  apiVersion: v1
  kind: Service
  metadata:
    name: quote
    namespace: ambassador
  spec:
    ports:
    - name: http
      port: 80
      targetPort: 8080
    selector:
      app: quote
  ```

1. Apply the configuration to the cluster with the command `kubectl apply -f quote.yaml`.

1. Copy the configuration below and save it to a file called `quote-backend.yaml`
so that you can create a `Mapping` on your cluster. This `Mapping` tells $productName$ to route all traffic inbound to the `/backend/` path, on any host that can be used to reach $productName$, to the `quote` service.

  ```yaml
  ---
  apiVersion: getambassador.io/v3alpha1
  kind: Mapping
  metadata:
    name: quote-backend
    namespace: ambassador
  spec:
    hostname: "*"
    prefix: /backend/
    service: quote
  ```

1. Apply the configuration to the cluster with the command
`kubectl apply -f quote-backend.yaml`

1. Store the $productName$ `LoadBalancer` address to a local environment variable.
You will use this variable to test accessing your pod.

  ```
  export AMBASSADOR_LB_ENDPOINT=$(kubectl -n ambassador get svc ambassador -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
  ```

1. Test the configuration by accessing the service through the $productName$ load
balancer.

  ```
  $ curl -Lk "https://$AMBASSADOR_LB_ENDPOINT/backend/"
  {
   "server": "idle-cranberry-8tbb6iks",
   "quote": "Non-locality is the driver of truth. By summoning, we vibrate.",
   "time": "2019-12-11T20:10:16.525471212Z"
  }
  ```

Success, you have created your first $productName$ `Mapping`, routing a
request from your cluster's edge to a service!

Since the `Mapping` you just created controls how requests are routed,
changing the `Mapping` will immediately change the routing.  To see this
in action, use `kubectl` to edit the `Mapping`:

1. Run `kubectl edit Mapping quote-backend`.

1. Change `prefix: /backend/` to `prefix: /quoteme/`.

1. Save the file and let `kubectl` update your `Mapping`.

1. Run `kubectl get Mappings --namespace ambassador`. You will see the
`quote-backend` `Mapping` has the updated prefix listed. Try to access the
endpoint again via `curl` with the updated prefix.

  ```
  $ kubectl get Mappings --namespace ambassador
  NAME            PREFIX      SERVICE   STATE   REASON
  quote-backend   /quoteme/   quote

  $ curl -Lk "https://${AMBASSADOR_LB_ENDPOINT}/quoteme/"
  {
      "server": "snippy-apple-ci10n7qe",
      "quote": "A principal idea is omnipresent, much like candy.",
      "time": "2020-11-18T17:15:42.095153306Z"
  }
  ```

1. Change the prefix back to `/backend/` so that you can later use the `Mapping`
with other tutorials.

## Developer API Documentation

The `quote` service you just deployed publishes its API as an
[OpenAPI (formerly Swagger)](https://swagger.io/solutions/getting-started-with-oas/)
document. $productName$ automatically detects and publishes this documentation.
This can help with internal and external developer onboarding by serving as a
single point of reference for of all your microservice APIs.

1. In the Edge Policy Console, navigate to the **APIs** tab. You'll see the
OpenAPI documentation there for the "Quote Service API." Click **GET** to
expand out the documentation.

1. Navigate to `https://<load-balancer-endpoint>/docs/` to see the
publicly visible Developer Portal. Make sure you include the trailing `/`.
This is a fully customizable portal that you can share with third parties who
need information about your APIs.

## Next Steps

Further explore some of the concepts you learned about in this article:
* [`Mapping` resource](../../topics/using/intro-mappings/): routes traffic from
the edge of your cluster to a Kubernetes service
* [`Host` resource](../../topics/running/host-crd/): sets the hostname by which
$productName$ will be accessed and secured with TLS certificates
* [Developer Portal](../../tutorials/dev-portal-tutorial/):
publishes an API catalog and OpenAPI documentation

$productName$ has a comprehensive range of [features](/features/) to
support the requirements of any edge microservice.

Learn more about [how developers use $productName$](../../topics/using/) to manage
edge policies.

Learn more about [how site reliability engineers and operators run $productName$](../../topics/running/)
in production environments.

To learn how $productName$ works, use cases, best practices, and more, check out
the [Quick Start](../getting-started) or read the [$productName$ Story](../../about/why-ambassador).

For a custom configuration, you can install $productName$
[manually](../../topics/install/yaml-install).
