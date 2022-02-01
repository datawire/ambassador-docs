---
    description: In this guide, we'll walk through the process of deploying $productName$ in Kubernetes for ingress routing.
---
# Install manually

In this guide, we'll walk you through installing, configuring, and customizing
$productName$ in your Kubernetes cluster.

The manual install process does require more user configuration than the [quick
start method](../../../tutorials/getting-started/), but it does allow you to control the
aspects of your base $productName$ installation.

## Before you begin

$productName$ is designed to run in Kubernetes for production. The most essential requirements are:

* Kubernetes 1.11 or later
* The `kubectl` command-line tool

## Install $productName$

$productName$ is typically deployed to Kubernetes from the command line. If you don't have Kubernetes, you should use our [Docker](../docker) image to deploy $productName$ locally.

1. In your terminal, run the following command:

    ```
    kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/ambassador/ambassador-crds.yaml && \
    kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/ambassador/ambassador-rbac.yaml && \
    kubectl apply -f - <<EOF
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: ambassador
    spec:
      type: LoadBalancer
      externalTrafficPolicy: Local
      ports:
      - port: 80
        targetPort: 8080
      selector:
        service: ambassador
    EOF
    ```

2. Determine the IP address or hostname of your cluster by running the following command:

    ```
    kubectl get service ambassador -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}"
    ```

    Your load balancer may take several minutes to provision your IP address. Repeat the provided command until you get an IP address.

    Note: If you are a **Minikube user**, Minikube does not natively support load balancers. Instead, use `minikube service list`. You should see something similar to the following:

    ```
    (⎈ |minikube:ambassador)$ minikube service list
    |-------------|------------------|--------------------------------|
    |  NAMESPACE  |       NAME       |              URL               |
    |-------------|------------------|--------------------------------|
    | ambassador  | ambassador       | http://192.168.64.2:31230      |
    |             |                  | http://192.168.64.2:31042      |
    | ambassador  | ambassador-admin | No node port                   |
    | ambassador  | ambassador-redis | No node port                   |
    | default     | kubernetes       | No node port                   |
    | kube-system | kube-dns         | No node port                   |
    |-------------|------------------|--------------------------------|
    ```

    Use any of the URLs listed next to `ambassador` to access $productName$.

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

## View your Service metadata using Service Catalog

[Set up Service Catalog](../../../tutorials/getting-started/#3-connect-your-cluster-to-ambassador-cloud) to view all of your service metadata in Ambassador Cloud.

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

## What’s next?

$productName$ has a comprehensive range of [features](/features/) to support the requirements of any edge microservice.
