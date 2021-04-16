# Using Kubernetes for app development

If the aim is to ship software faster, as Kubernetes promises, there are a few things a developer needs to know to get from code to container to deployment into Kubernetes to running a Kubernetes cluster. 

The process requires:

*   **Packaging code in containers**

    Kubernetes itself does not actually run code - K8s is the orchestration engine. Before reaching this stage, code first needs to be packaged in a container, and Docker is one such common container format. 

*   **Describing how the application should run**

    For each container, Kubernetes reads a manifest that describes how the container should be run. These manifests are written in YAML and encode configuration details, such as the number of instances of the container or how much memory should be allocated to the given container. 

*   **Pushing the container to registry for use**

    The Kubernetes cluster accesses the container image through the registry in order to deploy.

*   **Deploying containers in Kubernetes**

    A declarative setup contains all the relevant information about the desired state of the application, which Kubenetes will then run and maintain. Kubernetes reads the manifest and runs the containers based on the specification.

There are a number of steps involved in the process of getting a service running in Kubernetes, which might be no big deal if this weren’t frequent. But developers repeat this process all the time. It makes sense to automate the deployment process, and this is where the value of Kubernetes becomes clear.

[This guide](../../howtos/codetocluster) provides more detail on how to take each of these steps.

The steps above outline a basic starting point for Kubernetes. To get the most value — that is, being able to code and ship faster with the least amount of friction, there is more to know. 
