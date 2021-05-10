import Alert from '@material-ui/lab/Alert';

# Ingress Controller

<div class="docs-article-toc">
<h3>Contents</h3>

* [When and how to use the Ingress resource](#when-and-how-to-use-the-ingress-resource)
* [What is required to use the Ingress resource?](#what-is-required-to-use-the-ingress-resource)
* [When to use an Ingress instead of annotations or CRDs](#when-to-use-an-ingress-instead-of-annotations-or-crds)
* [Ingress support](#ingress-support)
* [Examples of Ingress configs vs Mapping configs](#examples-of-ingress-configs-vs-mapping-configs)
* [Ingress routes and mappings](#ingress-routes-and-mappings)
* [The Minimal Ingress](#the-minimal-ingress)
* [Name based virtual hosting with an Ambassador ID](#name-based-virtual-hosting-with-an-ambassador-id)
* [TLS Termination](#tls-termination)

</div>

An Ingress resource is a popular way to expose Kubernetes services to the Internet. In order to use Ingress resources, you need to install an [ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/). The Ambassador Edge Stack can function as a fully-fledged Ingress controller, making it easy to work with other Ingress-oriented tools within the Kubernetes ecosystem.

## When and how to use the Ingress resource

If you're new to Edge Stack and to Kubernetes, we'd recommend you start with our [quickstart](../../../tutorials/getting-started/) instead of this Ingress guide. If you're a power user and need to integrate with other software that leverages the Ingress resource, read on. The Ingress specification is very basic and does not support many of the features of Edge Stack, so you'll be using both the Ingress resource and Edge Stack's Mapping resource to manage your Kubernetes services.

### What is required to use the Ingress resource?

- Know what version of Kubernetes you are using.

   - In Kubernetes 1.13 and below, the Ingress was only included in the `extensions` API.

   - Starting in Kubernetes 1.14, the Ingress was added to the new `networking.k8s.io` API.
   
   - Kubernetes 1.18 introduced the IngressClass resource to the existing `networking.k8s.io/v1beta1` API.

   <Alert severity="info"> If you are using 1.14 and above, it is recommended to use <code>apiVersion: networking.k8s.io/v1beta1</code> when defining an Ingress. Since both are still supported in all 1.14+ versions of Kubernetes, this document will use <code>extensions/v1beta1</code> for compatibility reasons.
   If you are using 1.18 and above, sample usage of the IngressClass resource and <code>pathType</code> field are <a href="https://blog.getambassador.io/new-kubernetes-1-18-extends-ingress-c34abdc2f064"> available on our blog</a>.
   </Alert>

- You will need RBAC permissions to create Ingress resources in either
  the `extensions` `apiGroup` (present in all supported versions of
  Kubernetes) or the `networking.k8s.io` `apiGroup` (introduced in
  Kubernetes 1.14).

- Edge Stack will need RBAC permissions to get, list, watch, and update Ingress resources.

  You can see this in the [`aes-crds.yaml`](/yaml/aes.yaml)
  file, but this is the critical rule to add to Edge Stack's `Role` or `ClusterRole`:

  ```yaml
  - apiGroups: [ "extensions", "networking.k8s.io" ]
    resources: [ "ingresses", "ingressclasses" ]
    verbs: ["get", "list", "watch"]
  - apiGroups: [ "extensions", "networking.k8s.io" ]
    resources: [ "ingresses/status" ]
    verbs: ["update"]
  ```

  <Alert severity="info">
    This is included by default in all Edge Stack installations.
  </Alert>

- You must create your Ingress resource with the correct `ingress.class`.

  Edge Stack will automatically read Ingress resources with the annotation
  `kubernetes.io/ingress.class: ambassador`.

- You may need to set your Ingress resource's `ambassador-id`.

  If you are [using `amabssador-id` on your Module](../running/#ambassador_id), you'll need to add the `getambassador.io/ambassador-id`
  annotation to your Ingress. See the [examples below](#name-based-virtual-hosting-with-an-ambassador-edge-stack-id).

- You must create a Service resource with the correct `app.kubernetes.io/component` label.

  Edge Stack will automatically load balance Ingress resources using the endpoint exposed 
  from the Service with the annotation `app.kubernetes.io/component: ambassador-service`.
  
  ```yaml
  ---
  kind: Service
  apiVersion: v1
  metadata:
    name: ingress-ambassador
    labels:
      app.kubernetes.io/component: ambassador-service
  spec:
    externalTrafficPolicy: Local
    type: LoadBalancer
    selector:
      service: ambassador
    ports:
      - name: http
        port: 80
        targetPort: http
      - name: https
        port: 443
        targetPort: https
  ```

### When to use an Ingress instead of annotations or CRDs

We recommend that Edge Stack be configured using CRDs. The Ingress resource is available to users who need it for integration with other ecosystem tools, or who feel that it more closely matches their workflows. However, it is important to recognize that the Ingress resource is rather more limited than the Edge Stack Mapping is (for example, the Ingress spec has no support for rewriting or for TLS origination). **When in doubt, use CRDs.**

## Ingress support

Edge Stack supports basic core functionality of the Ingress resource, as defined by the [Ingress resource](https://kubernetes.io/docs/concepts/services-networking/ingress/) itself:

* Basic routing is supported, including the `route` specification and the default backend functionality. It's particularly easy to use a minimal Ingress to the Edge Stack diagnostic UI.
* [TLS termination](../tls/) is supported. You can use multiple Ingress resources for SNI.
* Using the Ingress resource in concert with Edge Stack CRDs or annotations is supported. This includes Edge Stack annotations on the Ingress resource itself.

Edge Stack does **not** extend the basic Ingress specification with the following exceptions:

* The `getambassador.io/ambassador-id` annotation allows you to set [the Ambassador ID](../running/#ambassador_id) for the Ingress itself.

* The `getambassador.io/config` annotation can be provided on the Ingress resource, just as on a Service.

Note that if you need to set `getambassador.io/ambassador-id` on the Ingress, you will also need to set `ambassador-id` on resources within the annotation.

## Examples of Ingress configs vs Mapping configs

### Ingress routes and Mappings

Edge Stack actually creates Mapping objects from the Ingress route rules. These Mapping objects interact with Mappings defined in CRDs **exactly** as they would if the Ingress route rules had been specified with CRDs originally.

For example, this Ingress resource routes traffic to `/foo/` to `service1`:

```yaml
---
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: ambassador
  name: test-ingress
spec:
  rules:
  - http:
      paths:
      - path: /foo/
        backend:
          serviceName: service1
          servicePort: 80
```

This is the equivalent configuration using a Mapping instead:

```yaml
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: test-ingress-0-0
spec:
  prefix: /foo/
  service: service1:80
```

This YAML will set up Edge Stack to do canary routing where 50% of the traffic will go to `service1` and 50% will go to `service2`.

```yaml
---
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: ambassador
  name: test-ingress
spec:
  rules:
  - http:
      paths:
      - path: /foo/
        backend:
          serviceName: service1
          servicePort: 80
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: my-mapping
spec:
  prefix: /foo/
  service: service2
```

### The minimal Ingress

An Ingress resource must provide at least some routes or a [default backend](https://kubernetes.io/docs/concepts/services-networking/ingress/#default-backend). The default backend provides for a simple way to direct all traffic to some upstream service:

```yaml
---
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: ambassador
  name: test-ingress
spec:
  backend:
    serviceName: exampleservice
    servicePort: 8080
```

This is the equivalent configuration using a Mapping instead:

```yaml
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: test-ingress
spec:
  prefix: /
  service: exampleservice:8080
```

### Name based virtual hosting with an Ambassador ID

This Ingress resource will result in all requests to `foo.bar.com` going to `service1`, and requests to `bar.foo.com` going to `service2`:

```yaml
---
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: ambassador
    getambassador.io/ambassador-id: externalid
  name: name-virtual-host-ingress
spec:
  rules:
  - host: foo.bar.com
    http:
      paths:
      - backend:
          serviceName: service1
          servicePort: 80
   - host: bar.foo.com
     http:
       paths:
       - backend:
           serviceName: service2
           servicePort: 80
```

This is the equivalent configuration using a Mapping instead:

```yaml
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: host-foo-mapping
spec:
  ambassador_id: externalid
  prefix: /
  host: foo.bar.com
  service: service1
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: host-bar-mapping
spec:
  ambassador_id: externalid
  prefix: /
  host: bar.foo.com
  service: service2
```

Read more on the [Kubernetes documentation on name based virtual routing](https://kubernetes.io/docs/concepts/services-networking/ingress/#name-based-virtual-hosting).

### TLS termination

```yaml
---
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: ambassador
  name: tls-example-ingress
spec:
  tls:
  - hosts:
    - sslexample.foo.com
    secretName: testsecret-tls
  rules:
    - host: sslexample.foo.com
      http:
        paths:
        - path: /
          backend:
            serviceName: service1
            servicePort: 80
```

This is the equivalent configuration using a Mapping instead:

```yaml
---
apiVersion: getambassador.io/v2
kind: TLSContext
metadata:
  name: sslexample-termination-context
spec:
  hosts:
  - sslexample.foo.com
  secret: testsecret-tls
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: sslexample-mapping
spec:
  host: sslexample.foo.com
  prefix: /
  service: service1
```

Note that this shows TLS termination, not origination: the Ingress spec does not support origination. Read more on the [Kubernetes docs on TLS termination](https://kubernetes.io/docs/concepts/services-networking/ingress/#tls).
