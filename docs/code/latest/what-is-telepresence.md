---
Title: What is Telepresence and how does it help you Code.
description: "Familiarize yourself with Ambassador Labs' Telepresence and learn how you can leverage it to improve the way you Code"
---

# What is Telepresence

Telepresence is an open source tool that lets developers [code and test microservices locally against a remote Kubernetes cluster](../quick-start/). Telepresence facilitates more efficient development workflows while relieving the need to worry about other service dependencies. In short, Telepresence helps you code and iterate more efficiently.

To achieve [fast, efficient development](https://www.getambassador.io/use-case/local-kubernetes-development/), developers need a set of approaches to bridge the gap between remote Kubernetes clusters and local development, and reduce time to feedback and debugging. However, modern microservices-based applications deployed into Kubernetes often consist of tens or hundreds of services. The resource constraints and number of these services means that it is often difficult to impossible to run all of this on a local development machine, which makes fast development and debugging very challenging. The fast inner development loop from previous software projects is often a distant memory for cloud developers.

With Telepresence, you can connect your local development machine seamlessly to the cluster through a two way proxying mechanism. This way, you to code locally and run the majority of your services within a remote Kubernetes cluster. This grants you effectively unlimited resources in the cloud.

## What are intercepts?

Telepresence enables you to create [intercepts](../intercepts-overview/) to direct select traffic from a service without disrupting other traffic. This way you can code and debug your associated service locally using your preferred local IDE and in-process debugger. You can test your integrations by making requests against the remote cluster’s ingress and observe how the resulting internal traffic is handled by your service running locally. You can also share a preview of your intercept with others on your tem for real-time collaboration. 


## How this helps you code more efficiently

The dev loop can be jump-started with the right development environment and Kubernetes development tools to support speed, efficiency and collaboration. Telepresence is designed to let Kubernetes developers code as though their laptop is in their Kubernetes cluster, enabling the service to run locally and be proxied into the remote cluster. Telepresence runs code locally and forwards requests to and from the remote Kubernetes cluster, bypassing the much slower process of waiting for a container to build, pushing it to registry, and deploying to production.

A rapid and continuous feedback loop is essential for productivity and speed; Telepresence enables the fast, efficient feedback loop to ensure that developers can access the rapid local development loop they rely on without disrupting their own or other developers' workflows. Telepresence safely intercepts traffic from the production cluster and enables near-instant testing of code, local debugging in production, and preview URL functionality to share dev environments with others for multi-user collaboration.

Telepresence works by deploying a two-way network proxy in a pod running in a Kubernetes cluster. This pod proxies data from the Kubernetes environment (e.g., TCP connections, environment variables, volumes) to the local process. This proxy can intercept traffic meant for the service and reroute it to a local copy, which is ready for further (local) development.

The intercept proxy works thanks to context propagation, which is most frequently associated with distributed tracing but also plays a key role in controllable intercepts and preview URLs.
