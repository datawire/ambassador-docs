import Alert from '@material-ui/lab/Alert';

# Istio integration

$productName$ and Istio: Edge Proxy and Service Mesh together in one. $productName$ is deployed at the edge of your network and routes incoming traffic to your internal services (aka "north-south" traffic). [Istio](https://istio.io/) is a service mesh for microservices, and is designed to add application-level Layer (L7) observability, routing, and resilience to service-to-service traffic (aka "east-west" traffic). Both Istio and $productName$ are built using [Envoy](https://www.envoyproxy.io).

$productName$ and Istio can be deployed together on Kubernetes. In this configuration, $productName$ manages
traditional edge functions such as authentication, TLS termination, and edge routing. Istio mediates communication
from $productName$ to services, and communication between services.

This allows the operator to have the best of both worlds: a high performance, modern edge service ($productName$) combined with a state-of-the-art service mesh (Istio). While Istio has introduced a [Gateway](https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/) abstraction, $productName$ still has a much broader feature set for edge routing than Istio. For more on this topic, see our blog post on [API Gateway vs Service Mesh](https://blog.getambassador.io/api-gateway-vs-service-mesh-104c01fa4784).

This guide explains how to take advantage of both $productName$ and Istio to have complete control and observability over how requests are made in your cluster:

- [Install Istio](#install-istio) and configure auto-injection
- [Install $productName$ with Istio integration](#install-edge)
- [Configure an mTLS `TLSContext`](#configure-an-mtls-tlscontext)
- [Route to services using mTLS](#route-to-services-using-mtls)

If desired, you may also

- [Enable strict mTLS](#enable-strict-mtls)
- [Configure Prometheus metrics collection](#configure-prometheus-metrics-collection)
- [Configure Istio distributed tracing](#configure-istio-distributed-tracing)

To follow this guide, you need:

- A Kubernetes cluster version 1.15 and above
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Istio version 1.10 or higher

## Install Istio

Start by [installing Istio](https://istio.io/docs/setup/getting-started/). Any supported installation method for
Istio will work for use with $productName$.

### Configure Istio Auto-Injection

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
  The following example uses the `istio-injection` label to arrange for auto-injection in the
  `$productNamespace$` Namespace below. You can manage sidecar injection by hand if you wish; what
  is <b>critical</b> is that every service that participates in the Istio mesh have the Istio
  sidecar.
</Alert>

## <a name="install-edge"></a> Install $productName$ with Istio Integration

Properly integrating $productName$ with Istio provides support for:

* [Mutual TLS (mTLS)](../../topics/running/tls/mtls), with certificates managed by Istio, to allow end-to-end encryption
for east-west traffic;
* Automatic generation of Prometheus metrics for services; and
* Istio distributed tracing for end-to-end observability.

The simplest way to enable everything is to install $productName$ using [Helm](https://helm.sh), though
you can use manual installation with YAML if you wish.

### Installation with Helm (Recommended)

To install with Helm, write the following YAML to a file called `istio-integration.yaml`:

```yaml
# All of the values we need to customize live under the emissary-ingress toplevel key.
emissary-ingress:
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

To install $productName$ with Helm, use these values to configure Istio integration:

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

### Configuring an Existing Installation

If you have already installed $productName$ and want to enable Istio:

1. Install Istio.
2. Label the $productNamespace$ namespace for Istio auto-injection, as above.
2. Edit the $productName$ Deployments to contain the `annotations`, `volumes`, `volumeMounts`, and `env` elements
   shown above.
    * If you installed with Helm, you can use `helm upgrade` with `-f istio-integration.yaml` to modify the
      installation for you.
3. Restart the $productName$ pods.

## Configure an mTLS `TLSContext`

After configuring $productName$ for Istio integration, the Istio mTLS certificates are available within
$productName$:

- Both the `istio-proxy` sidecar and $productName$ mount the `istio-certs` volume at `/etc/istio-certs`.
- The `istio-proxy` sidecar saves the mTLS certificates into `/etc/istio-certs` (per the `OUTPUT_CERTS`
  environment variable).
- $productName$ reads the mTLS certificates from `/etc/istio-certs` (per the `AMBASSADOR_ISTIO_SECRET_DIR`
  environment variable) and creates a Secret named `istio-certs`.

   <Alert severity="warning">
    At present, the Secret name <code>istio-certs</code> cannot be changed.
   </Alert>

To make use of the `istio-certs` Secret, create a `TLSContext` referencing it:

   ```shell
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

This `Mapping` will use mTLS when communicating with its upstream service.

## Route to Services Using mTLS

After integrating $productName$ with Istio, $productName$'s feature-rich routing capabilities and Istio's mTLS
and observability are all available for all incoming traffic. To take full advantage of both, you need to:

- configure upstream services with the Istio sidecar;
- configure `Mapping`s to use mTLS; and
- verify your service port configuration.

### Configure Upstream Services with the Istio Sidecar

Upstream services must have the Istio sidecar configured. The easiest way to arrange for this is to use
[Istio automatic sidecar injection](https://istio.io/docs/setup/additional-setup/sidecar-injection/#automatic-sidecar-injection)
as discussed above.

   ```
   kubectl label namespace default istio-injection=enabled
   ```

   This will tell Istio to automatically inject the `istio-proxy` sidecar container into pods in this namespace.

### Configure `Mapping`s to Use mTLS

Traffic routing in $productName$ is configured with the [`Mapping`](../../topics/using/intro-mappings) resource.
This is a powerful configuration object that lets you configure different routing rules for different services.

To configure a `Mapping` to use mTLS, you need to use the `tls` element of the `Mapping` to tell it to originate
TLS using the `istio-upstream` `TLSContext` above:

   ```yaml
   tls: istio-upstream
   ```

For example, if you have installed the Quote service as described on the
[Getting Started](../../tutorials/getting-started) page, you will have a similar `Mapping`:

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

   To take advantage of Istio mTLS, update the above `Mapping` to originate TLS using the Istio mTLS
   certificates and to force access on port 80:

   ```yaml
   $ kubectl apply -f - <<EOF
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: quote-backend
   spec:
     hostname: "*"
     prefix: /backend/
     service: quote:80       # Be explicit about port 80. THIS IS IMPORTANT: see below
     tls: istio-upstream     # Originate TLS with the mTLS certificate
   EOF
   ```

   <Alert severity="warning">
     You <b>must</b> either explicitly specify port 80 in your <code>Mapping</code>'s <code>service</code>
     element, or set up the Kubernetes <code>Service</code> resource for your upstream service to map port
     443. If you don't do one of these, connections to your upstream will hang &mdash; see the
     <a href="#configure-service-ports">"Configure Service Ports"</a> section below for more information.
   </Alert>

The behavior of your service will not seem to change, even though mTLS is active:

   ```shell
   $ curl -k https://{{AMBASSADOR_HOST}}/backend/
   {
       "server": "bewitched-acai-5jq7q81r",
       "quote": "A late night does not make any sense.",
       "time": "2020-06-02T10:48:45.211178139Z"
   }
   ```

This request first went to $productName$, which routed it over an mTLS connection to the quote service in the
default namespace. That connection was intercepted by the `istio-proxy` which authenticated the request as
being from $productName$, exported various metrics, and finally forwarded it on to the actual quote service.

### Configure Service Ports

When mTLS is active, Istio makes TLS connections to your services. Since Istio handles the TLS protocol for
you, you don't need to modify your services &mdash; however, the TLS connection will still use port 443
if you don't configure your `Mapping`s to _explicitly_ use port 80.

If your upstream service was not written to use TLS, its `Service` resource may only map port 80. If Istio
attempts a TLS connection on port 443 when port 443 is not defined by the `Service` resource, the connection
will hang _even though the Istio sidecar is active_, because Kubernetes itself doesn't know how to handle
the connection to port 443.

As shown above, one simple way to deal with this situation is to explicitly specify port 80 in the `Mapping`'s
`service`:

   ```yaml
   service: quote:80       # Be explicit about port 80.
   ```

Another way is to set up your Kubernetes `Service` to map both port 80 and port 443. For example, the
Quote deployment (which listens on port 8080 in its pod) might use a `Service` like this:

   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: quote
   spec:
     type: ClusterIP
     selector:
       app: quote
     ports:
     - name: http
       port: 80
       protocol: TCP
       targetPort: 8080
     - name: https
       port: 443
       protocol: TCP
       targetPort: 8080
   ```

Note that ports 80 and 443 are both mapped to `targetPort` 8080, where the service is actually listening.
This permits Istio routing to work whether mTLS is active or not.

## Enable Strict mTLS

Istio defaults to _permissive_ mTLS, where mTLS is allowed between services, but not required. Configuring
[_strict_ mTLS](https://istio.io/docs/tasks/security/authentication/authn-policy/#globally-enabling-istio-mutual-tls-in-strict-mode) requires all connections within the cluster be encrypted. To switch Istio to use strict mTLS,
apply a `PeerAuthentication` resource in each namespace that should operate in strict mode:

  ```yaml
  $ kubectl apply -f - <<EOF
  apiVersion: security.istio.io/v1beta1
  kind: PeerAuthentication
  metadata:
    name: global
    namespace: istio-system
  spec:
    mtls:
      mode: STRICT
  EOF
  ```

To test strict mTLS, remove the `tls` configuration from the quote-backend `Mapping` and send a request:

  ```shell
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

  ```shell
  $ curl -k https://{{AMBASSADOR_HOST}}/backend/
  upstream connect error or disconnect/reset before headers. reset reason: connection termination
  ```

Make sure to restore the `tls` configuration when testing is complete!

## Configure Prometheus Metrics Collection

By default, the Istio sidecar provides Prometheus metrics using `prometheus.io` annotations. To take
advantage of these metrics, you must [install Prometheus](../prometheus).

### Configure Istio Distributed Tracing

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

## FAQ

### How to test Istio certificate rotation

By default, Istio mTLS certificates are valid for 90 days, but get rotated every day.

$productName$ updates the mTLS certificates as they are rotated, so you don't need to worry about certificate expiration.

To test that $productName$ is properly rotating certificates, shorten the TTL of the Istio certificates by
setting the following environment variables in the `istiod` container in the `istio-system` Namespace:

   ```yaml
   env:
   - name: DEFAULT_WORKLOAD_CERT_TTL
     value: 30m
   - name: MAX_WORKLOAD_CERT_TTL
     value: 1h
   ```

This makes the certificates Istio issues expire in one hour so testing certificate rotation is much easier.
