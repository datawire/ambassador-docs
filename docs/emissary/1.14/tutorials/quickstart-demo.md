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
so that you can create a `Mapping` on your cluster. This `Mapping` tells $productName$ to route all traffic inbound to the `/backend/` path to the `quote` service.

  ```yaml
  ---
  apiVersion: getambassador.io/v2
  kind: Mapping
  metadata:
    name: quote-backend
  spec:
    prefix: /backend/
    service: quote
  ```

1. Apply the configuration to the cluster with the command
`kubectl apply -f quote-backend.yaml`

1. Store the $productName$ `LoadBalancer` address to a local environment variable.
You will use this variable to test accessing your pod.

  ```
  export EMISSARY_LB_ENDPOINT=$(kubectl get svc ambassador -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
  ```

1. Test the configuration by accessing the service through the $productName$ load
balancer.

  ```
  $ curl -Lk "http://$EMISSARY_LB_ENDPOINT/backend/"
  {
   "server": "idle-cranberry-8tbb6iks",
   "quote": "Non-locality is the driver of truth. By summoning, we vibrate.",
   "time": "2019-12-11T20:10:16.525471212Z"
  }
  ```

Success, you have created your first $productName$ `Mapping`, routing a
request from your cluster's edge to a service!

## 2. $productName$'s diagnostics

$productName$ provides live diagnostics viewable with a web browser. While this would normally not be exposed to the public network, the Docker demo publishes the diagnostics service at the following URL:

`http://localhost:8080/ambassador/v0/diag/`

You'll have to authenticate to view this page: use the username `admin`,
password `admin` (obviously this would be a poor choice in the real world!).
We'll talk more about authentication shortly.

To access the Diagnostics page with authentication, use `curl http://localhost:8080/ambassador/v0/diag/ -u admin:admin`

Some of the most important information - your $productName$ version, how recently $productName$'s configuration was updated, and how recently Envoy last reported status to $productName$ - is right at the top. The diagnostics overview can show you what it sees in your configuration map, and which Envoy objects were created based on your configuration.

## Next Steps

Further explore some of the concepts you learned about in this article:
* [`Mapping` resource](../../topics/using/intro-mappings/): routes traffic from
the edge of your cluster to a Kubernetes service
* [`Host` resource](../../topics/running/host-crd/): sets the hostname by which
$productName$ will be accessed and secured with TLS certificates
* [Edge Policy Console](/docs/edge-stack/latest/topics/using/edge-policy-console/): a web-based
interface used to configure and monitor $productName$
* [Developer Portal](/docs/edge-stack/latest/topics/using/dev-portal/):
publishes an API catalog and OpenAPI documentation

$productName$ has a comprehensive range of [features](/features/) to
support the requirements of any edge microservice.

Learn more about [how developers use $productName$](../../topics/using/) to manage
edge policies.

Learn more about [how site reliability engineers and operators run $productName$](../../topics/running/)
in production environments.

To learn how $productName$ works, use cases, best practices, and more, check out
the [Quick Start page](../../tutorials/getting-started/) or read the [$productName$ Story](../../about/why-ambassador).

For a custom configuration, you can install $productName$
[manually](../../topics/install/yaml-install).
