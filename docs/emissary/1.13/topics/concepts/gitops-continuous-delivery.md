---
  indexable: false
---

# The Ambassador operating model: GitOps and continuous delivery

Containerized applications deployed in Kubernetes generally follow the microservices design pattern, where an application composed of dozens or even hundreds of services communicate with each other. Independent application development teams are responsible for the full lifecycle of a service, including coding, testing, deployment, release, and operations. By giving these teams independence, microservices enable organizations to scale their development without sacrificing agility.

## Policies, declarative configuration, and Custom Resource Definitions

$productName$ configuration is built on the concept of _policies_. A policy is a statement of intent and codified in a declarative configuration file. $productName$ takes advantage of Kubernetes Custom Resource Definitions (CRDs) to provide a declarative configuration workflow that is idiomatic with Kubernetes.

Both operators and application developers can write policies. Typically, operators are responsible for global policies that affect all microservices. Common examples of these types of policies include TLS configuration and metrics. Application development teams will want to own the policies that affect their specific service, as these settings will vary from service to service. Examples of these types of service-specific settings include protocols (e.g., HTTP, gRPC, TCP, WebSockets), timeouts, and cross-origin resource sharing settings.

Because many different teams may need to write policies, $productName$ supports a decentralized configuration model. Individual policies are written in different files. $productName$ aggregates all policies into one master policy configuration for the edge.

## Continuous delivery and GitOps

Code cannot provide value to end-users until it is running in production. [Continuous Delivery](https://continuousdelivery.com/) is the ability to get changes of all types -- including new features, configuration changes, bug fixes, and experiments -- into production, and in front of customers safely and quickly in a sustainable way.

[GitOps](https://www.weave.works/technologies/gitops/) is an approach to continuous delivery that relies on using a source control system as a single source of truth for all infrastructure and configuration. **In the GitOps model, configuration changes go through a specific workflow:**

1. All configuration is stored in source control.
2. A configuration change is made via pull request.
3. The pull request is approved and merged into the production branch.
4. Automated systems (e.g., a continuous integration pipeline) ensure the configuration of the production branch is in full sync with actual production systems.

Critically, no human should ever directly apply configuration changes to a live
cluster. Instead, any changes happen via the source control system. This entire
workflow is also self-service; an operations team does not need to be
directly involved in managing the change process (except in the review/approval
process, if desirable).

Contrast this a **traditional, manual workflow:**

1. App developer defines configuration.
2. App developer opens a ticket for operations.
3. Operations team reviews ticket.
4. Operations team initiates infrastructure change management process.
5. Operations team executes change using UI or REST API.
6. Operations team notifies app developer of the change.
7. App developer tests change, and opens a ticket to give feedback to operations if necessary.

The self-service, continuous delivery model is critical for ensuring that edge operations can scale.

## Continuous delivery, GitOps, and $productName$

Adopting a continuous delivery workflow with $productName$ via GitOps provides several advantages:

1. **Reduced deployment risk**: By immediately deploying approved configuration into production, configuration issues can be rapidly identified. Resolving any issue is as simple as rolling back the change in source control.
2. **Auditability**: Understanding the specific configuration of $productName$ is as simple as reviewing the configuration in the source control repository. Moreover, any changes made to the configuration will also be recorded, providing context on previous configurations.
3. **Simpler infrastructure upgrades**: Upgrading any infrastructure component,
   whether the component is Kubernetes, $productName$, or some other piece of
   infrastructure, is straightforward. A replica environment can be easily
   created and tested directly from your source control system. Once the
   upgrade has been validated, the replica environment can be swapped into
   production, or production can be live upgraded.
4. **Security**: Access to production cluster(s) can be restricted to senior operators and an automated system, reducing the number of individuals who can directly modify the cluster.

In a typical $productName$ GitOps workflow:

* Each service has its own $productName$ policy. This policy consists of one or more $productName$ custom resource definitions, specified in YAML.
* This policy is stored in the same repository as the service, and managed by the service team.
* Changes to the policy follow the GitOps workflow discussed above (e.g., pull request, approval, and continuous delivery).
* Global configuration that is managed by operations are stored in a central repository alongside other cluster configuration. This repository is also set up for continuous delivery with a GitOps workflow.

## Further reading

* The [AppDirect engineering team](https://blog.getambassador.io/fireside-chat-with-alex-gervais-accelerating-appdirect-developer-workflow-with-ambassador-7586597b1c34) writes $productName$ configurations within each team's Kubernetes service YAML manifests. These are stored in git and follow the same review/approval process as any other code unit, and a continuous delivery pipeline listens on changes to the repository and applies changes to Kubernetes.
* Netflix introduces [full cycle development](https://netflixtechblog.com/full-cycle-developers-at-netflix-a08c31f83249), a model for developing microservices
