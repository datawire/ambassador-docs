# Canary Deployments


## What is a canary deployment?

A **canary deployment** is designed to make sure that a "simple fix" or change to code won't kill your application. Like the proverbial canary being sent into the coal mine, only a small subset of users will be exposed to new code to test what happens. Canary releasing is a feature-rollout strategy that is used to test the viability of a new version of software aimed at rapid delivery without breaking things, i.e. keeping the canary alive.

## How do canary releases limit risk when rolling out software changes?

Canary releases limit risk because changes can easily and quickly be reversed by rolling back the canary and because they are limited to the set of users who could be impacted. The idea is to test effects on a limited subset of users within a real-world production environment to get early warning of potential problems in the code before deploying more widely. In the event of failure, it happens on a small scale and is reversible. 

Because changes are rolled out incrementally at set intervals until rolled out to the entire user base or platform, or until something goes wrong and has to be rolled back, the majority of users are protected from bugs or negative effects introduced by code changes. Detailed monitoring of core service metrics is an essential part of canary releasing to ensure the rapid detection of problems in the canary release.

## How does a canary deployment work?

A canary release diverts a small amount of traffic, for example 1% or 5%, to the new version of a service while still routing the majority of traffic to the old version. This incremental rollout lets you observe how a change will work in practice and roll back if you detect signs of trouble. 

(diagram)

## When should I use a canary deployment strategy?

Good examples of use cases suited for canary deployments include:

*   An application has multiple microservices that change at independent rates, and functionality needs to be tested in a production (or as realistic as possible) environment 
*   When deploying new functionality, there is high operational risk that can be mitigated by experimenting with small subsets of traffic sent to the new deployment
*   When a service depends on a (third-party or legacy) upstream system that cannot effectively be tested against, and the only reliable method to validate successful integration is to actually integrate with this service

## When should I avoid canary deployments?

Canary releases don't fit every case. For example, mission or life-critical cases aren't the time to experiment with canary release techniques:

*   With any system that cannot tolerate failure, canaries are not appropriate. This could include safety, life or mission critical systems
*   In situations in which end users would be overly sensitive to results, i.e. results could be noticed or disrupted. An example here is a canary release of software that handles large amounts of financial data or transactions
*   If the experiment requires modification of backend data (or data store schema) that is incompatible with the current service requirements
*   When the volume of traffic is too low to quickly assess the canary's health. The canary would need to be alive for hours or days to get a good read on health, which could block deployment of further changes.

## What are the benefits of canary releases?

*   Enables low-risk testing in production with real users and use cases 
*   Allows for testing and comparison of multiple versions of a service simultaneously 
*   Less complex than blue-green deployment 
*   Gradual rollout limits the blast radius of any operational issues
*   Gradual release reduces the risk of a bug or error disrupting normal service operation or user experience
*   Easy, quick and safe to rollback to previous version in the event of poor performance

## What are the drawbacks of canary releases?

*   Manual canary releasing/testing can be time consuming and error prone (it's ideal to automate the canary release lifecycle)
*   Potential complexity for scripting a canary
*   Canaries are of little value if the system, application and user behavior aren't observable Observable metrics are what makes a canary worthwhile
*   Without robust mitigation and testing strategies in place, managing incompatibilities between API versions and database schema changes can be challenging

## What do I need to get started with canary releasing?

To get started with canary releasing, you'll need:

*   an API Gateway to manage the flow of traffic to your services, e.g. Ambassador Edge Stack
*   a CI/CD pipeline integrated with a continuous deployment workflow, e.g., Argo
*   an observability system

Canary releases are typically implemented via a proxy like [Envo](https://www.envoyproxy.io/)y, a smart router, or configurable load balancer. Releases can be triggered by continuous integration/delivery pipeline tooling. 

## What is required for a successful canary deployment?

*   **Basic automated (continuous) delivery pipelines**: Canary releasing relies on deploying and running multiple versions of a service, which is challenging without automation. A delivery pipeline with basic continuous integration and quality assurance on a service will be enough.
*   **Observability**: Basic monitoring (observability) is necessary to see whether and how a canary is causing problems. It should provide data on latency, traffic, errors and saturation. For example, a canary service causing CPU or I/O to spike above tolerable levels isn't an ideal candidate for continuing to migrate traffic. 

To make canary releases successful, you also need: 

*   **Large enough traffic/user request sample**: Not every system has millions of requests every day, making it challenging to push enough traffic into a canary release to validate it adequately. Coupled with traffic volume, the canary needs representative types of user requests to test all execution paths. For example, if a feature undergoing canary testing is something that each user taps into once a year, only an unusually high number of users would generate a statistically significant validation. 
*   **KPIs to define business success**: A set of metrics to measure whether or not your business goals are being met when rolling out new functionality, such as an increase in customer spend or fewer support calls. You want to be able to monitor for negative impact on your metrics of success to be able to roll back the release if this occurs.