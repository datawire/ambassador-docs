---
title: "Annotations overview | Ambassador Cloud"
description: "Often overlooked, Kubernetes annotations are designed to add metadata to Kubernetes objects. Learn best practices for annotations for your environments."
---

# Annotations Overview

Have you ever been asked to troubleshoot a failing Kubernetes service and struggled to find basic information about it such as the source repository and owner?

One of the problems as Kubernetes applications grow is the proliferation of services. As the number of services grows, developers start to specialize working with specific ones. When it comes to troubleshooting, however, developers need to be able to find the source, understand the service and dependencies, and chat with the owning team for any service.

## Human service discovery

Troubleshooting always begins with information gathering. While much attention has been paid to centralizing machine data (e.g., logs, metrics), much less attention has been given to the human aspect of service discovery. Who owns a particular service? What Slack channel does the team work on? Where is the source for the service? What issues are currently known and being tracked?

## Kubernetes annotations

Often overlooked, Kubernetes annotations are designed to add metadata to Kubernetes objects. The [Kubernetes documentation](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/) says annotations can “attach arbitrary non-identifying metadata to objects.” This means that annotations should be used for attaching metadata that is external to Kubernetes.  As such, annotations can contain any type of data.

This is in contrast to labels, which are designed for uses internal to Kubernetes. Label structure and values are [constrained](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set) so they can be efficiently used by Kubernetes.

## Kubernetes annotations in action

Here is an example. Imagine you have a Service called `quote`. You can do the following to add an annotation to it:

```
kubectl annotate service quote a8r.io/owner=”@sally”
```

We've just added an annotation called `a8r.io/owner` with the value of @sally. Now, we can use `kubectl describe` to get the information:

```
$ kubectl describe service quote

  Name:              quote
  Namespace:         default
  Labels:            <none>
  Annotations:       a8r.io/owner: @sally
  Selector:          app=quote
  Type:              ClusterIP
  IP:                10.109.142.131
  Port:              http  80/TCP
  TargetPort:        8080/TCP
  Endpoints:         <none>
  Session Affinity:  None
  Events:            <none>
```

You can also add the same annotation via your Service's YAML:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: quote
  annotations:
    a8r.io/owner: @sally
spec:
  selector:
    app: quote
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

## Visualizing annotations: Service catalogs

As the number of microservices and annotations proliferate, running `kubectl describe` can get tedious and requires every developer to have some direct access to the cluster.

Recently, service catalogs have provided greater visibility in the Kubernetes ecosystem. Popularized by tools such as [Shopify's ServicesDB](https://shopify.engineering/scaling-mobile-development-by-treating-apps-as-services) and [Spotify's System Z](https://dzone.com/articles/modeling-microservices-at-spotify-with-petter-mari), service catalogs are internally-facing developer portals that present critical information about microservices.

Note that these service catalogs should not be confused with the [Kubernetes Service Catalog project](../../howtos/organize-service-catalog/). Built on the Open Service Broker API, the Kubernetes Service Catalog enables Kubernetes operators to plug different services (e.g., databases) into their cluster.

## Annotate your services now and thank yourself later

Much like implementing observability within microservice systems, you often don’t realize that you need human service discovery until it’s too late. Don't wait until something is on fire in production to start wishing that you had documented who owns any particular service.

There's enormous benefits to building an effective “version 0” service: a [*dancing skeleton*](https://containerjournal.com/topics/container-management/dancing-skeleton-apis-and-microservices/) application with a thin slice of complete functionality that can be deployed to production with a minimal yet effective continuous delivery pipeline.

Adding service annotations should be an essential part of your “version 0” for all of your services. Add them now, and you’ll thank yourself later.