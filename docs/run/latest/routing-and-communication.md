---
Title: Routing and communication in Edge Stack.
description: An overview of communication in Edge Stack
---

# Routing and communication overview

Edge stack uses a number of resources to handle network routing and communication. You can propogate these associations in a variety of different ways according to your needs; Edge Stack is deeply customizable and can cater to complex demands to help you Run with ease.

Edge Stack uses the `Mapping` resource as the primary means to manage traffic routing. The `Mapping` resource routes a URL path or prefix to a service, either a Kubernetes service or another web service. In combination with Edge Stack's custom resources, your Mappings define how communications and resources are managed and secured. A `Mapping` can be managed by the same workflow as other Kubernetes resources, such as Service or Deployment resources. 

Edge Stack features its own custom resources todetail the nuances of routing and communication for your services. The primary custom resources Edge Stack uses are `Listener`, `Host`, and `TLSContext`.

## What is the `Mapping` Resource?

In Edge Stack, a resource is a group of one or more URLs that all share a common prefix in the URL path. For example, these URLs could share the `/resource1/` path prefix, so `/resource1/` can be considered a single resource as in the following examples:

* `https://ambassador.example.com/resource1/foo`
* `https://ambassador.example.com/resource1/bar`
* `https://ambassador.example.com/resource1/something/else`

While Edge Stack doesn't require the prefix to start and end with `/`, it's a best practice to be consistent with resource prefixes.

## What are the `Listener`, `Host`, and `TLSContext` resources?

Edge Stack's three primary custom resources are as follows:

* The `Listener` resource, which defines where and how Ambassador Edge Stack should listen for requests from the network.
* The `Host` resource. which defines which hostnames Ambassador Edge Stack is associated with by the `Mappings`. This defines how to Edge Stack handles the different kinds of requests for those hosts. Hosts can be associated with one or more Listeners.
* The `TLSContext` resource defines how Ambassador Edge Stack manages TLS certificates and options. TLSContexts can be associated with one or more Hosts.
