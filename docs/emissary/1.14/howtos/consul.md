
import Alert from '@material-ui/lab/Alert';

# Consul integration

<div class="docs-article-toc">
<h3>Contents</h3>

- [Consul integration](#consul-integration)
  - [Architecture overview](#architecture-overview)
  - [Installing consul](#installing-consul)
  - [Routing to consul services](#routing-to-consul-services)
  - [Consul connector and encrypted TLS](#consul-connector-and-encrypted-tls)
  - [Environment variables](#environment-variables)
  - [More information](#more-information)

</div>


[Consul](https://www.consul.io) is a widely used service mesh. You can use Consul with $productName$, as it natively supports Consul for service discovery and end-to-end TLS (including mTLS between services). This capability is particularly useful when deploying $productName$ in so-called hybrid clouds, where applications are deployed on VMs and Kubernetes. In this environment, $productName$ can securely route over TLS to any application regardless of where it is deployed.

## Architecture overview

In this architecture, Consul serves as the source of truth for your entire data center, tracking available endpoints, service configuration, and secrets for TLS encryption. New applications and services automatically register themselves with Consul using the Consul agent or API. When a request is sent through $productName$, $productName$ sends the request to an endpoint based on the data in Consul.

![ambassador-consul](../../images/consul-ambassador.png)

## Installing consul

In this guide, you will register a service with Consul and use $productName$ to dynamically route requests to that service based on Consul's service discovery data. If you already have Consul installed, you will just need to configure the ConsulResolver in the [Configuring $productName$ section](#configuring-productname).

1. Before we install Consul, make sure to check the Consul documentation for any setup steps specific to your platform. Below you can find setup guides for some of the more popular Kubernetes platforms. This step is primarily to ensure you have the proper permissions to set up Consul, and can be skipped if your cluster has the necessary permissions already. This page will walk you through the process of installing Consul

   - [Microsoft Azure Kubernetes Service (AKS)](https://learn.hashicorp.com/tutorials/consul/kubernetes-aks-azure?utm_source=consul.io&utm_medium=docs)
   - [Amazon Elastic Kubernetes Service (EKS)](https://learn.hashicorp.com/tutorials/consul/kubernetes-eks-aws?utm_source=consul.io&utm_medium=docs)
   - [Google Kubernetes Engine (GKE)](https://learn.hashicorp.com/tutorials/consul/kubernetes-gke-google?utm_source=consul.io&utm_medium=docs)

  <Alert severity="info">
    If you did not find your Kubernetes platform above, you can check the <a href="https://www.consul.io/docs/k8s">Consul documentation here</a> to see if there are specific setup instructions for your platform.
  </Alert>

2. Add the Hashicorp repository for installing Consul with Helm. If you do not have Helm installed, you can find an [installation guide here](https://helm.sh/docs/intro/install/).

   ```
   helm repo add hashicorp https://helm.releases.hashicorp.com
   ```

3. Create a new YAML file (eg. `consul-values.yaml`) for the Consul installation values and copy the values below into that file:

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

   client:
     enabled: true  
   ```

   > Note: you are free to change the value of the `datacenter` field in the install values. This will be the name of your Consul Datacenter.

4. Install Consul with Helm using the `consul-values.yaml` values file we just created.

   ```
   helm install -f consul-values.yaml hashicorp hashicorp/consul
   ```

## Configuring $productName$

1. Deploy $productName$. Note: If you do not have $productName$ deployed into your cluster, head over to the [quick start guide](../../tutorials/getting-started) before continuing with this section further.

2. Configure $productName$ to look for services registered to Consul by creating the ConsulResolver. Create a file (eg. `consul-resolver.yaml`) and copy the following code into that file:

    ```yaml
    ---
    apiVersion: getambassador.io/v2
    kind: ConsulResolver
    metadata:
      name: consul-dc1
    spec:
      address: http://hashicorp-consul-server-0.hashicorp-consul-server.default.svc.cluster.local:8500
      datacenter: dc1
    ```
   > **Note:** If you changed the name of your `datacenter` in the Consul install values, make sure to change it in the resolver above to match the name of your datacenter.
   >
   > If you changed the name of the helm install from `hashicorp` to another value, make sure to update the value of the `address` field in your resolver to match it.
   >
   > If you are having trouble figuring out what your `address` field should be, it follow this format: `http://{consul server pod}.{consul server service}.{namespace}.svc.cluster.local:{consul port}`. The default Consul port should be `8500` unless you changed it.

  This will tell $productName$ that Consul is a service discovery endpoint.


3. Apply this configuration to your cluster with:
  ```
  kubectl apply -f consul-resolver.yaml
  ```

   The ConsulResolver is Opt-In. In other words, after applying the ConsulResolver you need to add `resolver: consul-dc1` in each Mapping that you want to use this resolver for. Otherwise it will use your default resolver, and the service associated with that Mapping will not be registered in Consul.

   For more information about resolver configuration, see the [resolver reference documentation](../../topics/running/resolvers). (If you're using Consul deployed elsewhere in your data center, make sure the `address` points to your Consul FQDN or IP address).

## Routing to consul services

You'll now register a demo application with Consul, and show how $productName$ can route to this application using endpoint data from Consul. To simplify this tutorial, you'll deploy the application in Kubernetes, although in practice this application can be deployed anywhere in your data center (e.g., on VMs).


1. Deploy the Quote demo application. Create a file (eg.`quote.yaml`) and copy the following code into it:

    ```yaml
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
    ```

  <Alert severity="info">
    The <code>SERVICE_NAME</code> environment variable in the quote deployment is used to specify the service name for Consul. The default value is set to "quote-consul", so you only need to include it if you want to change the service name.
  </Alert>


  The Quote application contains code to automatically register itself with Consul, using the CONSUL_IP and POD_IP environment variables specified within the Quote container spec.

2. Apply this configuration to your cluster by running:
  ```
  kubectl apply -f quote.yaml
  ```

   This will register the quote pod as a Consul service with the name `quote-consul` and the IP address of the quote pod.


   > The `"consul.hashicorp.com/connect-inject": "false"` annotation tells consul that we do not want to use a Consul-Connect sidecar to register this service. Without a Consul-Connect sidecar to proxy requests, the service needs to include code to make a request to Consul to register the service. We include the environment variables `CONSUL_IP`, `POD_IP`, and `SERVICE_NAME` to provide the Quote service with enough information to build that request and send it to Consul. If you would like to see how that code works, please check out [our repo for the Quote service](https://github.com/datawire/quote). Later in this guide we will show how to configure Consul-Connect as well.

3. Verify the quote pod has been registered with Consul. You can verify the quote pod is registered correctly by accessing the Consul UI.


   ```
   kubectl port-forward service/hashicorp-consul-ui 8500:80
   ```
  <Alert severity="info">
    Port forwarding not working for you? Make sure the service name matches your consul UI service by checking <code>kubectl get svc -A</code>
  </Alert>

   Go to `http://localhost:8500/` from a web browser and you should see a service named `quote-consul`.

4. Create a new YAML file (eg. `quote-mapping.yaml`) for the `quote-consul` service:

   ```yaml
   ---
   apiVersion: getambassador.io/v2
   kind: Mapping
   metadata:
     name: consul-quote-mapping
   spec:
     prefix: /quote-consul/
     service: quote-consul
     resolver: consul-dc1
     load_balancer:
       policy: round_robin
   ```

5. Install the mapping to your cluster by using the following command:
  ```
  kubectl apply -f quote-mapping.yaml
  ```

  Note that in the above config:
   - `service` the service name you specified in the quote deployment
   - `resolver` must be set to the ConsulResolver that you created in the previous step
   - `load_balancer` must be set to configure $productName$ to route directly to the Quote application endpoint(s) that are retrieved from Consul.


1. Send a request to the `quote-consul` API.

   ```
   curl -Lk http://$AMBASSADOR_IP/quote-consul/

   {
    "server": "janky-elderberry-vtqtolsz",
    "quote": "The last sentence you read is often sensible nonsense.",
    "time": "2021-03-24T23:33:08.515530972Z"
   }
   ```

<Alert severity="success">
  <strong>Congratulations!</strong> You're successfully routing traffic to the Quote application, the location of which is registered in Consul.
</Alert>


## Consul connector and encrypted TLS

$productName$ can also use certificates stored in Consul to originate encrypted TLS connections from $productName$ to the Consul service mesh. This requires the use of the $productName$ Consul connector. The following steps assume you've already set up Consul for service discovery, as detailed above.

1. The $productName$ Consul connector retrieves the TLS certificate issued by the Consul CA and stores it in a Kubernetes secret for $productName$ to use. Deploy $productName$ Consul Connector with `kubectl`:

   ```
   kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/consul/ambassador-consul-connector.yaml
   ```

This will install into your cluster:

   - RBAC resources.
   - The Consul connector service.
   - A TLSContext named `ambassador-consul` to load the `ambassador-consul-connect` secret into $productName$.

2. Deploy a new version of the demo application, and configure it to inject the Consul sidecar proxy by setting `"consul.hashicorp.com/connect-inject"` to `true`. Note that in this version of the configuration, you do not have to configure environment variables for the location of the Consul server. Create a file (eg. `quote-connect.yaml`) and copy the following code into it:

    ```yaml
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
    ```

  <Alert severity="info">
    Note: Annotations are used to attach metadata to Kubernetes objects. You can use annotations to link external information to objects, working in a similar, yet different, fashion to labels. For more information on annotations, you can check out this <a href="https://kubernetes.io/blog/2021/04/20/annotating-k8s-for-humans/" >article</a>, or get started with annotations in your own cluster <a href="https://www.getambassador.io/docs/cloud/latest/service-catalog/quick-start/" > here</a>.
  </Alert>

3. Apply the demo application to your cluster with the command:
  ```
  kubectl apply -f quote-connect.yaml
  ```

   This will deploy a demo application called `quote-connect` with the Connect sidecar proxy. The Connect proxy will register the application with Consul, require TLS to access the application, and expose other [Consul Service Segmentation](https://www.consul.io/docs/connect) features.

   Setting the annotation `consul.hashicorp.com/connect-inject` to `true` in this deployment tells Consul that we want to use the Consul Connect Sidecar.The sidecar proxies requests to the service it is attached to. This is something to keep in mind when you are debugging requests to the service.


4. Verify the `quote-connect` application is registered in Consul by accessing the Consul UI on `http://localhost:8500/` after running:

   ```
   kubectl port-forward service/hashicorp-consul-ui 8500:80
   ```

   You should see a service registered as `quote`. It gets its name from the contaner's name property we defined in the YAML above.



5. Create a file (eg. `quote-connect-mapping.yaml`) and copy the following code into it. Create a Mapping to route to the `quote` service in Consul.

    ```yaml
    ---
    apiVersion: getambassador.io/v2
    kind: Mapping
    metadata:
      name: quote-connect-mapping
    spec:
      prefix: /quote-connect/
      service: quote-connect-sidecar-proxy
      resolver: consul-dc1
      tls: ambassador-consul
      load_balancer:
        policy: round_robin
    ```
    - `service` must be set to the name of the Consul sidecar service. You can view this with `kubectl get svc -A` it should follow the format of `{service name}-sidecar-proxy`.
    - `resolver` must be set to the ConsulResolver created when configuring $productName$
    - `tls` must be set to the TLSContext storing the Consul mTLS certificates (e.g. `ambassador-consul`)
    - `load_balancer` must be set to configure $productName$ to route directly to the application endpoint(s) that are retrieved from Consul

 This will create a Mapping that routes to the `quote` service in Consul.

6. Apply the mapping to your cluster with:
  ```
  kubectl apply -f quote-connect-mapping.yaml
  ```

7. Send a request to the `/quote-connect/` API.

   ```
   curl -Lk http://$AMBASSADOR_IP/quote-connect/

   {
    "server": "tasty-banana-2h6qpwme",
    "quote": "Nihilism gambles with lives, happiness, and even destiny itself!",
    "time": "2021-03-24T23:31:58.47597266Z"
   }
   ```
<Alert severity="success">
  <strong>Congratulations!</strong> You successfully configured the service to work with the Consul Connect sidecar proxy.
</Alert>

## Environment variables

The Consul Connector can be configured with the following environment variables. The defaults will be best for most use-cases.

| Environment Variable | Description | Default |
| -------------------- | ----------- | ------- |
| _AMBASSADOR_ID | Set the Ambassador ID so multiple instances of this integration can run per-Cluster when there are multiple $productNamePlural$ (Required if `AMBASSADOR_ID` is set in your $productName$ deployment) | `""` |
| _CONSUL_HOST | Set the IP or DNS name of the target Consul HTTP API server | `127.0.0.1` |
| _CONSUL_PORT | Set the port number of the target Consul HTTP API server | `8500` |
| _AMBASSADOR_TLS_SECRET_NAME | Set the name of the Kubernetes `v1.Secret` created by this program that contains the Consul-generated TLS certificate. | `$AMBASSADOR_ID-consul-connect` |
| _AMBASSADOR_TLS_SECRET_NAMESPACE | Set the namespace of the Kubernetes `v1.Secret` created by this program. | (same Namespace as the Pod running this integration) |

## More information

For more about $productName$'s integration with Consul, read the [service discovery configuration](../../topics/running/resolvers) documentation.
