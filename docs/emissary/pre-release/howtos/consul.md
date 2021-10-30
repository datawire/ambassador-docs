
import Alert from '@material-ui/lab/Alert';

# Consul integration

<div class="docs-article-toc">
<h3>Contents</h3>

- [Consul integration](#consul-integration)
  - [Architecture overview](#architecture-overview)
  - [Installing Consul](#installing-consul)
  - [Installing $productName$](#installing-ambassador)
  - [Using Consul for service discovery](#using-consul-for-service-discovery)
  - [Using Consul for authorization and encryption](#using-consul-for-authorization-and-encryption)
    - [Environment variables](#environment-variables)
  - [More information](#more-information)

</div>

[Consul](https://www.consul.io) is a widely used service mesh.
$productName$ natively supports service discovery and unauthenticated
communication to services in Consul; additionally the *Ambassador
Consul Connector* enables $productName$ to encrypt and authenticate
its communication via mTLS with services in Consul that make use of
[Consul's *Connect* feature](https://www.consul.io/docs/connect).

## Architecture overview

Using Consul with $productName$ is particularly useful when deploying
$productName$ in so-called hybrid clouds, where applications are
deployed on VMs and Kubernetes.  In this environment, $productName$
can securely route over TLS to any application regardless of where it
is deployed.

In this architecture, Consul serves as the source of truth for your
entire data center, tracking available endpoints, service
configuration, and secrets for TLS encryption.  New applications and
services automatically register themselves with Consul using the
Consul agent or API.  When a request is sent through $productName$,
$productName$ sends the request to an endpoint based on the data in
Consul.

![ambassador-consul](../../images/consul-ambassador.png)

In this guide, you will first register a service with Consul and use
$productName$ to dynamically route requests to that service based on
Consul's service discovery data.

## Installing Consul

If you already have Consul installed in your cluster, then go ahead
and skip to the next section.

1. Before you install Consul, make sure to check the Consul
   documentation for any setup steps specific to your platform.  Below
   you can find setup guides for some of the more popular Kubernetes
   platforms.  This step is primarily to ensure you have the proper
   permissions to set up Consul, and can be skipped if your cluster
   has the necessary permissions configured already.  This page will
   walk you through the process of installing Consul

   - [Microsoft Azure Kubernetes Service (AKS)](https://learn.hashicorp.com/tutorials/consul/kubernetes-aks-azure?utm_source=consul.io&utm_medium=docs)
   - [Amazon Elastic Kubernetes Service (EKS)](https://learn.hashicorp.com/tutorials/consul/kubernetes-eks-aws?utm_source=consul.io&utm_medium=docs)
   - [Google Kubernetes Engine (GKE)](https://learn.hashicorp.com/tutorials/consul/kubernetes-gke-google?utm_source=consul.io&utm_medium=docs)

   <Alert severity="info">

   If you did not find your Kubernetes platform above, you can check
   the [Consul documentation here](https://www.consul.io/docs/k8s) to
   see if there are specific setup instructions for your platform.

   </Alert>

2. Add the Hashicorp repository for installing Consul with Helm.  If
   you do not have Helm installed, you can find an [installation guide
   here](https://helm.sh/docs/intro/install/).

   ```shell
   helm repo add hashicorp https://helm.releases.hashicorp.com
   ```

3. Create a new YAML file (e.g. `consul-values.yaml`) for the Consul
   installation values and copy the values below into that file.

   ```yaml
   global:
     datacenter: dc1

   ui:
     service:
       type: 'LoadBalancer'

   syncCatalog:
     enabled: true

   server:
     replicas: 1
     bootstrapExpect: 1

   connectInject:
     enabled: true
   ```

   <Alert severity="info">

   Note: you are free to change the value of the `datacenter` field in
   the install values.  This will be the name of your Consul
   Datacenter.

   </Alert>

4. Install Consul with Helm using the `consul-values.yaml` values file
   you just created.

   ```shell
   helm install -f consul-values.yaml hashicorp hashicorp/consul
   ```

## Installing $productName$

If you have not already installed $productName$ in to your cluster,
then head over to the [quick start
guide](../../tutorials/getting-started) before continuing any further
in this guide.

## Using Consul for service discovery

In this part of the guide, you'll configure $productName$ to be able
to look for services registered to Consul, register a demo application
with Consul, and configure $productName$ to route to this application
using endpoint data from Consul.

To simplify this tutorial, you'll deploy the application in
Kubernetes, although in practice this application can be deployed
anywhere in your data center (e.g., on VMs).

1. Configure $productName$ to look for services registered to Consul
   by creating the `ConsulResolver`.  Use `kubectl` to apply the
   following manifest:

   ```shell
   kubectl apply -f <<EOF
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: ConsulResolver
   metadata:
     name: consul-dc1
   spec:
     address: http://hashicorp-consul-server-0.hashicorp-consul-server.default.svc.cluster.local:8500
     datacenter: dc1
   EOF
   ```

   <Alert severity="info">

   **Note:** If you changed the name of your `datacenter` in the
   Consul install values, make sure to change it in the resolver above
   to match the name of your datacenter.

   If you changed the name of the helm install from `hashicorp` to
   another value, make sure to update the value of the `address` field
   in your resolver to match it.

   If you are having trouble figuring out what your `address` field
   should be, it follow this format:
   `http://{consul_server_pod}.{consul_server_service}.{namespace}.svc.cluster.local:{consul_port}`.
   The default Consul port should be `8500` unless you changed it.

   </Alert>

   This tells $productName$ that Consul is a service discovery endpoint.

   The `ConsulResolver` is opt-in.  In other words, after applying the
   `ConsulResolver` you need to add `resolver: consul-dc1` in each
   `Mapping` that you want to use this resolver for.  Otherwise
   $productName$ will use your default resolver, and the service
   associated with that `Mapping` will not be registered in Consul.

   For more information about resolver configuration, see the
   [resolver reference documentation](../../topics/running/resolvers).
   (If you're using Consul deployed elsewhere in your data center,
   make sure the `address` points to your Consul FQDN or IP address).

2. Deploy the Quote demo application.  Use `kubectl` to apply the
   following manifest:

   ```shell
   kubectl apply -f <<EOF
   ---
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: quote-consul
   spec:
     replicas: 1
     strategy:
       type: RollingUpdate
     selector:
       matchLabels:
         app: quote-consul
     template:
       metadata:
         labels:
           app: quote-consul
         annotations:
           "consul.hashicorp.com/connect-inject": "false"
       spec:
         containers:
         - name: backend
           image: docker.io/datawire/quote:$quoteVersion$
           ports:
           - name: http
             containerPort: 8080
           env:
           - name: CONSUL_IP
             valueFrom:
               fieldRef:
                 fieldPath: status.hostIP
           - name: POD_IP
             valueFrom:
               fieldRef:
                 fieldPath: status.podIP
           - name: SERVICE_NAME
             value: "quote-consul"
           readinessProbe:
             httpGet:
               path: /health
               port: 8080
             initialDelaySeconds: 30
             periodSeconds: 3
           resources:
             limits:
               cpu: "0.1"
               memory: 100Mi
   EOF
   ```

   <Alert severity="info">

   The `SERVICE_NAME` environment variable in the quote deployment is
   used to specify the service name for Consul.  The default value is
   set to "quote-consul", so you only need to include it if you want
   to change the service name.

   </Alert>

   The Quote application contains code to automatically register
   itself with Consul, using the `CONSUL_IP` and `POD_IP` environment
   variables specified within the Quote container spec.

   Applying this manifest registers the quote pod as a Consul service
   with the name `quote-consul` and the IP address of the quote pod.

   <Alert severity="info">

   The `"consul.hashicorp.com/connect-inject": "false"` annotation
   tells Consul that you do not want to use Consul's Connect
   sidecar/proxy to register this service.  Without Consul's Connect
   sidecar to proxy requests, the service needs to include code to
   make a request to Consul to register the service.  The manifest
   includes the environment variables `CONSUL_IP`, `POD_IP`, and
   `SERVICE_NAME` to provide the Quote service with enough information
   to build that request and send it to Consul.  If you would like to
   see how that code works, please check out [our Git repo for the
   Quote service](https://github.com/datawire/quote).  The next
   section of this guide shows how to configure Consul's Connect
   sidecar/proxy as well.

   </Alert>

3. Verify the quote pod has been registered with Consul.  You can
   verify this by accessing the Consul UI.

   First use `kubectl port-forward` to make the UI available on your
   local workstation:

   ```shell
   kubectl port-forward service/hashicorp-consul-ui 8500:80
   ```

   Then, while the port-forward is running, go to
   http://localhost:8500/ in a web browser.  You should see a service
   named `quote-consul`.

   After you have verified that you see the `quote-consul` service in
   your web browser, you may kill the port-forward.

   <Alert severity="info">

   Port forwarding not working for you?  Make sure the service name
   matches your Consul UI service by checking `kubectl get svc -A`

   </Alert>

4. Configure $productName$ to make use of this `quote-consul` service.
   Use `kubectl` to apply the following manifest:

   ```shell
   kubectl apply -f <<EOF
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: consul-quote-mapping
   spec:
     hostname: "*"
     prefix: /quote-consul/
     service: quote-consul
     resolver: consul-dc1
     load_balancer:
       policy: round_robin
   EOF
   ```

   Note that in the above config:

    - `service` the service name you specified in the quote deployment
    - `resolver` must be set to the `ConsulResolver` that you created in
      the previous step
    - `load_balancer` must be set to configure $productName$ to route
      directly to the Quote application endpoint(s) that are retrieved
      from Consul.

5. Validate that $productName$ is now making use of that service: Send
   a request to the `quote-consul` API.

   ```console
   $ AMBASSADOR_IP=$(kubectl --namespace $productNamespace$ get services/$productDeploymentName$ -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
   $ curl -Lk http://$AMBASSADOR_IP/quote-consul/
   {
    "server": "janky-elderberry-vtqtolsz",
    "quote": "The last sentence you read is often sensible nonsense.",
    "time": "2021-03-24T23:33:08.515530972Z"
   }
   ```

<Alert severity="success">

**Congratulations!** You're successfully routing traffic to the Quote
application, the location of which is registered in Consul.

</Alert>

## Using Consul for authorization and encryption

In this part of the guide, you'll install a different version of the
demo application that now uses Consul's *Connect* feature to authorize
its incoming connections using mTLS, and install *Ambassador Consul
Connector* to enable $productName$ to authenticate to such services.

The following steps assume you've already set up Consul for service
discovery, as detailed above.

1. The Ambassador Consul Connector retrieves the TLS certificate
   issued by the Consul CA and stores it in a Kubernetes `Secret` for
   $productName$ to use.  Deploy the Ambassador Consul Connector with
   `kubectl`:

   ```shell
   kubectl apply -f https://app.getambassador.io/yaml/v2-docs/latest/consul/ambassador-consul-connector.yaml
   ```

   This installs in to your cluster:

    - RBAC resources.
    - The Ambassador Consul Connector service.
    - A `TLSContext` named `ambassador-consul` to load the
      `ambassador-consul-connect` `Secret` into $productName$.

2. Deploy a new version of the demo application, and configure it to
   inject the Consul sidecar proxy by setting
   `"consul.hashicorp.com/connect-inject"` to `true`.  Note that in
   this version of the configuration, you do not have to configure
   environment variables for the location of the Consul server.
   Use `kubectl` to apply the
   following manifest:

   ```yaml
   kubectl apply -f - <<EOF
   ---
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: quote-connect
   spec:
     replicas: 1
     strategy:
       type: RollingUpdate
     selector:
       matchLabels:
         app: quote-connect
     template:
       metadata:
         labels:
           app: quote-connect
         annotations:
           "consul.hashicorp.com/connect-inject": "true"
       spec:
         containers:
         - name: quote
           image: docker.io/datawire/quote:$quoteVersion$
           ports:
           - name: http
             containerPort: 8080
           readinessProbe:
             httpGet:
               path: /health
               port: 8080
             initialDelaySeconds: 30
             periodSeconds: 3
           resources:
             limits:
               cpu: "0.1"
               memory: 100Mi
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: quote-connect
     annotations:
       a8r.io/description: "Quote of the moment service"
       a8r.io/owner: "No owner"
       a8r.io/chat: "#ambassador"
       a8r.io/bugs: "https://github.com/datawire/qotm/issues"
       a8r.io/documentation: "https://github.com/datawire/qotm/blob/master/README.md"
       a8r.io/repository: "https://github.com/datawire/qotm"
       a8r.io/support: "http://a8r.io/Slack"
       a8r.io/runbook: "https://github.com/datawire/qotm/blob/master/README.md"
       a8r.io/incidents: "https://github.com/datawire/qotm/issues"
       a8r.io/dependencies: "None"
   spec:
     ports:
     - name: http
       port: 80
       targetPort: 8080
     selector:
       app: quote-connect
   EOF
   ```

   <Alert severity="info">

   Note: Annotations are used to attach metadata to Kubernetes
   objects.  You can use annotations to link external information to
   objects, working in a similar, yet different, fashion to labels.
   For more information on annotations, you can check out this
   [article](https://kubernetes.io/blog/2021/04/20/annotating-k8s-for-humans/),
   or get started with annotations in your own cluster
   [here](https://www.getambassador.io/docs/cloud/latest/service-catalog/quick-start/).

   </Alert>

   This deploys a demo application called `quote-connect` (different
   than the `quote-consul` application in the previous section) with
   the Consul's Connect sidecar/proxy.  The Connect sidecar/proxy will
   register the application with Consul, require TLS to access the
   application, and expose other [Consul Service
   Segmentation](https://www.consul.io/docs/connect) features.

   Setting the annotation `consul.hashicorp.com/connect-inject` to
   `true` in this deployment tells Consul that you want this
   application to use Consul's Connect sidecar/proxy.  The sidecar
   proxies requests to the service it is attached to.  This is
   something to keep in mind when you are debugging requests to the
   service.

4. Verify the quote pod has been registered with Consul.  You can
   verify this by accessing the Consul UI.

   First use `kubectl port-forward` to make the UI available on your
   local workstation:

   ```shell
   kubectl port-forward service/hashicorp-consul-ui 8500:80
   ```

   Then, while the port-forward is running, go to
   http://localhost:8500/ in a web browser.  You should see a service
   named `quote-connect`.

   After you have verified that you see the `quote-connect` service in
   your web browser, you may kill the port-forward.

5. Create a `Mapping` to configure $productName$ route to the
   `quote-connect` service in Consul.  Use `kubectl` to apply the
   following manifest:

   ```shell
   kubectl apply -f <<EOF
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: quote-connect-mapping
   spec:
     hostname: "*"
     prefix: /quote-connect/
     service: quote-connect-sidecar-proxy
     resolver: consul-dc1
     tls: ambassador-consul
     load_balancer:
       policy: round_robin
   EOF
   ```

    - `service` must be set to the name of the Consul sidecar service.
      You can view this with `kubectl get svc -A` it should follow the
      format of `{service name}-sidecar-proxy`.
    - `resolver` must be set to the `ConsulResolver` created when
      configuring $productName$
    - `tls` must be set to the TLSContext storing the Consul mTLS
      certificates (e.g. `ambassador-consul`)
    - `load_balancer` must be set to configure $productName$ to route
      directly to the application endpoint(s) that are retrieved from
      Consul

   Applying this manifest creates a Mapping that routes to the `quote`
   service in Consul.

6. Validate that $productName$ is now able to use mTLS to have
   encrypted and communication with that service: Send a request to
   the `/quote-connect/` API.

   ```console
   $ AMBASSADOR_IP=$(kubectl --namespace $productNamespace$ get services/$productDeploymentName$ -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
   $ curl -Lk http://$AMBASSADOR_IP/quote-connect/
   {
    "server": "tasty-banana-2h6qpwme",
    "quote": "Nihilism gambles with lives, happiness, and even destiny itself!",
    "time": "2021-03-24T23:31:58.47597266Z"
   }
   ```

<Alert severity="success">

**Congratulations!** You successfully configured the service to work
with Consul's Connect sidecar/proxy.

</Alert>

### Environment variables

The Ambassador Consul Connector can be configured with the following
environment variables.  The defaults are best for most use-cases.

| Environment Variable               | Description                                                                                                                                                                                           | Default                                              |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| `_AMBASSADOR_ID`                   | Set the Ambassador ID so multiple instances of this integration can run per-Cluster when there are multiple $productNamePlural$ (Required if `AMBASSADOR_ID` is set in your $productName$ deployment) | `""`                                                 |
| `_CONSUL_HOST`                     | Set the IP or DNS name of the target Consul HTTP API server                                                                                                                                           | `127.0.0.1`                                          |
| `_CONSUL_PORT`                     | Set the port number of the target Consul HTTP API server                                                                                                                                              | `8500`                                               |
| `_AMBASSADOR_TLS_SECRET_NAME`      | Set the name of the Kubernetes `v1.Secret` created by this program that contains the Consul-generated TLS certificate.                                                                                | `$AMBASSADOR_ID-consul-connect`                      |
| `_AMBASSADOR_TLS_SECRET_NAMESPACE` | Set the namespace of the Kubernetes `v1.Secret` created by this program.                                                                                                                              | (same Namespace as the Pod running this integration) |

## More information

For more about $productName$'s integration with Consul, read the
[service discovery configuration](../../topics/running/resolvers)
documentation.
