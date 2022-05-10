# Why is cloud-native development full lifecycle development?

Containerized applications deployed in Kubernetes generally follow the microservices design pattern. That is, an application is made up of many (possibly hundreds) services that need to communicate with each other. In this new microservices architecture, the most effective way for independent application developers and teams to develop productively and ship quickly is to move from _just writing code_ to managing the full lifecycle: **code - ship - run**. 

![Code Ship Run](../../images/codeshiprun.png)

Full lifecycle development and workflows, given the added complexity of potentially hundreds of decoupled microservices, require a more complete understanding of each stage of software release, including coding/development, testing, deployment and running. 

This in turn requires the _full stack_ developer to become a _full lifecycle_ developer. The primary developer activity remains coding, but [cloud native](/resources/why-cloud-native/) extends what software developers need to know and do across the full lifecycle to code, ship and run their software productively.


## What is a full lifecycle developer?

Full lifecycle developers write and package code, deploy the code, making sure it's running correctly, and ship and run applications.

Within a full lifecycle workflow, everything from writing, debugging and testing services to understanding continuous deployment, from ensuring that services can communicate with each other to observability becomes part of the broader, full lifecycle development experience. 


## Why do I need to manage the full software development life cycle?

A microservices architecture demands a different approach to managing software development. In microservices-based, [cloud-native](/products/ambassador-cloud/) development, the app architecture itself becomes microservices. With standalone microservices, which can't do anything in isolation, a full lifecycle developer should have the ability to at least ensure that their microservices can work with other microservices and understand what happens once microservices start communicating with each other. 

The code-ship-run idea, despite becoming more common to the developer experience, isn't straightforward. But the growing number of complex technologies working together to make these distributed applications run means that developers aren't always able to just hand off code to platform teams to deliver. A distributed application, in order to be highly available and scalable, needs to be engineered to address the [fallacies of distributed computing](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing). Coding distributed applications from the ground up, then, a developer has a number of considerations to keep in mind both while coding and after code is shipped, such as the fact that a bunch of microservices need to communicate with each other to work. 

How does microservice-to-microservice communication work…. at least to the degree that it is a developer's concern?