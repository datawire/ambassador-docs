# What is Argo? 

[Argo](https://www.getambassador.io/products/argo/) is an open source suite of projects that helps developers deliver software more rapidly and safely. Argo tools enable progressive delivery by letting developers define a set of tasks required for shipping and distributing their services. Kubernetes-native Argo makes it easier for developers to deploy and release their own applications. 

**Argo Workflows and Pipelines** is a container-native workflow engine for orchestrating parallel jobs on Kubernetes. 

**Argo Events** is an event-driven workflow automation framework and dependency manager that helps you manage Kubernetes resources, Argo Workflows, serverless workloads, etc. on events from a variety of sources.

**Argo CD** is a GitOps-based continuous deployment tool for Kubernetes. Configuration logic lives in Git and let developers use the same development, review and approval workflow they already use with Git-based repositories for code. While Argo CD does not do continuous integration, it can integrate with your CI system.

**Argo Rollouts** is a progressive delivery controller created for Kubernetes. Argo Rollouts facilitate progressive deployment techniques for rolling updates, including canary deployments, blue/green deployments, A/B tests and more. 

Within a GitOps context, Argo makes application deployment and lifecycle management easier, particularly as the line between developers and operators disappears, because it automates deployment, makes rollbacks easier and is auditable for easier troubleshooting.

## How can I ship software faster - _safely_?

In the "you build it, you run it" style of cloud-native application development, the full life cycle of a service, including coding, testing, deployment, release and operations, becomes a part of the development team's workflow. Working with microservices on smaller, independent services enables autonomy and speed, but this adds complexity. Making these services work together without breaking anything adds risk to the deployment equation.

It's inevitable that you'll ship bugs, and things are going to break. How can you limit the scope and scale of the damage and keep things running?

This is where progressive delivery strategies, GitOps, Argo CD, Argo Rollouts and other advanced deployment capabilities enter the picture.  