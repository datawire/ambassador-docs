---
description: "Incident response in the cloud-native world | Ambassador Cloud"
title: "Incident response is important any time a system or application does not behave or perform as expected."
---
# Incident response in the cloud-native world

Traditional incident response has been an operational responsibility. Developers haven't usually been involved in the on-call duties that make up a standard approach to incident response. In [cloud-native](/products/ambassador-cloud/), microservices architectures, developers have to take on a broader range of operational responsibilities as part of the full software life cycle. Incident response is, in part, fast becoming one such responsibility.

## What is incident response, and why is it important?

Incident response is required any time a system or application does not behave or perform as expected. Incident response is crucial to resolving issues swiftly, continuing to develop and ship software, maintaining performance, and hopefully learning from that process each time.

While a comprehensive detection, prevention and readiness plan is important, it's equally important to have a plan of action for incident _response_. The modularity of [cloud-native](/learn/kubernetes-glossary/cloud-native/) applications makes it easier, on one hand, to shut broken things down. On the other hand, the same distributed nature of microservices makes it a lot more complex to identify just what has gone wrong. Pinpointing the problem in a dynamic environment with deployments that could be running across several clouds in hundreds or even thousands of containers is a challenge. And exceedingly important because, above all else: **something will inevitably go wrong, and it is more challenging than ever to find out what**. 

_Good_ incident response relies on understanding that **failure is inevitable**. And the key to _quick_ incident response is twofold:

*   **Gaining rapid situational awareness**: Having easy access to insight about both the big picture and more fine-grained data about services in Kubernetes, for example, by getting data from a **service catalog** that can deliver critical core metadata about services and provide a single view of all services across clusters. 
*   **Doing quick troubleshooting and root cause identification**: Root-cause investigation relies on observability approaches, such as information gathering from logging and distributed tracing.

Achieving these two critical parts of investigating and identifying the source of a bug or failure depends on enabling good **[observability](/learn/kubernetes-glossary/observability/)**.

## What is observability?

**Observability** is the set of strategies, practices and tools for pulling together and analyzing data from distributed applications to make monitoring, investigating and actively debugging applications easier. 

Fundamentally, observability is about simplifying troubleshooting. That is, getting a clear idea of how services communicate with each other, what is happening with and tracing ephemeral container workloads, and being able to manage and understand multiple environments and the configurations of the services deployed to them. Observability makes the required situational awareness and root cause analysis and identification possible, and is becoming an essential part of the developer workflow, given the "you build it, you run it" model of Kubernetes-based app development.

## Why is cloud-native incident response a developer responsibility?

[Cloud-native](/resources/enabling-full-cycle-development-kubernetes/) development and modern application architecture demands that the developer take on [full lifecycle development](../../../../../kubernetes/latest/concepts/devloop/) for their app. Full lifecycle development, given the added complexity of potentially hundreds of decoupled microservices, requires a more complete understanding of each stage of software release. And the full stack developer becomes a full lifecycle developer. The primary developer activity remains coding, but the cloud-native approach extends what software developers need to know and do across the full lifecycle beyond just coding. 

A part of what the [cloud-native](/resources/cloud-native-workflow-gitops-and-kubernetes/), Kubernetes developer does is make sure that code is running as intended once deployed, and investigate reasons why when it doesn't. In a [cloud-native](/resources/why-cloud-native/) paradigm, the developer also takes greater ownership of their services, meaning that there is greater responsibility for how they behave throughout the lifecycle. Debugging is central to this work, but distributed applications don't make it easy to investigate bugs and issues. This, of course, is where observability and observability tools enter the picture. Among the most effective observability practices in the cloud-native developer's toolkit are [human-level service discovery](/docs/cloud/latest/service-catalog/concepts/annotating) and [distributed tracing](../../../../../telepresence/latest/concepts/context-prop/#what-is-distributed-tracing). 

Regardless of whether a developer is actively involved in incident response itself, the principles behind modern, cloud-native incident response become concerns for a developer. Empowering the developer with service ownership, observability strategies and tools, and [progressive delivery](/docs/argo/latest/concepts/cicd/) techniques, for example, can help identify vulnerabilities in the code and mitigate risks upon deployment before these issues ever have a chance to become incidents.  
