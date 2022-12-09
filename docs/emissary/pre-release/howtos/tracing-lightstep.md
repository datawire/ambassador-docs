# Distributed Tracing with OpenTelemetry and Lightstep

In this tutorial, we'll configure [$productName$](https://www.getambassador.io/products/edge-stack/api-gateway) to initiate a trace on some sample requests, collect them with the OpenTelemetry collector and use Lightstep to visualize them.

## Before you get started

This tutorial assumes you have already followed the $productName$ [Getting Started](../../tutorials/getting-started) guide. If you haven't done that already, you should do that now.

After completing the Getting Started guide you will have a Kubernetes cluster running $productName$ and the Quote service. Let's walk through adding tracing to this setup.

<Alert severity="warning">
  Please note that Distributed Tracing with the Lightstep tracing driver will no longer be supported as of $productName$ version 3.4.0. If you are currently using the Lightstep tracing driver, please refer to the bottom of the page on how to migrate. 
</Alert>

## 1. Setup Lightstep

If you don't already have a Lightstep account be sure to create one [here](https://lightstep.com/). Then create a Project and be sure to create and save the Access Token information. You can find your Access Token information under the Project settings. 

## 2. Deploy the OpenTelemetry Collector

The next step is to deploy the OpenTelemetry Collector. The purpose of the OpenTelemetry collector is to receive the requested trace data and then export it to Lightstep. 

For the purposes of this tutorial, we are going to create and use the `monitoring` namespace. This can be done with the following command.

```
  kubectl create namespace monitoring
```

