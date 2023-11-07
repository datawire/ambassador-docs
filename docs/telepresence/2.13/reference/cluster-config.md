import Alert from '@material-ui/lab/Alert';
import { ClusterConfig, PaidPlansDisclaimer } from '../../../../../src/components/Docs/Telepresence';

# Cluster-side configuration

For the most part, Telepresence doesn't require any special
configuration in the cluster and can be used right away in any
cluster (as long as the user has adequate [RBAC permissions](../rbac)
and the cluster's server version is `1.19.0` or higher).

## Helm Chart configuration
Some cluster specific configuration can be provided when installing
or upgrading the Telepresence cluster installation using Helm. Once
installed, the Telepresence client will configure itself from values
that it receives when connecting to the Traffic manager.

See the Helm chart [README](https://github.com/telepresenceio/telepresence/tree/release/v2/charts/telepresence)
for a full list of available configuration settings.

### Values
To add configuration, create a yaml file with the configuration values and then use it executing `telepresence helm install [--upgrade] --values <values yaml>`

## Client Configuration

It is possible for the Traffic Manager to automatically push config to all
connecting clients. To learn more about this, please see the [client config docs](../config#global-configuration)

### Agent Configuration

The `agent` structure of the Helm chart configures the behavior of the Telepresence agents.

#### Application Protocol Selection
The `agent.appProtocolStrategy` is relevant when using personal intercepts and controls how telepresence selects the application protocol to use 
when intercepting a service that has no `service.ports.appProtocol` declared. The port's `appProtocol` is always trusted if it is present.
Valid values are:

| Value        | Resulting action                                                                                                             |
|--------------|------------------------------------------------------------------------------------------------------------------------------|
| `http2Probe` | The Telepresence Traffic Agent will probe the intercepted container to check whether it supports http2. This is the default. |
| `portName`   | Telepresence will make an educated guess about the protocol based on the name of the service port                            |
| `http`       | Telepresence will use http                                                                                                   |
| `http2`      | Telepresence will use http2                                                                                                  |

When `portName` is used, Telepresence will determine the protocol by the name of the port: `<protocol>[-suffix]`. The following protocols
are recognized:

| Protocol | Meaning                               |
|----------|---------------------------------------|
| `http`   | Plaintext HTTP/1.1 traffic            |
| `http2`  | Plaintext HTTP/2 traffic              |
| `https`  | TLS Encrypted HTTP (1.1 or 2) traffic |
| `grpc`   | Same as http2                         |

The application protocol strategy can also be configured on a workstation. See [Intercepts](../config/#intercept) for more info.

#### Envoy Configuration

The `agent.envoy` structure contains three values:

| Setting      | Meaning                                                  |
|--------------|----------------------------------------------------------|
| `logLevel`   | Log level used by the Envoy proxy. Defaults to "warning" |
| `serverPort` | Port used by the Envoy server. Default 18000.            |
| `adminPort`  | Port used for Envoy administration. Default 19000.       |

#### Image Configuration

The `agent.image` structure contains the following values:

| Setting    | Meaning                                                                     |
|------------|-----------------------------------------------------------------------------|
| `registry` | Registry used when downloading the image. Defaults to "docker.io/datawire". |
| `name`     | The name of the image. Retrieved from Ambassador Cloud if not set.          |
| `tag`      | The tag of the image. Retrieved from Ambassador Cloud if not set.           |

#### Log level

The `agent.LogLevel` controls the log level of the traffic-agent. See [Log Levels](../config/#log-levels) for more info.

#### Resources

The `agent.resources` and `agent.initResources` will be used as the `resources` element when injecting traffic-agents and init-containers.

## TLS

In this example, other applications in the cluster expect to speak TLS to your
intercepted application (perhaps you're using a service-mesh that does
mTLS).

In order to use `--mechanism=http` (or any features that imply
`--mechanism=http`) you need to tell Telepresence about the TLS
certificates in use.

Tell Telepresence about the certificates in use by adjusting your
[workload's](../intercepts/#supported-workloads) Pod template to set a couple of
annotations on the intercepted Pods:

```diff
 spec:
   template:
     metadata:
       labels:
         service: your-service
+      annotations:
+        "getambassador.io/inject-terminating-tls-secret": "your-terminating-secret"  # optional
+        "getambassador.io/inject-originating-tls-secret": "your-originating-secret"  # optional
```

- The `getambassador.io/inject-terminating-tls-secret` annotation
  (optional) names the Kubernetes Secret that contains the TLS server
  certificate to use for decrypting and responding to incoming
  requests.

  When Telepresence modifies the Service and workload port
  definitions to point at the Telepresence Agent sidecar's port
  instead of your application's actual port, the sidecar will use this
  certificate to terminate TLS.

- The `getambassador.io/inject-originating-tls-secret` annotation
  (optional) names the Kubernetes Secret that contains the TLS
  client certificate to use for communicating with your application.

  You will need to set this if your application expects incoming
  requests to speak TLS (for example, your
  code expects to handle mTLS itself instead of letting a service-mesh
  sidecar handle mTLS for it, or the port definition that Telepresence
  modified pointed at the service-mesh sidecar instead of at your
  application).

  If you do set this, you should to set it to the
  same client certificate Secret that you configure the Ambassador
  Edge Stack to use for mTLS.

It is only possible to refer to a Secret that is in the same Namespace
as the Pod. The Secret will be mounted into the traffic agent's container.

Telepresence understands `type: kubernetes.io/tls` Secrets and
`type: istio.io/key-and-cert` Secrets; as well as `type: Opaque`
Secrets that it detects to be formatted as one of those types.

## Air-gapped cluster
<PaidPlansDisclaimer />

If your cluster is on an isolated network such that it cannot
communicate with Ambassador Cloud, then some additional configuration
is required to acquire a license key in order to use personal
intercepts.

### Create a license

1. <ClusterConfig />

2. Generate a new license (if one doesn't already exist) by clicking *Generate New License*.

3. You will be prompted for your Cluster ID. Ensure your
kubeconfig context is using the cluster you want to create a license for then
run this command to generate the Cluster ID:

  ```
  $ telepresence current-cluster-id

    Cluster ID: <some UID>
  ```

4. Click *Generate API Key* to finish generating the license.

5. On the licenses page, download the license file associated with your cluster.

### Add license to cluster
There are two separate ways you can add the license to your cluster: manually creating and deploying
the license secret or having the helm chart manage the secret

You only need to do one of the two options.

#### Manual deploy of license secret

1. Use this command to generate a Kubernetes Secret config using the license file:

  ```
  $ telepresence license -f <downloaded-license-file>

    apiVersion: v1
    data:
      hostDomain: <long_string>
      license: <longer_string>
    kind: Secret
    metadata:
      creationTimestamp: null
      name: systema-license
      namespace: ambassador
  ```

2. Save the output as a YAML file and apply it to your
cluster with `kubectl`.

3. When deploying the `traffic-manager` chart, you must add the additional values when running `helm install` by putting
the following into a file (for the example we'll assume it's called license-values.yaml)

  ```
  licenseKey:
    # This mounts the secret into the traffic-manager
    create: true
    secret:
      # This tells the helm chart not to create the secret since you've created it yourself
      create: false
  ```

4. Install the helm chart into the cluster

  ```
  telepresence helm install -f license-values.yaml
  ```

5. Ensure that you have the docker image for the Smart Agent (datawire/ambassador-telepresence-agent:1.11.0)
pulled and in a registry your cluster can pull from.

6. Have users use the `images` [config key](../config/#images) keys so telepresence uses the aforementioned image for their agent.

#### Helm chart manages the secret

1. Get the jwt token from the downloaded license file

  ```
  $ cat ~/Downloads/ambassador.License_for_yourcluster
  eyJhbGnotarealtoken.butanexample
  ```

2. Create the following values file, substituting your real jwt token in for the one used in the example below.
(for this example we'll assume the following is placed in a file called license-values.yaml)

  ```
  licenseKey:
    # This mounts the secret into the traffic-manager
    create: true
    # This is the value from the license file you download. this value is an example and will not work
    value: eyJhbGnotarealtoken.butanexample
    secret:
      # This tells the helm chart to create the secret
      create: true
  ```

3. Install the helm chart into the cluster

  ```
  telepresence helm install -f license-values.yaml
  ```

Users will now be able to use preview intercepts with the
`--preview-url=false` flag.  Even with the license key, preview URLs
cannot be used without enabling direct communication with Ambassador
Cloud, as Ambassador Cloud is essential to their operation.

If using Helm to install the server-side components, see the chart's [README](https://github.com/telepresenceio/telepresence/tree/release/v2/charts/telepresence) to learn how to configure the image registry and license secret.

Have clients use the [skipLogin](../config/#cloud) key to ensure the cli knows it is operating in an
air-gapped environment.

## Mutating Webhook

Telepresence uses a Mutating Webhook to inject the [Traffic Agent](../architecture/#traffic-agent) sidecar container and update the
port definitions. This means that an intercepted workload (Deployment, StatefulSet, ReplicaSet) will remain untouched
and in sync as far as GitOps workflows (such as ArgoCD) are concerned.

The injection will happen on demand the first time an attempt is made to intercept the workload.

If you want to prevent that the injection ever happens, simply add the `telepresence.getambassador.io/inject-traffic-agent: disabled`
annotation to your workload template's annotations:

```diff
 spec:
   template:
     metadata:
       labels:
         service: your-service
+      annotations:
+        telepresence.getambassador.io/inject-traffic-agent: disabled
     spec:
       containers:
```

### Service Name and Port Annotations

Telepresence will automatically find all services and all ports that will connect to a workload and make them available
for an intercept, but you can explicitly define that only one service and/or port can be intercepted.

```diff
 spec:
   template:
     metadata:
       labels:
         service: your-service
       annotations:
+        telepresence.getambassador.io/inject-service-name: my-service
+        telepresence.getambassador.io/inject-service-port: https
     spec:
       containers:
```

### Ignore Certain Volume Mounts

An annotation `telepresence.getambassador.io/inject-ignore-volume-mounts` can be used to make the injector ignore certain volume mounts denoted by a comma-separated string. The specified volume mounts from the original container will not be appended to the agent sidecar container.

```diff
 spec:
   template:
     metadata:
       annotations:
+        telepresence.getambassador.io/inject-ignore-volume-mounts: "foo,bar"
     spec:
       containers:
```

### Note on Numeric Ports

If the <code>targetPort</code> of your intercepted service is pointing at a port number, in addition to
injecting the Traffic Agent sidecar, Telepresence will also inject an <code>initContainer</code> that will
reconfigure the pod's firewall rules to redirect traffic to the Traffic Agent.

<Alert severity="info">
Note that this <code>initContainer</code> requires `NET_ADMIN` capabilities.
If your cluster administrator has disabled them, you will be unable to use numeric ports with the agent injector.
</Alert>

If you need to use numeric ports without the aforementioned capabilities, you can [manually install the agent](../intercepts/manual-agent)

For example, the following service is using a numeric port, so Telepresence would inject an initContainer into it:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: your-service
spec:
  type: ClusterIP
  selector:
    service: your-service
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-service
  labels:
    service: your-service
spec:
  replicas: 1
  selector:
    matchLabels:
      service: your-service
  template:
    metadata:
      annotations:
        telepresence.getambassador.io/inject-traffic-agent: enabled
      labels:
        service: your-service
    spec:
      containers:
        - name: your-container
          image: jmalloc/echo-server
          ports:
            - containerPort: 8080
```
