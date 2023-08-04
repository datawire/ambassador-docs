import Alert from '@material-ui/lab/Alert';

# Installing and Updating $productName$

Installation methods for $productName$ are provided by the published YAML and Helm chart.
Refer to the [quickstart guide][] for installation instructions.

## Install or Update via Helm

Installing via Helm is the recommended way to install $productName$ for most users. The default installation should be good
for most users.

### The CRDs Helm Chart

The CRDs Helm chart is available to provide a convenient way to manage all of the CRDs for $productName.
The chart will, by default, install the $productName$ CRDs, along with the CRDs for [Envoy Gateway][] and [Gateway API][].
All of these CRDs are required components when running $productName$ and must be installed. You should only have one installation of the CRDs
chart per Kubernetes cluster, even if you are running multiple installs of $productName$.

**Helm Values**:

```yaml
envoyGatewayCrds: true # Configures whether the Gateway API CRDs should be installed
gatewayApiCrds: true   # Configures whether the Envoy Gateway CRDs should be installed
```

### The $productName$ Helm Chart

The chart for installing $productName$ allows for a few high-level configuration options:

**Auth Service Config**:

```yaml
authservice:
  logLevel: debug    # Verbosity of the logs. Allowed values are debug;info;warn;error;dpanic;panic;fatal
  useJsonLogs: false # Whether logs should be output in JSON instead
  replicas: 2        # Number of replicas of the Auth Service
```

**WAF Service Config**:

```yaml
wafservice:
  logLevel: debug    # Verbosity of the logs. Allowed values are debug;info;warn;error;dpanic;panic;fatal
  useJsonLogs: false # Whether logs should be output in JSON instead
  replicas: 2        # Number of replicas of the Auth Service
```

**Edge Stack Service Config**:

```yaml
edgestack:
  logLevel: debug    # Verbosity of the logs. Allowed values are debug;info;warn;error;dpanic;panic;fatal
  useJsonLogs: false # Whether logs should be output in JSON instead
  replicas: 2        # Number of replicas of the Edge Stack Service
```

**Redis Config**:

```yaml
# redis controls the redis deployment/service that is used by the auth service component of $productName$
redis:
  # URL of your redis instance. Defaults to redis instance created below.
  # If you are providing your own Redis, then this field is required
  redisURL:
  # $productName$ ships with a basic redis instance. Configure the deployment with the options below.
  deployment:
    create: true
    image:
      repository: redis
      tag: 7.0.10
      pullPolicy: IfNotPresent
    # Annotations for $productName$'s redis instance.
    annotations:
      deployment: {}
      service: {}
    resources: {}
    # If you want to specify resources, uncomment the following
    # lines and remove the curly braces after 'resources:'.
    # These are placeholder values and must be tuned.
    #   limits:
    #     cpu: 100m
    #     memory: 256Mi
    #   requests:
    #     cpu: 50m
    #     memory: 128Mi
    nodeSelector: {}
    affinity: {}
    tolerations: {}
    # Arguments for the redis container
    containerArgs: {}
    #  - arg1
    #  - arg2
    # Secrets used for pulling the redis image from a private repo
    imagePullSecrets: {}
    #  - name: example-secret-1
    #  - name: example-secret-2

    # The following values are examples, please find additional configuration at https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#securitycontext-v1-core
    podSecurityContext: {}
    #  runAsUser: 8888
    #  runAsGroup: 8888
    #  fsGroup: 8888

    # The following values are examples, please find additional configuration at https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#securitycontext-v1-core
    containerSecurityContext: {}
    #  allowPrivilegeEscalation: false

    # The following values are examples, please find additional configuration at https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#volumemount-v1-core
    containerVolumeMount: {}
    #- name: redisvolume
    #  mountPath: /data

    # The following values are examples, please find additional configuration at https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#volume-v1-core
    podVolume: {}
    #- name: redisvolume
```

**Envoy Gateway**:

If you do not want the chart to install and manage Envoy Gateway, then you can use the below Helm values to disable the installation of Envoy Gateway. Note that Envoy Gateway is a **required** component for $productName$, so if you disable its creation in the Helm chart, then you must provide your own installation of Envoy Gateway. See [Envoy Gateway config][] for some required Envoy Gateway config you will need to add.

```yaml
# Values to configure the Envoy Gateway installation.
envoygateway:
  create: true
  deployment:
    envoyGateway:
      image:
        repository: docker.io/envoyproxy/gateway
        tag: v0.5.0
      imagePullPolicy: Always
      resources:
        limits:
          cpu: 500m
          memory: 1024Mi
        requests:
          cpu: 100m
          memory: 256Mi
    kubeRbacProxy:
      image:
        repository: gcr.io/kubebuilder/kube-rbac-proxy
        tag: v0.11.0
      resources:
        limits:
          cpu: 500m
          memory: 128Mi
        requests:
          cpu: 5m
          memory: 64Mi
    ports:
      - name: grpc
        port: 18000
        targetPort: 18000
      - name: ratelimit
        port: 18001
        targetPort: 18001
    replicas: 2
    pod:
      annotations: {}
      labels: {}
  config:
    envoyGateway:
      gateway:
        controllerName: gateway.envoyproxy.io/gatewayclass-controller
      provider:
        type: Kubernetes
      logging:
        level:
          default: info
  envoyProxy:
    image:
      repository: docker.io/ambassador/aes-envoy
      # tag:
  envoyGatewayMetricsService:
    ports:
      - name: https
        port: 8443
        protocol: TCP
        targetPort: https
  createNamespace: false
  kubernetesClusterDomain: cluster.local
```

### Helm Updates

Updating $productName$ if you installed it using Helm is simple. Just perform a `helm upgrade` using the version of the helm chart
that you would like to upgrade to. If you've set any custom Helm values, then make sure to pass those to `helm upgrade`.

## Install of Update via YAML

If you are using the YAML installation, then $productName$ and its CRDs are installed along with Envoy Gateway,
the Envoy Gateway CRDs, and the Gateway API CRDs. If you would like to bring your own installation of Envoy Gateway and/or
the Gateway API CRDs, then you must manually edit the YAML manifests to create your desired config (or use the Helm installation instead to help you template your own YAML). Please refer to the [Configuring Edge Stack][] and [Configuring Envoy Gateway][]
docs for more info if you are making manual edits to the installation manifests.

If you are updating via YAML then you can simply apply the latest YAML installation published by Ambassador Labs so long as you have not made changes to it.

[quickstart guide]: ../quickstart
[Envoy Gateway config]: ../../guides/eg/envoy-gateway-config
[Configuring Edge Stack]: ../../guides/aes/deployment-config
[Configuring Envoy Gateway]: ../../guides/eg/envoy-gateway-config
[Envoy Gateway]: https://github.com/envoyproxy/gateway
[Gateway API]: https://gateway-api.sigs.k8s.io/
