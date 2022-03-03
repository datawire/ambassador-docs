# Services

## Kubernetes service

A Kubernetes service is an abstract way to expose an application running on a workload (pods).

It can be seen as low level entrypoint reaching a version of your deployed application, exposing an IP & a port.

## Ambassador service

An ambassador service, such as listed in the catalog, is an aggregation of kubernetes services across your cells.

![The services interactions](../../../images/service-ambassador.png)
