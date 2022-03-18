# Service Groups

Service Groups allow you to organize services in the ways that best suit your workflow. These groupings allow you to easily visualize and manage multiple services that exist across your environments.

You can identify a [service](/docs/cloud/latest/service-catalog/concepts/services) deployed accross your environments, and add it into a service group.

The service catalog allows you to see all of the important details for each of your [services](/docs/cloud/latest/service-catalog/concepts/services) and service groups.

![The service groups view](../../../images/service-group-root.png)

1. This line displays the name of the service that is deployed across your cells. In this case, the name of the single service is `agent-injector`.
2. Each of these two lines are service groups (with the first collapsed and the second expanded). Click on a service group to expand it and show the list of services grouped within.
3. This shows the number of service contained by the groups `Ambassador is the way` and `Argo For Life`.
4. Two services, *argo-rollouts-metrics* and *argocd-dex-server*, are included in the Argo for Life group. It is the same kind of resource as agent-injector (**1**), but indexed under a group.

