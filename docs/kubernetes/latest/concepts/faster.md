# How can Kubernetes help me code and ship faster?

Development is moving toward a "you build it, you run it" model. The full life cycle of a service, including coding, testing, deployment, and release, is becoming a part of the development team's workflow. In spite of these added steps, a developer's primary concern remains shipping code faster and releasing applications to end users. With microservices and containerized apps, development itself can be quicker and more independent. But development is only half the picture. 

The developer experience is fundamentally changing as developers assume an active role in managing the full life cycle of their applications. Because these aspects of the life cycle have shifted, the way software ships has shifted as well. With Kubernetes there are new and better ways to support the incremental release of functionality to end users and enable testing in production and easy rollback.  


## The outer dev loop and supporting the full life cycle with Kubernetes

The outer dev loop is a shared developer workflow that is orchestrated by a continuous integration system. As soon as code is pushed into version control, it leaves the inner dev loop and is shared in the outer loop. 

Cloud-native development and containerized applications promise speed in getting software in front of users faster. But it's also about faster internal processes, such as facilitating rapid delivery of experiments into production, which support speed in getting software released to end users. 

The traditional outer development loop for software engineers, which includes code merge, code review, building an artifact, test execution, and deployment has evolved along with this changing release pattern. A typical modern outer loop now consists of aspects of the full life cycle: code merge, automated code review, build artifact and container, test execution, deployment, controlled (canary) release, and observation of results. If a developer doesn’t have access to self-service configuration of the release then the time taken for this outer loop increases by at least an order of magnitude, e.g. 1 minute to deploy an updated canary release routing configuration versus 10 minutes to raise a ticket for a route to be modified via the platform team. 

To maintain the velocity of development and realistic testing, outer dev loop activities should be as automated as possible. While developers spend most of their time working in the inner dev loop, they nevertheless need to be concerned with what happens in the outer dev loop. Some of the key concepts of full life cycle management, particularly outer dev loop activity, include progressive delivery to support automated deployment and release, and observability to enable the collection and analysis of end-user and application feedback to loop back into the inner dev loop, all of which contribute to the ability to code and ship faster. 
