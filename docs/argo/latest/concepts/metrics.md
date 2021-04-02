# How to monitor the canary deployment 

## What key metrics should I monitor in the canary deployment?

Observability is crucial to understanding the quality of the canary version you release. Without being able to monitor the canary's behavior, you can't readily assess whether your new version is ready for wider deployment. Increasingly, developers need to understand these key metrics as part of taking full responsibility for the full build-it, run-it (i.e., availability, reliability and code quality) paradigm. This shift is possible by enabling monitoring for visibility and setting clear metrics to measure performance and troubleshoot problems.

## Four golden signals of monitoring

While other metrics may be important in your rollout, the "four golden signals" are essential metrics for monitoring distributed systems. Each signal tells how your system is running, and indicates problems or performance issues you need to focus on to minimize the effect of unexpected behavior in your rollout and to get an idea as to what might be going wrong.

*   **Latency**: Latency, or response time, is the time required to send a request and receive a response. Defining a latency baseline for successful requests (that is, what does normal look like?) against which you measure failed requests is a place to start. 
*   **Traffic**: Traffic figures count the request numbers moving through the network and help to build a picture of what kind of stress your system is under. Traffic metrics are a good indicator of whether you have factored in enough capacity for demand or have a potential system misconfiguration. 
*   **Errors**: Errors are the rate of requests that fail. They provide information about bugs in your code, configuration errors in the infrastructure, and dependency failures. These errors can also be reflected in other performance metrics, such as higher latency and increased saturation.
*   **Saturation**: Saturation is a measure of system utilization, accounting for the load on resources, such as network, CPU, memory, and so on. Each resource is limited, causing performance to deteriorate as one resource or another gets tapped out. For example, a full CPU can lead to delayed response times.