Next we are going to setup our configuration for the OpenTelemetry collector. First, we use a Kubernetes secret to store our Lightstep Access Token that we saved in step one. It is important for us to encode the secret in Base64. How you want to do this securely is up to you, for the purposes of this tutorial, I would recommend an online tool like [Base64Encode.org](https://www.base64encode.org/). Once the secret is encoded, please apply the following YAML and be sure to update the value of the `lightstep_access_token` with your encoded token. 

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: otel
  namespace: monitoring
type: Opaque
data:
  lightstep_access_token: YOUR_BASE64_ENCODED_TOKEN_HERE
```

Next, please add the following YAML to a file named `opentelemetry.yaml`. This configuration will create 3 resources. A ConfigMap that will store our configuration options, an OpenTelemetry Deployment that uses the [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) container image, and an associated Service for our Distributed Tracing.

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-conf
  namespace: monitoring
  labels:
    app: opentelemetry
    component: otel-collector-conf
data:
  otel-collector-config: |
    receivers:
      otlp:
        protocols:
          grpc:
          http:
      prometheus:
        config:
          scrape_configs:
            - job_name: "otel-collector"
              scrape_interval: 10s
              static_configs:
                - targets: ["localhost:8888"]
              metric_relabel_configs:
                - source_labels: [ __name__ ]
                  regex: ".*grpc_io.*"
                  action: drop
      zipkin: {}
      jaeger:
        protocols:
          grpc:
          thrift_http:
    processors:
      batch:
      memory_limiter:
        # Same as --mem-ballast-size-mib CLI argument
        ballast_size_mib: 683
        # 80% of maximum memory up to 2G
        limit_mib: 1500
        # 25% of limit up to 2G
        spike_limit_mib: 512
        check_interval: 5s
      queued_retry:
    extensions:
      health_check: {}
      zpages: {}
    exporters:
      prometheus:
        endpoint: "0.0.0.0:8889"
      
      otlp:
        endpoint: ingest.lightstep.com:443
        headers: {"lightstep-access-token":"${LIGHTSTEP_ACCESS_TOKEN}"}
    service:
      extensions: [health_check, zpages]
      pipelines:
        traces:
          receivers: [otlp, zipkin, jaeger]
          processors: [memory_limiter, batch, queued_retry]
          exporters:
            
            - otlp
        metrics:
          receivers: [prometheus]
          processors: [memory_limiter, batch]
          exporters: [prometheus]
---
apiVersion: v1
kind: Service
metadata:
  name: otel-collector
  namespace: monitoring
  labels:
    app: opentelemetry
    component: otel-collector
spec:
  ports:
    - name: otlp # Default endpoint for OpenTelemetry receiver.
      port: 55680
    - name: jaeger-grpc # Default endpoing for Jaeger gRPC receiver
      port: 14250
    - name: jaeger-thrift-http # Default endpoint for Jaeger HTTP receiver.
      port: 14268
    - name: zipkin # Default endpoint for Zipkin trace receiver.
      port: 9411
    - name: metrics # Default endpoint for the Collector metrics.
      port: 8888
  selector:
    component: otel-collector
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-collector
  namespace: monitoring
  labels:
    app: opentelemetry
    component: otel-collector
spec:
  selector:
    matchLabels:
      app: opentelemetry
      component: otel-collector
  minReadySeconds: 5
  progressDeadlineSeconds: 120
  replicas: 1
  template:
    metadata:
      labels:
        app: opentelemetry
        component: otel-collector
    spec:
      containers:
        - command:
            - "/otelcontribcol"
            - "--config=/conf/otel-collector-config.yaml"
            - "--mem-ballast-size-mib=683" # Memory Ballast size should be max 1/3 to 1/2 of memory.
          image: otel/opentelemetry-collector-contrib:0.11.0
          name: otel-collector
          resources:
            limits:
              cpu: 1000m
              memory: 2Gi
            requests:
              cpu: 200m
              memory: 400Mi
          ports:
            - containerPort: 55679 # Default endpoint for ZPages.
            - containerPort: 55680 # Default endpoint for OpenTelemetry receiver.
            - containerPort: 14250 # Default endpoint for Jaeger HTTP receiver.
            - containerPort: 14268 # Default endpoint for Jaeger HTTP receiver.
            - containerPort: 9411  # Default endpoint for Zipkin receiver.
            - containerPort: 8888  # Default endpoint for querying metrics.
          env:
            - name: LIGHTSTEP_ACCESS_TOKEN
              valueFrom:
                secretKeyRef:
                  name: otel
                  key: lightstep_access_token
          volumeMounts:
            - name: otel-collector-config-vol
              mountPath: /conf
          livenessProbe:
            httpGet:
              path: /
              port: 13133
          readinessProbe:
            httpGet:
              path: /
              port: 13133
      volumes:
        - configMap:
            name: otel-collector-conf
            items:
              - key: otel-collector-config
                path: otel-collector-config.yaml
          name: otel-collector-config-vol
```

Be sure to apply this configuration with the following command:
```
  kubectl apply -f opentelemetry.yaml
```

At this point, the OpenTelemetry collector should be setup properly and ready to send data to Lightstep. 

## 3. Configure the TracingService

Now that the OpenTelemetry Collector is setup for collecting data, the next step will be for us to setup our [TracingService](../../topics/running/services/tracing-service). We will be using the Zipkin driver to send our request trace data to the OpenTelemetry Collector for Distributed Tracing. Please apply the following YAML. 

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: TracingService
metadata:
  name: tracing-zipkin
  namespace: ambassador
spec:
  service: otel-collector.monitoring:9411
  driver: zipkin
```

As a final step we want to restart $productName$ as this is necessary to add the distributed tracing headers. This command will restart all the Pods (assuming $productName$ is installed in the <code>ambassador</code> namespace):

```
  kubectl -n ambassador rollout restart deploy
```
<Alert severity="warning">
  Restarting $productName$ is required after deploying a Tracing Service for changes to take effect.
</Alert>

## 4. Testing our Distributed Tracing

Finally, we are going to test our Distributed Tracing. Use `curl` to generate a few requests to an existing $productName$ `Mapping`. You may need to perform many requests since only a subset of random requests are sampled and instrumented with traces.

```
  curl -L $AMBASSADOR_IP/backend/
```

At this point, we should be able to view and check our traces on the [Lightstep app](https://app.lightstep.com/). You can do so by clicking on the Explorer tab and searching for a trace. 

## Migrating from the Lightstep Tracing Driver

As of $productName$ versions 3.4.0, the Lightstep tracing driver will no longer be supported. This is due to the upgrade to [Envoy](https://www.getambassador.io/learn/envoy-proxy) version 1.24. Luckily for us, we can follow similar steps to the above tutorial to continue to use Lightstep and upgrade the $productName$ TracingService. 

First, make sure that the OpenTelemetry Collector is installed. This can be done by following the same commands as step 2 of this page. Please be sure to create/update the Kubernetes secret to include your Lightstep Access Token. 

Then, we simply need to edit our TracingService to point to the OpenTelemetry Collector (instead of the ingest endpoint of Lightstep) and to use the Zipkin driver. Please note that $productName$ can only support 1 TracingService per instance. Because of this, we must edit our previous TracingService rather than applying a second one. 

If you were using the Lightstep tracing driver, you may have your Lightstep Access Token information set in your TracingService config. Using a Kubernetes Secret, we no longer need to reference the token here. 

Once our TracingService configuration has been updated, a restart of $productName$ may be necessary for Lightstep to recieve our Distributed Tracing information. 