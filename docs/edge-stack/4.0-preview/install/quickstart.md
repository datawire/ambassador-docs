---
title: "Getting Started with $productName$"
description: "A simple three-step guide to installing $productName$ and quickly get started routing traffic from the edge of your Kubernetes cluster to your services."
---

import Alert from '@material-ui/lab/Alert';
import GettingStartedEdgeStack4PreviewTabs from './gs-tabs';
import UserInterestForm from './user-interest';

# $productName$ 4.0 Developer Preview Quick Start

<UserInterestForm />

<div class="docs-article-toc">
<h3>Contents</h3>
- [1. Installation][]
- [2. Routing traffic from the edge][]
- [What's next?][]
</div>

Get up and running swiftly with $productName$ through this comprehensive quick-start guide. $productName$ is built on [Envoy Gateway][] and enhances its [Kubernetes][]-native API Gateway capabilities by providing advanced security and protection features. Trusted by some of the largest Kubernetes deployments worldwide, $productName$ simplifies the process of ensuring the safety of your services with systems including Web Application Firewalls and a wide array of authentication options (OAuth2, OIDC, JWT, Single Sign-On, etc.). Envoy Gateway is used as the core for $productName$, much like [Emissary-ingress][] was in prior versions to handle directing traffic to your applications and services while supporting many different traffic types and routing options.

## 1. Installation

We'll start by installing $productName$ into your cluster. This will install both $productName$ and [Envoy Gateway][] into your cluster.

**We recommend using Helm**, but there are other options below to choose from.

<GettingStartedEdgeStack4PreviewTabs version="$version$" chartVersion="$chartVersion$" />

## 2. Routing traffic from the edge

$productName$ uses a combination of native Kubernetes resources and Custom Resource Definitions (CRDs) to declaratively define its desired state. The workflow you are going to build uses a simple demo app, a `GatewayClass`, a `Gateway`, and an `HTTPRoute` resource.

1. Start by creating a [GatewayClass][] and [Gateway][]:

   **Apply this YAML to your target cluster now.**

   ```yaml
   kubectl apply -f - <<EOF
   apiVersion: gateway.networking.k8s.io/v1beta1
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
   ---
   apiVersion: gateway.networking.k8s.io/v1beta1
   kind: Gateway
   metadata:
     name: edge-stack-gw
   spec:
     gatewayClassName: edge-stack-gwc
     listeners:
     - name: http
       protocol: HTTP
       port: 80
   EOF
   ```

   The `GatewayClass` is similar to an [IngressClass][] resource in that it helps to isolate
   which controller is responsible for using any configuration that is tied to the `GatewayClass`.
   Here, we are referencing the [EnvoyProxy][] resource `edge-stack-proxy` that contains the configuration that Envoy Gateway will use for [Envoy Proxy][] deployments.

   When the `Gateway` is created, it will trigger Envoy Gateway to create a managed deployment of Envoy Proxy.
   tied to the `Gateway` along with a corresponding `LoadBalancer` type `Service`. Deleting the `Gateway` will also cause the Envoy Proxy deployment and `Service` to be removed.

2. Apply the YAML for the "Quote" service.

   ```shell
   kubectl apply -f https://app.getambassador.io/yaml/v2-docs/3.7.0/quickstart/qotm.yaml
   ```

   <Alert severity="info">The Service and Deployment are created in your default namespace. You can use <code>kubectl get services,deployments quote</code> to see their status.</Alert>

3. Create an [HTTPRoute][] to tell $productName$ to route all traffic inbound to the `/backend/` path to the `quote` Service.

   **Apply this YAML to your target cluster now.**

   ```yaml
   kubectl apply -f - <<EOF
   ---
   apiVersion: gateway.networking.k8s.io/v1beta1
   kind: HTTPRoute
   metadata:
     name: backend
   spec:
     parentRefs:
     - name: edge-stack-gw
     rules:
     - backendRefs:
       - group: ""
         kind: Service
         name: quote
         port: 80
         weight: 1
       filters:
       - type: URLRewrite
         urlRewrite:
           path:
             type: ReplacePrefixMatch
             replacePrefixMatch: /
       matches:
       - path:
           type: PathPrefix
           value: /backend/
   EOF
   ```

   The `HTTPRoute` is responsible for directing traffic to the appropriate microservice using specific matching criteria.  This example instructs all traffic with the path `/backend/` to be directed to the Quote `Service` while also removing the `/backend/` prefix.

4. Store the $productName$ load balancer IP address to a local environment variable. You will use this variable to test access to your service.

   ```shell
   export ENVOY_SERVICE=$(kubectl get svc -n ambassador --selector=gateway.envoyproxy.io/owning-gateway-namespace=default,gateway.envoyproxy.io/owning-gateway-name=edge-stack-gw \
   -o jsonpath='{.items[0].metadata.name}') && \
   export GATEWAY_HOST=$(kubectl get svc/${ENVOY_SERVICE} -n ambassador -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
   ```

5. Test the configuration by accessing the service through the $productName$ load balancer:

   ```console
   $ curl -ki http://$GATEWAY_HOST/backend/

     HTTP/1.1 200 OK
     content-type: application/json
     date: Fri, 07 Jul 2023 22:36:42 GMT
     content-length: 144
     x-envoy-upstream-service-time: 1
     server: envoy

     {
         "server": "adept-pineapple-78a2ywzv",
         "quote": "A late night does not make any sense.",
         "time": "2023-07-07T22:36:42.818676921Z"
     }
   ```

<Alert severity="success"><b>Victory!</b> You have created your first <code>HTTPRoute</code>, routing a request from your cluster's edge to a service!</Alert>

## <img class="os-logo" src="/images/logo.png"/> What's next?

Explore some of the popular tutorials on $productName$:

- [$productName$ system architecture][]: Learn about the system overview of $productName$ and its components.
- [HTTP Routing][]: Learn more about how to configure routing HTTP traffic
- [Web Application Firewalls][]: Protect your services with Web Application Firewalls.
- [Configure Single Sign On][]: Setup authentication with a variety of identity management platforms.

[Envoy Gateway]: https://github.com/envoyproxy/gateway
[Emissary-ingress]: https://github.com/emissary-ingress/emissary
[Kubernetes]: https://kubernetes.io/
[1. Installation]: #1-installation
[2. Routing traffic from the edge]: #2-routing-traffic-from-the-edge
[What's next?]: #img-classos-logo-srcimageslogopng-whats-next
[GatewayClass]: https://gateway-api.sigs.k8s.io/api-types/gatewayclass/
[Gateway]: https://gateway-api.sigs.k8s.io/api-types/gateway/
[IngressClass]: https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class
[EnvoyProxy]: https://gateway.envoyproxy.io/v0.4.0/user/customize-envoyproxy.html
[Envoy Proxy]: https://www.envoyproxy.io/
[HTTPRoute]: https://gateway-api.sigs.k8s.io/api-types/httproute/
[$productName$ system architecture]: ../../design/system/
[HTTP Routing]: https://gateway-api.sigs.k8s.io/guides/http-routing/
[Web Application Firewalls]: ../../guides/web-application-firewalls/setup
[Configure Single Sign On]: ../../guides/sso/oauth2-sso
