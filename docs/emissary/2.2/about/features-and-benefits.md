# Features and benefits

In cloud-native organizations, developers frequently take on responsibility for the full development lifecycle of a service, from development to QA to operations. $productName$ was specifically designed for these organizations where developers have operational responsibility for their service(s).

As such, the $productName$ is designed to be used by both developers and operators.

## Self-Service via Kubernetes Annotations

$productName$ is built from the start to support _self-service_ deployments -- a developer working on a new service doesn't have to go to Operations to get their service added to the mesh, they can do it themselves in a matter of seconds. Likewise, a developer can remove their service from the mesh, or merge services, or separate services, as needed, at their convenience. All of these operations are performed via Kubernetes resources or annotations, so they can easily integrate with your existing development workflow.

## Flexible canary deployments

[//]: # (+FIX+ Forge is no more)

Canary deployments are an essential component of cloud-native development workflows. In a canary deployment, a small percentage of production traffic is routed to a new version of a service to test it under real-world conditions. $productName$ allows developers to easily control and manage the amount of traffic routed to a given service through annotations. [This tutorial](https://www.datawire.io/faster/canary-workflow/) covers a complete canary workflow using the $productName$.

## Kubernetes-native architecture

[//]: # (+FIX+ we've come to realize that it's better to scale vertically)

$productName$ relies entirely on Kubernetes for reliability, availability, and scalability. For example, $productName$ persists all state in Kubernetes, instead of requiring a separate database. Scaling the $productName$ is as simple as changing the replicas in your deployment, or using a [horizontal pod autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/).

$productName$ uses [Envoy](https://www.envoyproxy.io) for all traffic routing and proxying. Envoy is a modern L7 proxy that is used in production at companies including Lyft, Apple, Google, and Stripe.

## gRPC and HTTP/2 support

$productName$ fully supports [gRPC](../../howtos/grpc/) and HTTP/2 routing, thanks to Envoy's extensive capabilities in this area. See [gRPC and $productName$](../../howtos/grpc) for more information.

## Istio Integration

$productName$ integrates with the [Istio](https://istio.io) service mesh as the edge proxy. In this configuration, $productName$ routes external traffic to the internal Istio [service mesh](/learn/service-mesh/). See [Istio and $productName$](../../howtos/istio) for details.

## Authentication

$productName$ supports authenticating incoming requests using a custom authentication service. When configured, the $productName$ will check with your external authentication service prior to routing an incoming request. For more information, see the [authentication guide](../../topics/running/services/auth-service).

## Rate limiting

$productName$ supports [rate limiting](../../topics/running/services/rate-limit-service/) incoming requests. When configured, the $productName$ will check with a third party rate limit service prior to routing an incoming request. For more information, see the [rate limiting guide](../../topics/using/rate-limits/).

## Integrated UI

$productName$ includes a diagnostics service so that you can quickly debug issues associated with configuring the $productName$. For more information, see [running $productName$ in Production](../../topics/running).
