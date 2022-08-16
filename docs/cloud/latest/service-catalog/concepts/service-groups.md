---
description: ""
title: ""
---

# Services and Service Groups


Ambassador Cloud's main landing page is the Service Catalog, which displays all the Kubernetes services in your connected clusters.

## Kubernetes service

A Kubernetes service is an exposed application running on a workload (pods). It is an entrypoint to a version of your deployed application with an IP address and a port.

## Ambassador service

An Ambassador service in the Service Catalog is a collection of Kubernetes services across your [cells](/docs/cloud/latest/service-catalog/concepts/cells).

![The services interactions](../../images/service-ambassador.png)


## Service Groups


Service Groups allow you to organize [services](/docs/cloud/latest/service-catalog/concepts/services) in the ways that best suit your workflow. These groupings allow you to easily visualize and manage any of the multiple services that exist across your environments.

The service catalogue allows you to see all of the important details for each of your [services](/docs/cloud/latest/service-catalog/concepts/services) and service groups.

![Groups in service catalog](../../images/service-catalog-explanation.png)

1. Each of these two lines are service groups (with the first collapsed and the second expanded). Click on a service group to expand it and show the list of services grouped within.
2. This shows the number of services contained by the groups `edge-group` and `Argo`.
3. Three services, `argocd-application-controller`, `argocd-repo-server` and `emissary-apiext`, are included in the `Argo` group. It is the same kind of resource as `argocd-dex-server` (**1**) but indexed under a group.
4. This line displays the name of the service that is deployed across your cells. In this case, the name of the single service is `argocd-dex-server`.
