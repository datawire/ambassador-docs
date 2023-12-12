# Explore distributed tracing and Kubernetes monitoring

The Kubernetes monitoring and distributed tracing landscape is hard to grasp. Although this conceptual approach to [observability is nothing new](https://blog.getambassador.io/distributed-tracing-with-java-microdonuts-kubernetes-and-the-ambassador-api-gateway-ace15b62a89e) — companies like New Relic revolutionized single-application performance monitoring (APM) over a decade ago — it took a few years and the [Dapper publication](https://research.google/pubs/pub36356/) for this idea to migrate to distributed applications. The importance of this technology is only increasing, as more and more of us are building [“deep systems”](https://lightstep.com/deep-systems/).

As the industry is slowly but surely maturing, standardization is underway. Standardization means proprietary vendor solutions and open source projects are able to collaborate, making our lives easier. For newcomers, understanding the plethora of options, concepts, specifications, and implementations available is still a daunting task:

* How are Zipkin and Jaeger related?
* What is header propagation?
* Which headers format should I use?
* Who owns the initialization of a trace context?
* How are the data points collected?

The [K8s Initializer](https://app.getambassador.io/initializer/) can make it easy to enable distributed tracing in any microservices-based system by offering an opinionated and preconfigured application stack that will get you up and running in no time. This way, you can focus on understanding your service topology and interactions rather than waste days on attempting to understand competing standard integrations and tuning configuration switches.

## One-Click Tracing Configuration with the K8s Initializer

The K8s Initializer is a tool we built for you to quickly bootstrap any Kubernetes cluster with your own application-ready playground. It will generate YAML manifests for ingress, observability, and more in just a few clicks. Once installed on a local or remote Kubernetes cluster, the generated Kubernetes manifest resources will give you a perfect sandbox environment to deploy your own applications and explore standard integrations.

Specifically for observability and distributed tracing, the K8s Initializer bundles a Jaeger installation to collect and visualize traces along with a pre-configured $productName$ acting as the ingress controller that will create a trace context on every request. A single selection is required.

As per the option we selected, we’ll be generating Zipkin-format traces and use B3 headers for propagation between our services. There you have it! Instrument your Java, Python, Golang or Node.js applications with Zipkin and B3 header propagation libraries, then configure your code to send the trace data to the `jaeger-collector.monitoring:9411` service endpoint.

All that is left to do is making a few requests and visualizing the trace data in the Jaeger UI.

## Visualizing Trace Data

As we installed the $productName$ as our ingress controller for Kubernetes via the K8s Initializer, it will instrument parent trace spans for each request coming into our Kubernetes cluster from the internet. The K8s Initializer also pre-configured $productName$ to exposes the Jaeger UI on a subpath: `https://$AMBASSADOR_IP/jaeger/`

Simply by visiting this URL on our installation, we are able to visualize the generated and collected trace information emitted by our $productName$ installation:

![Jaeger screenshot](../../images/jaeger.png)

## Tracing the Future: OpenTelemetry

The [OpenTelemetry project](https://opentelemetry.io/) was created with the intent of stopping the proliferation of API standards and libraries one might need to support for all their observability needs, effectively replacing the Zipkin-API, OpenCensus, OpenTracing and more competing implementations.

> OpenTelemetry provides a single set of APIs, libraries, agents, and collector services to capture distributed traces and metrics from your application. You can analyze them using Prometheus, Jaeger, and other observability tools.<br/>
-[https://opentelemetry.io/](https://opentelemetry.io/)

It’s at this point in the conversation that someone inevitably mentions that XKCD...

![XKCD #927](../../images/xkcd.png)

OpenTelemetry ultimately supports multiple formats in its [OpenTelemetry-Collector](https://github.com/open-telemetry/opentelemetry-collector), easing the transition from one technology to another when installed as a middleware and translator to relay trace data to other collectors. Along with many of its long-awaited features, it supports multiple trace exporters for Jaeger, Zipkin and proprietary APIs.

## Learn More
In this tutorial, we’ve shown you how to monitor your Kubernetes application with distributed tracing in just a few clicks with the K8s Initializer. To learn more about these tools and distributed tracing, we also recommend [A Complete Guide to Distributed Tracing by the Lightstep Team](https://lightstep.com/distributed-tracing/).

We also have guides to setup $productName$ with [Datadog](../tracing-datadog/), [Zipkin](../tracing-zipkin/), and [Prometheus and Grafana](../prometheus).
