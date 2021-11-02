import Alert from '@material-ui/lab/Alert';

# Istio integration

$productName$ and Istio: Edge Proxy and Service Mesh together in one. $productName$ is deployed at the edge of your network and routes incoming traffic to your internal services (aka "north-south" traffic). [Istio](https://istio.io/) is a service mesh for microservices, and is designed to add application-level Layer (L7) observability, routing, and resilience to service-to-service traffic (aka "east-west" traffic). Both Istio and $productName$ are built using [Envoy](https://www.envoyproxy.io).

$productName$ and Istio can be deployed together on Kubernetes. In this configuration, $productName$ manages
traditional edge functions such as authentication, TLS termination, edge routing, and Istio mediates communication
from $productName$ to services, and communication between services.

This allows the operator to have the best of both worlds: a high performance, modern edge service ($productName$) combined with a state-of-the-art service mesh (Istio). While Istio has introduced a [Gateway](https://istio.io/docs/tasks/traffic-management/ingress/#configuring-ingress-using-an-istio-gateway) abstraction, $productName$ still has a much broader feature set for edge routing than Istio. For more on this topic, see our blog post on [API Gateway vs Service Mesh](https://blog.getambassador.io/api-gateway-vs-service-mesh-104c01fa4784).

This guide will explain how to take advantage of both $productName$ and Istio to have complete control and observability over how requests are made in your cluster. 

## Prerequisites

- A Kubernetes cluster version 1.15 and above
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Istio version 1.10 or higher

## Install Istio

Start by [installing Istio](https://istio.io/docs/setup/getting-started/). Any supported installation method for 
Istio will work for use with $productName$.

## Configure Istio Auto-Injection

Istio functions by supplying a sidecar container running Envoy with every service in the mesh (including
$productName$). The sidecar is what enforces Istio policies for traffic to and from the service, notably
including mTLS encryption and certificate handling. As such, it is very important that the sidecar be
correctly supplied for every service in the mesh!

While it is possible to manage sidecars by hand, it is far easier to allow Istio to automatically inject
the sidecar as necessary. To do this, set the `istio-injection` label on each Kubernetes Namespace for
which you want auto-injection:

```yaml
kubectl label namespace $namespace istio-injection=enabled --overwrite
```

<Alert severity="warning">
  The following example uses the istio-injection label to arrange auto-injection in the $productNamespace$. It is <b>critical</b> that you apply the the label to all Namespaces in which you install services.
</Alert>

## Install $productName$ with Istio Integration

Properly integrating $productName$ with Istio provides support for:

* [Mutual TLS (mTLS)](#mutual-tls), with certificates managed by Istio, to allow end-to-end encryption
for east-west traffic;
* Automatic generation of Prometheus metrics for services; and
* Istio distributed tracing for end-to-end observability.

The simplest way to enable everything is to install $productName$ using [Helm](https://helm.sh). It is of course also possible when using manual installation with YAML.

### Installation with Helm

To install with Helm, write the following YAML to a file called `istio-integration.yaml`:

```yaml
# Listeners are required in $productName$ 2.0. 
# This will create the two default Listeners for HTTP on port 8080 and HTTPS on port 8443.
createDefaultListeners: true

# These are annotations that will be added to the $productName$ pods.
podAnnotations:
  # These first two annotations tell Istio not to try to do port management for the
  # $productName$ pod itself. Though these annotations are placed on the $productName$
  # pods, they are interpreted by Istio.
  traffic.sidecar.istio.io/includeInboundPorts: ""      # do not intercept any inbound ports
  traffic.sidecar.istio.io/includeOutboundIPRanges: ""  # do not intercept any outbound traffic

  # We use proxy.istio.io/config to tell the Istio proxy to write newly-generated mTLS certificates
  # into /etc/istio-certs, which will be mounted below. Though this annotation is placed on the
  # $productName$ pods, it is interpreted by Istio.
  proxy.istio.io/config: |
    proxyMetadata:
      OUTPUT_CERTS: /etc/istio-certs

  # We use sidecar.istio.io/userVolumeMount to tell the Istio sidecars to mount the istio-certs
  # volume at /etc/istio-certs, allowing the sidecars to see the generated certificates. Though
  # this annotation is placed on the $productName$ pods, it is interpreted by Istio.
  sidecar.istio.io/userVolumeMount: '[{"name": "istio-certs", "mountPath": "/etc/istio-certs"}]' 

# We define a single storage volume called "istio-certs". It starts out empty, and Istio
# uses it to communicate mTLS certs between the Istio proxy and the Istio sidecars (see the
# annotations above).
volumes:
  - emptyDir:
      medium: Memory
    name: istio-certs

# We also tell $productName$ to mount the "istio-certs" volume at /etc/istio-certs in the 
# $productName$ pod. This gives $productName$ access to the mTLS certificates, too.
volumeMounts:
  - name: istio-certs
    mountPath: /etc/istio-certs/
    readOnly: true

# Finally, we need to set some environment variables for $productName$.
env:
  # AMBASSADOR_ISTIO_SECRET_DIR tells $productName$ to look for Istio mTLS certs, and to
  # make them available as a secret named "istio-certs".
  AMBASSADOR_ISTIO_SECRET_DIR: "/etc/istio-certs"

  # AMBASSADOR_ENVOY_BASE_ID is set to prevent collisions with the Istio sidecar's Envoy,
  # which runs with base-id 0.
  AMBASSADOR_ENVOY_BASE_ID: "1"
```

To install $productName$ with Helm, using these values to configure Istio integration:

1. Create the `$productNamespace$` Namespace:

    ```yaml
    kubectl create namespace $productNamespace$
    ```

2. Enable Istio auto-injection for it:

    ```yaml
    kubectl label namespace $productNamespace$ istio-injection=enabled --overwrite
    ```

3. Make sure the Helm repo is configured:

    ```bash
    helm repo add datawire https://app.getambassador.io
    helm repo update
    ```

4. Use Helm to install $productName$ in $productNamespace$:

    ```bash
    helm install $productHelmName$ --namespace $productNamespace$ -f istio-integration.yaml datawire/$productHelmName$ && \
    kubectl -n $productNamespace$ wait --for condition=available --timeout=90s deploy -lapp.kubernetes.io/instance=$productDeploymentName$
    ```

### Installation Using YAML

To install using YAML files, you need to manually incorporate the contents of the `istio-integration.yaml`
file shown above into your deployment YAML:

* `pod-annotations` should be configured as Kubernetes `annotations` on the $productName$ Pods;
* `volumes`, `volumeMounts`, and `env` contents should be included in the $productDeploymentName$ Deployment; and
* you must also label the $productNamespace$ Namespace for auto-injection as described above.

### Configuration After Installation

If you have already installed $productName$ and want to enable Istio:

1. Install Istio.
2. Label the $productNamespace$ namespace for Istio auto-injection, as above.
2. Edit the $productName$ Deployments to contain the `annotations`, `volumes`, `volumeMounts`, and `env` elements
   shown above.
    * If you installed with Helm, you can use `helm upgrade` with `-f istio-integration.yaml` to modify the 
      installation for you.
3. Restart the $productName$ pods.

## Using Mutual TLS

After configuring $productName$ for Istio integration, the Istio mTLS certificates are available within
$productName$:

- Both the `istio-proxy` sidecar and $productName$ mount the `istio-certs` volume at `/etc/istio-certs`.
- The `istio-proxy` sidecar saves the mTLS certificates into `/etc/istio-certs` (per the `OUTPUT_CERTS`
  environment variable).
- $productName$ reads the mTLS certificates from `/etc/istio-certs` (per the `AMBASSADOR_ISTIO_SECRET_DIR`
  environment variable) and creates a Secret named `istio-certs`.
   - At present, the Secret name `istio-certs` cannot be changed.

To make use of the `istio-certs` Secret, create a `TLSContext` referencing it:

```
$ kubectl apply -f - <<EOF
---
apiVersion: getambassador.io/v3alpha1
kind: TLSContext
metadata:
  name: istio-upstream
  namespace: $productNamespace$
spec:
  secret: istio-certs     # This Secret name cannot currently be changed.
  alpn_protocols: istio   # This is required for Istio.
EOF
```

Once the `TLSContext` is created, a `Mapping` can use it for TLS origination. An example might be:

```
---
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: mtls-mapping
spec:
  hostname: my-secret-host.example.com   # Make sure this matches a configured Host!
  prefix: /my-secret-mapping/
  tls: istio-upstream
```

This `Mapping` will use mTLS when communicating with its upstream service. For more details, see
[Routing to Services](#routing-to-services) below.

### Integrating Prometheus metrics collection

By default, the Istio sidecar provides Prometheus metrics using `prometheus.io` annotations. To take
advantage of these metrics, you need to [install Prometheus](../prometheus).

### Integrating distributed tracing

The Istio sidecar also supports [distributed tracing](https://istio.io/docs/tasks/observability/distributed-tracing/overview/)
by default. To take advantage of this support, you need to:

1. Install a tracing provider, for example [Zipkin](../tracing-zipkin) into your cluster.
2. Add a [`TracingService`](../../topics/running/services/tracing-service) to tell $productName$ to send tracing
   to your tracing provider, for example: 

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  TracingService
metadata:
  name:  tracing
  namespace: $productNamespace$
spec:
  service: "zipkin:9411"
  driver: zipkin
  config: {}
  tag_headers:
    - ":authority"
    - ":path"
```

After adding a `TracingService`, restart $productName$ for the configuration to take effect. Istio propagates
the tracing headers automatically, allowing for end-to-end observability within the cluster.

## Routing to services

Above, we integrated $productName$ with Istio to take advantage of end-to-end encryption and observability offered by Istio while leveraging the feature-rich edge routing capabilities of $productName$.

Now we will show how you can use $productName$ to route to services in the Istio service mesh.

1. Label the default namespace for [automatic sidecar injection](https://istio.io/docs/setup/additional-setup/sidecar-injection/#automatic-sidecar-injection)

   ```
   kubectl label namespace default istio-injection=enabled
   ```

   This will tell Istio to automatically inject the `istio-proxy` sidecar container into pods in this namespace.

2. Install the quote example service

   ```
   kubectl apply -n default -f https://getambassador.io/yaml/backends/quote.yaml
   ```

   Wait for the pod to start and see that there are two containers: the `quote` application and the `istio-proxy` sidecar.

   ```
   $ kubectl get po -n default 

   NAME                     READY   STATUS    RESTARTS   AGE
   quote-6bc6b6bd5d-jctbh   2/2     Running   0          91m
   ```

3. Route to the service

   Traffic routing in $productName$ is configured with the [`Mapping`](../../topics/using/intro-mappings) resource. This is a powerful configuration object that lets you configure different routing rules for different services. 

   The above `kubectl apply` installed the following basic `Mapping` which has configured $productName$ to route traffic with URL prefix `/backend/` to the `quote` service.

   ```yaml
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: quote-backend
   spec:
     hostname: "*"
     prefix: /backend/
     service: quote
   ```

   Since we have integrated $productName$ with Istio, we can tell it to use the mTLS certificates to encrypt requests to the quote service.

   Simply do that by updating the above `Mapping` with the following one.

   ```
   $ kubectl apply -f - <<EOF
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: quote-backend
   spec:
     hostname: "*"
     prefix: /backend/
     service: quote
     tls: istio-upstream
   EOF
   ```

   Send a request to the quote service using curl:

   ```
   $ curl -k https://{{AMBASSADOR_HOST}}/backend/

   {
       "server": "bewitched-acai-5jq7q81r",
       "quote": "A late night does not make any sense.",
       "time": "2020-06-02T10:48:45.211178139Z"
   }
   ```

   While the majority of the work being done is transparent to the user, you have successfully sent a request to $productName$ which routed it to the quote service in the default namespace. It was then intercepted by the `istio-proxy` which authenticated the request from $productName$ and exported various metrics and finally forwarded it on to the  quote service.

## Enforcing authentication between containers

Istio defaults to PERMISSIVE mTLS that does not require authentication between containers in the cluster. Configuring STRICT mTLS will require all connections within the cluster be encrypted.

1. Configure Istio in [STRICT mTLS](https://istio.io/docs/tasks/security/authentication/authn-policy/#globally-enabling-istio-mutual-tls-in-strict-mode) mode.

   ```
   $ kubectl apply -f - <<EOF
   apiVersion: security.istio.io/v1beta1
   kind: PeerAuthentication
   metadata:
     name: default
     namespace: istio-system
   spec:
     mtls:
       mode: STRICT   
   EOF
   ```

   This will enforce authentication for all containers in the mesh.

   We can test this by removing the `tls` configuration from the quote-backend `Mapping`
   and sending a request.

   ```
   $ kubectl apply -f - <<EOF
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: quote-backend
   spec:
     hostname: "*"
     prefix: /backend/
     service: quote
   EOF
   ```

   ```
   $ curl -k https://{{AMBASSADOR_HOST}}/backend/
   
   upstream connect error or disconnect/reset before headers. reset reason: connection termination
   ```


2. Configure $productName$ to use mTLS certificates

   As we have demonstrated above we can tell $productName$ to use the mTLS certificates from Istio to authenticate with the `istio-proxy` in the quote pod.

   ```
   $ kubectl apply -f - <<EOF
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: quote-backend
   spec:
     hostname: "*"
     prefix: /backend/
     service: quote
     tls: istio-upstream
   EOF
   ```

   Now $productName$ will use the Istio mTLS certificates when routing to the `quote` service. 

   ```
   $ curl -k https://{{AMBASSADOR_HOST}}/backend/
   {
       "server": "bewitched-acai-5jq7q81r",
       "quote": "Non-locality is the driver of truth. By summoning, we vibrate.",
       "time": "2020-06-02T11:06:53.854468941Z"
   }
   ```

## FAQ

### How to test Istio certificate rotation

Istio mTLS certificates, by default, will be valid for a max of 90 days but will be rotated every day.

$productName$ will watch and update the mTLS certificates as they rotate so you will not need to worry about certificate expiration. 

To test that $productName$ is properly rotating certificates, shorten the TTL of the Istio certificates by 
setting the following environment variables in the `istiod` container in the `istio-system` Namespace:

```yaml
env:
- name: DEFAULT_WORKLOAD_CERT_TTL
  value: 30m
- name: MAX_WORKLOAD_CERT_TTL
  value: 1h
```

This will make the certificates Istio issues expire in one hour so testing certificate rotation is much easier.
