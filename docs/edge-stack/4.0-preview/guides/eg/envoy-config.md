import Alert from '@material-ui/lab/Alert';

# Configuring Envoy Proxy

The configuration of the instances of Envoy Proxy that are created and managed by Envoy Gateway have some configuration options available. Envoy Gateway uses the [EnvoyProxy][] custom resource to expose some of the configuration for the Deployments and Services of Envoy Proxy.

Below is an example of the default `EnvoyProxy` config that is created when you install $productName$.

```yaml
apiVersion: config.gateway.envoyproxy.io/v1alpha1
kind: EnvoyProxy
metadata:
  name: edge-stack-proxy
  namespace: ambassador
spec:
  logging:
    level:
      default: warn
  provider:
    kubernetes:
      envoyDeployment:
        container:
          image: docker.io/ambassador/aes-envoy:v4.0.0-preview
    type: Kubernetes
```

You are welcome to add additional settings, but the `image` for Envoy Proxy **MUST** use the version provided when installing $productName$.

The `EnvoyProxy` resource gets attached to the [GatewayClass][] used by Envoy Gateway. If you followed the quickstart guide, then your `GatewayClass` should look like the following.

```yaml
kind: GatewayClass
metadata:
  name: edge-stack-gwc
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
  parametersRef:
   group: config.gateway.envoyproxy.io
   kind: EnvoyProxy
   name: edge-stack-proxy
   namespace: ambassador
```

Make sure to update the definition of your `GatewayClass` if you are not installing in the `ambassador` namespace or if you change the `namespace`/`name` of your `EnvoyProxy` resource.

[GatewayClass]: https://gateway-api.sigs.k8s.io/api-types/gatewayclass/
[EnvoyProxy]: https://gateway.envoyproxy.io/v0.5.0/api/config_types.html
