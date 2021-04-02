# CI/CD and progressive delivery - Safely shipping code

## What is CI/CD? 

Most software developers have experience with continuous integration/continuous delivery (CI/CD) practices. CI/CD is evolving to include progressive delivery and continuous deployment, which is why the growing list of terms causes occasional confusion. The same basic CI/CD principles persist, but progressive delivery strategies and continuous deployment patterns aim to automate deployment and release and give developers faster feedback loops and safer deployments.

How do CI/CD, progressive delivery and continuous deployment differ, and why is the distinction important? 

**CI/CD** is a familiar pattern for getting changes to features, configuration, bug fixes, and so on, into production safely. If these principles are already well-understood, progressive delivery and continuous deployment will be logical extensions to the delivery and deployment landscape.

**Continuous integration/continuous delivery (CI/CD)** form a combined practice of integrating and delivering code continuously into a production environment. CI/CD is a well-known practice in developer circles already, widely adopted to ensure safe and reliable software delivery.

**Continuous integration (CI)** is an automation process and development practice that lets teams of developers introduce code changes to an application, run test suites for quality assurance, and build software artifacts on a continuous basis. 

**Continuous delivery (CD)** is a process that introduces changes, from artifacts and version updates to configuration changes, into a production environment as safely as possible. When continuous delivery changes are made, these changes rely on a human decision.

Developing for fast-moving, cloud-native environments poses new challenges that increasingly call for something more than continuous delivery. Delivering larger sets of microservice-based applications at an increasing velocity, traditional CD is often not often enough to maintain the speed required at an acceptable risk level. The combination of independent service teams all building and releasing concurrently, and multiple services collaborating at runtime to provide business functionality can slow things down and create friction. 

**Continuous deployment** is a software release process that uses automated integration and end-to-end testing to validate changes, along with the observability of the system’s health signals, to autonomously change the state of a production environment. 

Continuous deployment extends continuous delivery. While both CDs are automated, humans do not intervene in continuous deployment. Deployment and release happen automatically, and the only way a change won't be deployed to production is if an automated check fails. 

With continuous deployment, developers can get their code into real-world conditions and benefit from faster feedback loops, better decision-making, and the ability to safely deploy more code.

A **CI/CD pipeline** is a process specifying steps that must be taken to deliver a new version of  software. A CI/CI pipeline consists of workflows, activities and automation. Automation is key to scaling CD, accelerating application delivery and making developers' lives easier in the cloud-native environment. For developers, GitOps and Argo are central to the evolution of CI/CD.


## What is the difference between deployment and release?

The terminology around CI/CD/CD and progressive delivery starts to get murky when defining different phases of the software shipping cycle. Terms are _not_ interchangeable. Precise definitions based on specific uses of terms helps to clarify the roles of each phase.

“Deployment” and “release” are two different, though similar, steps in the ship cycle. 

**Deployment** means that a version of software is running somewhere within the production environment, ready to handle production traffic but not yet receiving any. Deployment is almost zero-risk in that end users are not exposed to the new version of the service. The deployment phase can introduce risk mitigation in the form of progressive delivery techniques, such as canary releasing, for safer, incremental rollouts. 

**Release** is the process of moving production traffic to the new version of the software and getting it in front of users. 

## What is progressive delivery and how can rollouts make shipping code safer?

**[Progressive delivery](https://www.getambassador.io/docs/edge-stack/latest/topics/concepts/progressive-delivery/)** is a practice that builds on CI/CD principles but adds processes and techniques for gradually rolling out new features with good observability and tight feedback loops. Progressive delivery provides a fast-moving but risk-sensitive way to exert more fine-grained control over delivery. Progressive delivery makes the rollout of new features and testing them in a production environment possible without introducing significant disruption. 

Experiment-oriented progressive rollout techniques, such as **blue-green deployments**, **canary releases** and other advanced deployment capabilities, facilitate proactive risk mitigation with:

*   realistic test environments
*   the ability to apply fine-grained control of traffic and introduce automated rollbacks
*   the ability to see and measure what's happening, i.e. good observability

Implementing progressive delivery techniques is somewhat novel for developers as they assume more responsibility for the full life cycle of their application. Luckily, with GitOps, developers have a familiar Git-driven means for putting progressive delivery into practice. What exactly is GitOps, and how does it facilitate progressive delivery and continuous deployment?
