# Kubernetes basics: Kubernetes for developers

[Kubernetes](../../../../edge-stack/latest/topics/concepts/kubernetes-network-architecture/) (or K8s) is an open-source platform for managing containerized workloads and services. Containers hold the entire runtime environment, that is, an application and all of its dependencies, libraries and configuration files. This makes them portable and predictable across different computing environments.

Experienced developers will at least be familiar with the concepts of cloud-native application development, containers and Kubernetes, but may not know a lot more than that if it hasn’t been part of their work. Cloud native and containerization form a different way of approaching software development, but developers have led the charge in adopting this approach because of its speed and flexibility. Kubernetes in particular has become the de facto standard for cloud-native application development and orchestration largely because of its speed and modularity.

Developers benefit from having at least a basic understanding of Kubernetes as the development landscape shifts to embrace:

*   Containerized workloads and increased automation
*   The write-once, run-everywhere concept and the elimination of complex dependencies or incompatibilities in or across different systems
*   Shared responsibility for managing deployments (operational activities become developer responsibilities)
*   Easier deployment through fully automated rollouts and rollbacks with fine-grained observability and no downtime/minimal end-user disruption
*   Faster feedback: Continuous code deployment and near-instant feedback

Kubernetes also offers developers potential solutions to issues with standard development practices, enabling:

*   The ability to deploy code continuously, with rolling updates and no downtime, improving productivity
*   Use of tools they are already familiar with
*   Better end-user experiences — applications are more resilient and highly available; even frequent changes don’t disrupt the user experience
*   Better automation and monitoring: Automatic rollbacks when things go wrong, fewer manual processes, automatic health checks, etc.
*   The ability to use almost identical development and production environments with continuous deployment/progressive delivery to get a better understanding of how software will behave with real users and traffic

Kubernetes offers developers the possibility to code and release faster and more predictably. Once the different steps involved in containerizing code and deploying it via Kubernetes are broken down, K8s’s benefits, such as its cloud-agnosticism, zero-downtime deployment, health checks, autoscaling, and tooling, become clearer. Development becomes simpler, and developers maintain flexibility and control.

Containerized development is a fundamentally different way of designing and packaging software that requires the creation of an effective development environment and Kubernetes development tools. While Kubernetes promises greater simplicity and autonomy, developers need the right tools, practices and configuration to be productive and to establish a fast development feedback loop. While Kubernetes may streamline development itself, the development environment becomes somewhat more complex.

This added complexity includes developers sharing responsibility for various aspects of the full application life cycle, which is typically operational in nature. Moving to K8s helps introduce automated and replicable deployment processes, which are part of the initial complexity, but ultimately give development teams the freedom to focus their time on development and on shipping software while also giving them a better understanding of and control over what is going on with their deployments.

<!--image here when ready-->

![K8s Basics](../../../../../images/documentation/k8s-basics-inline.svg)

Originally designed and created at Google to help developers ship and scale cloud-native applications, Kubernetes provides container orchestration. The goal of Kubernetes is to help development teams reduce, or at least manage, the complexity of scaling their container infrastructure.

## Defining basic Kubernetes components

To get started with Kubernetes there is some basic terminology that will probably already be familiar to developers, such as clusters, nodes and pods.

A **cluster** is a set of nodes for running containerized apps.

**Nodes** are VMs or physical servers where Kubernetes runs containers. There are two types:

_Master nodes_ are home to ‘control plane’ functions and services and where the desired state of a cluster is maintained by managing the scheduling of pods across various worker nodes.

_Worker nodes_ are where an application actually runs.

**Pods** are the smallest, most basic unit of deployment in Kubernetes. To run an application in Kubernetes, it first needs to be packaged and run as a container. And these containers become pods or parts of pods. A pod can consist of one or more containers. A pod, being the smallest unit Kubernetes can run, is what Kubernetes recognizes, so if a pod is deployed or destroyed, all the containers inside of it are started or killed at the same time.

**Deployment** in Kubernetes defines how pods should be deployed, and how Kubernetes should manage the deployment.

**Kubectl** is the command line interface for managing a Kubernetes cluster.

Armed with these basic concepts (there are many more - just not ones necessary to proceed now), it should be easier to get started with and simplify containerized K8s app development.
