# Using K8s for App Development

As the Kubernetes ecosystem grows, it becomes increasingly difficult to find the most basic information needed to get started. Official Kubernetes documentation, for example, dives straight into _deploying_ a containerized application on a cluster, which skips a few steps. Before you can deploy a containerized application, you need to find out how to package software as containers and deploy to Kubernetes. How do you get code into Kubernetes in the first place?  

## Getting code into Kubernetes

Kubernetes does nothing for you without first packaging your software as a container. 

...process of getting code into Kubernetes where you have to talk about container builds, registries, etc. doesn't seem to be as well explained. I think this is a huge opportunity for us, and we can also create a good diagram for this….

What you need...

## Deploying a containerized application

Cloud-native lends itself to GitOps-style deployments: unifying deployment and monitoring - goal of GitOps: speed up development so team can make changes and updates safely in complex applications running in K8s.

GitOps for automated deployment using tools like Argo for progressive delivery, testing and safer rollouts with techniques like canary deployments. 

## Debugging a containerized application

Invest in Telepresence to make it easier to debug applications in a Kubernetes cluster. 
