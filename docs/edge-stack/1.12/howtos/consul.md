
import Alert from '@material-ui/lab/Alert';

# Consul integration

<div class="docs-article-toc">
<h3>Contents</h3>

- [Consul integration](#consul-integration)
  - [Architecture overview](#architecture-overview)
  - [Installing consul](#installing-consul)
  - [Getting started](#getting-started)
  - [Configuring ambassador](#configuring-ambassador)
  - [Routing to consul services](#routing-to-consul-services)
  - [Consul connector and encrypted TLS](#consul-connector-and-encrypted-tls)
  - [Environment variables](#environment-variables)
  - [More information](#more-information)

</div>


[Consul](https://www.consul.io) is a widely used service mesh. You can use Consul with Ambassador Edge Stack, as it natively supports Consul for service discovery and end-to-end TLS (including mTLS between services). This capability is particularly useful when deploying Ambassador Edge Stack in so-called hybrid clouds, where applications are deployed on VMs and Kubernetes. In this environment, Ambassador Edge Stack can securely route over TLS to any application regardless of where it is deployed.

## Architecture overview

In this architecture, Consul serves as the source of truth for your entire data center, tracking available endpoints, service configuration, and secrets for TLS encryption. New applications and services automatically register themselves with Consul using the Consul agent or API. When a request is sent through Ambassador Edge Stack, Ambassador Edge Stack sends the request to an endpoint based on the data in Consul.

![ambassador-consul](../../images/consul-ambassador.png)

## Installing consul

In this guide, you will register a service with Consul and use Ambassador Edge Stack to dynamically route requests to that service based on Consul's service discovery data. If you already have Ambassador Edge Stack installed, you will just need to configure the ConsulResolver in the [Configuring Ambassador section](#configuring-ambassador).

1. First, install and configure Consul. We will provide the Consul installation values and commands below for all platforms. Make sure to check the Consul documentation for any setup steps specific to your platform before installing. Consul can be deployed anywhere in your data center. Below you can find setup guides for some of the more popular Kubernetes platforms.

   - [Microsoft Azure Kubernetes Service (AKS)](https://learn.hashicorp.com/tutorials/consul/kubernetes-aks-azure?utm_source=consul.io&utm_medium=docs)
   - [Amazon Elastic Kubernetes Service (EKS)](https://learn.hashicorp.com/tutorials/consul/kubernetes-eks-aws?utm_source=consul.io&utm_medium=docs)
   - [Google Kubernetes Engine (GKE)](https://learn.hashicorp.com/tutorials/consul/kubernetes-gke-google?utm_source=consul.io&utm_medium=docs)

  <Alert severity="info">
    If you did not find your Kubernetes platform above, check the <a href="https://www.consul.io/docs/k8s">Consul documentation here</a> to see if there are specific setup instructions for your platform.
  </Alert>

2. Add the Hashicorp repository for installing Consul with Helm. If you do not have Helm installed, you can find an [installation guide here](https://helm.sh/docs/intro/install/).

   ```
   helm repo add hashicorp https://helm.releases.hashicorp.com
   ```

3. Create a new YAML file (eg. `consul-install.yaml`) for the Consul installation values and copy the values below into that file.

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

   > Note: you are free to change the value of the `datacenter` field in the install values. This will be the name of your Consul Datacenter.

  <Alert severity="warning">
    <strong>WARNING:</strong> In Ambassador Edge Stack versions 1.10.0 through 1.11.1, changing the value of the <code>datacenter</code> will not work unless you enable the <code>AMBASSADOR_LEGACY_MODE</code> environment variable. It is recommended to upgrade to the latest Edge Stack version. if you are still using the versions mentioned above.
  </Alert>

4. Install Consul with Helm using the `consul-values.yaml` values file we just created.

   ```
   helm install -f consul-values.yaml hashicorp hashicorp/consul
   ```
## Getting started

  <Alert severity="info">
    <strong>Note:</strong> The third value in the install command we just used (<code>hashicorp</code>) is the name of your consul install. You can change this if you have a specific reason to, and you will see that the names of your Consul pods and services will change to include this value instead of <code>hashicorp</code>
  </Alert>

## Configuring ambassador

1. Deploy Ambassador Edge Stack. Note: If this is your first time deploying Ambassador Edge Stack, reviewing the [quick start guide](../../tutorials/getting-started) is strongly recommended.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/ambassador/ambassador-rbac.yaml
   ```

   If you're on GKE, or haven't previously created the Ambassador Edge Stack service, please see the [quick start guide](../../tutorials/getting-started).

2. Configure Ambassador Edge Stack to look for services registered to Consul by creating the ConsulResolver:

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



   This will tell Ambassador Edge Stack that Consul is a service discovery endpoint. Save the configuration to a file (e.g., `consul-resolver.yaml`, and apply this configuration with `kubectl apply -f consul-resolver.yaml`. For more information about resolver configuration, see the [resolver reference documentation](../../topics/running/resolvers). (If you're using Consul deployed elsewhere in your data center, make sure the `address` points to your Consul FQDN or IP address).



   The ConsulResolver is Opt-In. In other words, after applying the ConsulResolver you need to add `resolver: consul-dc1` in each Mapping that you want to use this resolver for. Otherwise it will use your default resolver, and the service associated with that Mapping will not be registered in Consul.

   For more information about resolver configuration, see the [resolver reference documentation](../../topics/running/resolvers). (If you're using Consul deployed elsewhere in your data center, make sure the `address` points to your Consul FQDN or IP address).

## Routing to consul services

You'll now register a demo application with Consul, and show how Ambassador Edge Stack can route to this application using endpoint data from Consul. To simplify this tutorial, you'll deploy the application in Kubernetes, although in practice this application can be deployed anywhere in your data center (e.g., on VMs).


1. Deploy the Quote demo application. The Quote application contains code to automatically register itself with Consul, using the CONSUL_IP and POD_IP environment variables specified within the Quote container spec.

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

   > Note: The `SERVICE_NAME` environment variable in the quote deployment is used to specify the service name for Consul. The default value is set to "quote-consul", so you only need to include it if you want to change the service name.

    Save the above to a file called `quote.yaml` and run `kubectl apply -f quote.yaml`. This will register the quote pod as a Consul service with the name `quote-consul` and the IP address of the quote pod.

   > The `"consul.hashicorp.com/connect-inject": "false"` annotation tells consul that we do not want to use a Consul-Connect sidecar to register this service. Without a Consul-Connect sidecar to proxy requests, the service needs to include code to make a request to Consul to register the service. We include the environment variables `CONSUL_IP`, `POD_IP`, and `SERVICE_NAME` to provide the Quote service with enough information to build that request and send it to Consul. If you would like to see how that code works, please check out [our repo for the Quote service](https://github.com/datawire/quote). Later in this guide we will show how to configure Consul-Connect as well.

2. Verify the quote pod has been registered with Consul. You can verify the quote pod is registered correctly by accessing the Consul UI.


   ```
   kubectl port-forward service/hashicorp-consul-ui 8500:80
   ```
  <Alert severity="info">
    Port forwarding not working for you? Make sure the service name matches your consul UI service by checking <code>kubectl get svc -A</code>
  </Alert>

   Go to `http://localhost:8500/` from a web browser and you should see a service named `quote-consul`.

3. Create a Mapping for the `quote-consul` service.

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

Save the above YAML to a file named `quote-mapping.yaml`, and use `kubectl apply -f quote-mapping.yaml` to apply this configuration to your Kubernetes cluster. Note that in the above config:

   - `service` the service name you specified in the quote deployment
   - `resolver` must be set to the ConsulResolver that you created in the previous step
   - `load_balancer` must be set to configure Ambassador Edge Stack to route directly to the Quote application endpoint(s) that are retrieved from Consul.


1. Send a request to the `quote-consul` API.

   ```
   curl -L http://$AMBASSADOR_IP/quote-consul/

   {
    "server": "janky-elderberry-vtqtolsz",
    "quote": "The last sentence you read is often sensible nonsense.",
    "time": "2021-03-24T23:33:08.515530972Z"
   }
   ```

<Alert severity="info">
  <strong>Note:</strong> Don't forget to pass the -k flag to curl if you are still using a self-signed certificate
</Alert>

<Alert severity="success">
  <strong>Congratulations!</strong> You're successfully routing traffic to the Quote application, the location of which is registered in Consul.
</Alert>


## Consul connector and encrypted TLS

Ambassador Edge Stack can also use certificates stored in Consul to originate encrypted TLS connections from Ambassador Edge Stack to the Consul service mesh. This requires the use of the Ambassador Edge Stack Consul connector. The following steps assume you've already set up Consul for service discovery, as detailed above.

1. The Ambassador Consul connector retrieves the TLS certificate issued by the Consul CA and stores it in a Kubernetes secret for Ambassador Edge Stack to use. Deploy the Ambassador Edge Stack Consul Connector with `kubectl`:

   ```
   kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/consul/ambassador-consul-connector.yaml
   ```

This will install into your cluster:

   - RBAC resources.
   - The Consul connector service.
   - A TLSContext named `ambassador-consul` to load the `ambassador-consul-connect` secret into Ambassador Edge Stack.

<Alert severity="info">
  <strong>Note:</strong> If you have previously installed the consul connector in the <code>default</code> namespace in your cluster, you'll want to clean up the old (and now unused) resources in the <code>default</code> namespace. If you are installing the consul connector in your cluster for the first time, you can ignore this and move on to step two.
</Alert>

Having duplicates of the Consul connector resources in the `ambassador` and `default` namespaces should not impact the functionality of the Consul connector, but it's good practice to clean up unused resources.


First, delete the service account, Consul connector service and TLSContext resources from the `default` namespace:

    ```
    kubectl delete -f https://app.getambassador.io/yaml/ambassador-docs/$version$/consul/ambassador-consul-connector-old.yaml
    ```

Then, delete the secret created by the connector service in the `default` namespace.
`ambassador-consul-connect` is the default name of the secret,
but if you have set the `_AMBASSADOR_TLS_SECRET_NAME` environment variable on the `consul-connect-injector-webhook-deployment` deployment,
you should sub in that secret name value for `ambassador-consul-connect` in the command below.

    ```
    kubectl delete secret -n default ambassador-consul-connect
    ```

2. Deploy a new version of the demo application, and configure it to inject the Consul sidecar proxy by setting `"consul.hashicorp.com/connect-inject"` to `true`. Note that in this version of the configuration, you do not have to configure environment variables for the location of the Consul server:

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
    ```

   Copy this YAML in a file called `quote-connect.yaml` and apply it to your cluster with `kubectl apply -f quote-connect.yaml`.

   This will deploy a demo application called `quote-connect` with the Connect sidecar proxy. The Connect proxy will register the application with Consul, require TLS to access the application, and expose other [Consul Service Segmentation](https://www.consul.io/docs/connect) features.

   Setting the annotation `consul.hashicorp.com/connect-inject` to `true` in this deployment tells Consul that we want to use the Consul Connect Sidecar.The sidecar proxies requests to the service it is attached to. This is something to keep in mind when you are debugging requests to the service.


3. Verify the `quote-connect` application is registered in Consul by accessing the Consul UI on `http://localhost:8500/` after running:

   ```
   kubectl port-forward service/hashicorp-consul-ui 8500:80
   ```

   You should see a service registered as `quote`. It gets its name from the contaner's name property we defined in the YAML above.



4. Create a Mapping to route to the `quote` service in Consul

    ```yaml
    ---
    apiVersion: getambassador.io/v2
    kind: Mapping
    metadata:
      name: quote-connect-mapping
    spec:
      prefix: /quote-connect/
      service: quote-sidecar-proxy
      resolver: consul-dc1
      tls: ambassador-consul
      load_balancer:
        policy: round_robin
    ```
    - `service` must be set to the name of the Consul sidecar service. You can view this with `kubectl get svc -A` it should follow the format of `{container name}-sidecar-proxy`.
    - `resolver` must be set to the ConsulResolver created when configuring Ambassador Edge Stack
    - `tls` must be set to the TLSContext storing the Consul mTLS certificates (e.g. `ambassador-consul`)
    - `load_balancer` must be set to configure Ambassador Edge Stack to route directly to the application endpoint(s) that are retrieved from Consul


    Copy this YAML to a file named `quote-connect-mapping.yaml` and apply it to your cluster with `kubectl apply -f quote-connect-mapping.yaml`.

5. Send a request to the `/quote-connect/` API.

   ```
   curl -L $AMBASSADOR_IP/quote-connect/

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
| _AMBASSADOR_ID | Set the Ambassador ID so multiple instances of this integration can run per-Cluster when there are multiple Ambassadors (Required if `AMBASSADOR_ID` is set in your Ambassador deployment) | `""` |
| _CONSUL_HOST | Set the IP or DNS name of the target Consul HTTP API server | `127.0.0.1` |
| _CONSUL_PORT | Set the port number of the target Consul HTTP API server | `8500` |
| _AMBASSADOR_TLS_SECRET_NAME | Set the name of the Kubernetes `v1.Secret` created by this program that contains the Consul-generated TLS certificate. | `$AMBASSADOR_ID-consul-connect` |
| _AMBASSADOR_TLS_SECRET_NAMESPACE | Set the namespace of the Kubernetes `v1.Secret` created by this program. | (same Namespace as the Pod running this integration) |

## More information

For more about Ambassador Edge Stack's integration with Consul, read the [service discovery configuration](../../topics/running/resolvers) documentation.
