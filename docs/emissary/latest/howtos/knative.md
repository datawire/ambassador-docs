# Knative Serverless Framework

[Knative](https://knative.dev/) is a popular Kubernetes-based platform for managing serverless workloads with two main components:

- Eventing: Management and delivery of events
- Serving: Request-driven compute that can scale to zero

We will be focusing on Knative Serving, which builds on Kubernetes to support deploying and serving of serverless applications and functions.

Ambassador can watch for changes in Knative configuration in your Kubernetes cluster and set up routing accordingly.

**Note:** Knative was originally built with Istio handling cluster networking. This integration lets us replace Istio with  Ambassador, which will dramatically reduce the operational overhead of running Knative.

## Getting started

### Prerequisites

- Knative requires Kubernetes version v1.14 or later.
- The `kubectl` command-line tool, v1.10 or later, is also required. 
- This guide assumes that you’ve already created a Kubernetes cluster that you’re comfortable installing alpha software on.

### Installation

Install the latest Knative Serving with Ambassador to handle traffic to your serverless applications by following the instructions [here](https://knative.dev/docs/admin/install/knative-with-operators/).

See the [Knative documentation](https://knative.dev/docs/) for more information.
