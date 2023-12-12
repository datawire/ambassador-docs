---
    Title: Ship with Argo
    description: How Argo can change the way you Ship
---

# Ship with Argo

In the cloud-native software world, the common paradigm is “you build it, you run it”. It's important for a full lifecycle developer needs to have an understanding of the code-ship-run workflow. The inner-development loop, where an individual developer codes, builds, and tests their software is just the beginning. When developers have to take on full lifecycle development responsibility, it's important to have a way to ship code safely without any disruption for the end-user experience. That's where Argo excels. 
 
To understand how to ship safely, it is important to understand the practiced of continuous integration/continuous delivery (CI/CD). 

## What is CI/CD? 

Most software developers have experience with continuous integration/continuous delivery (CI/CD) practices. CI/CD is evolving to include [progressive delivery](/learn/kubernetes-glossary/progressive-delivery/) and continuous deployment, which is why the growing list of terms causes occasional confusion. The same basic CI/CD principles persist, but progressive delivery strategies and continuous deployment patterns aim to automate deployment and release and give developers faster feedback loops and safer deployments.

So, how do continuous integration/continuous delivery and progressive delivery/continuous deployment differ, and why is the distinction important? 

**Continuous integration/continuous delivery (CI/CD)** is a familiar pattern for getting changes to features, configuration, and bug fixes, into production safely. Once these principles are integrated into your development practices, [progressive delivery](/docs/edge-stack/latest/topics/concepts/progressive-delivery/) and continuous deployment become the logical extensions to the delivery and deployment landscape. CI/CD form a combined practice of integrating and delivering code into a production environment smoothly and consistently. 

**Continuous integration (CI)** is the automation process and development practice that lets teams of developers introduce code changes to an application, run test suites for quality assurance, and build software artifacts on a continuous basis. 

**Continuous delivery (CD)** is the process that introduces an consistent flow of changes — from artifacts and version updates to configuration changes — into a production environment as safely as possible. When continuous delivery changes are made, these changes rely on team decisions. Continuous deliver alleviates the kinds of business processes which can slow work down and create unnecessary friction. 

**Continuous deployment** is the software release process that uses automated integration and end-to-end testing to validate changes. With continuous delivery, you can observe the system’s health, and quickly adapt to changes in the state of your production environment. [Continuous deployment](/continuous-deployment-pyramid/) is the natural extension to continuous delivery. While both continuous deliver and continuous deployment are automated, team members don't intervene in continuous deployment. Deployment and release happen automatically. The only way a change won't be deployed to production is if an automated check fails. 

A **CI/CD pipeline** is a process specifying steps that must be taken to deliver a new version of  software. A CI/CI pipeline consists of workflows, activities and automation. Automation is key to scaling CD, accelerating application delivery and making developers' lives easier in the cloud-native environment. For developers, GitOps and Argo are central to the evolution of CI/CD.


## How are deployments and releases different?

The terminology around CI/CD and progressive delivery is tricky when you define the different phases of the software shipping cycle. These terms are _not_ interchangeable. 

**Deployment** refers to a version of software is which is running somewhere within the production environment. This software is ready to handle production traffic, though it isn't receiving that traffic yet. Deployment is nearly risk-free in that end users are not exposed to the new version of the service. The deployment phase can introduce risk mitigation in the form of progressive delivery techniques, such as canary releasing, for safer, incremental [rollouts](../..//reference/rolloutcrd/).

**Release** refers to the process of moving your production traffic to the new version of the software where users can access it. 

## So how do rollouts make the Ship process safe?

Experiment-oriented progressive rollout techniques, such as **blue-green deployments**, **[canary releases](https://blog.getambassador.io/cloud-native-patterns-canary-release-1cb8f82d371a)** and other advanced deployment capabilities, facilitate proactive risk mitigation with:

*   Realistic test environments.
*   The ability to apply fine-grained control of traffic and introduce automated rollbacks.
*   The ability to observe and measure what's happening.
