# Service Groups

Service Groups allow users to group together services that should be logically organized together. The groupings allow users to more easily see the multiple services that may exist across all of their environments

You can identify a <a href="../../concepts/services//">service</a> deployed accross your environments, and add it into a service group.

The service catalog allows you to at-a-glance see all of the important details for each of your <a href="../../concepts/services//">services</a> and service groups.

![The service groups view](../../../images/service-group-root.png)

1. This line displays the name of the service that is deployed across your cells. In this case, the name of the single service is `agent-injector`.
2. Each of these two lines are service groups (with the first collapsed and the second expanded). Clicking on the any service group will expand it, and show the list of services grouped within.
3. The number of service contained by the groups `Ambassador is the way` and `Argo for Life`.
4. Two services `argo-rollouts-metrics` and `argocd-dex-server` under the `Argo for Life` group. It is the same kind of resource than `agent-injector` (**1**), but indexed under a group.

