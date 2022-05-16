# Service Groups

Service Groups allow you to organize [services](/docs/cloud/latest/service-catalog/concepts/services) in the ways that best suit your workflow. These groupings allow you to easily visualize and manage any of the multiple services that exist across your environments.

The service catalogue allows you to see all of the important details for each of your [services](/docs/cloud/latest/service-catalog/concepts/services) and service groups.

![Groups in service catalog](../../images/service-catalog-explanation.png)

1. Each of these two lines are service groups (with the first collapsed and the second expanded). Click on a service group to expand it and show the list of services grouped within.
2. This shows the number of services contained by the groups `edge-group` and `Argo`.
3. Three services, `argocd-application-controller`, `argocd-repo-server` and `emissary-apiext`, are included in the `Argo` group. It is the same kind of resource as `argocd-dex-server` (**1**) but indexed under a group.
4. This line displays the name of the service that is deployed across your cells. In this case, the name of the single service is `argocd-dex-server`.
