import Alert from '@material-ui/lab/Alert';

# Configuring Envoy Gateway

Envoy Gateway is primarily configured using the [EnvoyGateway][] custom resource. This resource can control many settings and features in Envoy Gateway. It is typically provided as a `ConfigMap` resource since it is only ever read on startup and there should only ever be one `EnvoyGateway` config. If you make changes to it, then you must restart Envoy Gateway for your changes to take effect.

<Alert severity="warning">
Modifying the Envoy Gateway Configuring is an **advanced** feature and should be used with caution. If configured improperly certain Edge Stack features may not work properly.

You are welcome to add additional settings, but the `extensionManager` **MUST** have the settings seen below, and point at the `name.namespace` of your Edge Stack deployment.

</Alert>

Below is an example of the default `EnvoyGateway` config that is created when you install $productName$

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: envoy-gateway-config
  namespace: ambassador
data:
  envoy-gateway.yaml: |
    apiVersion: config.gateway.envoyproxy.io/v1alpha1
    kind: EnvoyGateway
    extensionManager:
      service:
        host: edge-stack.ambassador
        port: 8500
      hooks:
        xdsTranslator:
          post:
          - "HTTPListener"
          - "Translation"
          - "VirtualHost"
    gateway:
      controllerName: gateway.envoyproxy.io/gatewayclass-controller
    logging:
      level:
        default: info
    provider:
      type: Kubernetes
```

[EnvoyGateway]: https://gateway.envoyproxy.io/v0.5.0/api/config_types.html
