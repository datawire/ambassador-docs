# Service Groups

Most environments have multiple services across their platforms, making search and visualization of those a little cumbersome. To simplify this process, you can put the services together by using the service group feature.

You can identify a <a href="../../concepts/services//">service</a> deployed accross your environments, and add it into a service group.

![The service groups view](../../../images/service-group-root.png)

It enables you to see at first glance importants details about your service, including rollbacks, intercepts, annotations, and mappings count.

1. This line represents a service `agent-injector` deployed accross your cells.
2. These are two service groups, containing services. By clicking on it, you can expand it and see its content.
3. The number of service contained by the groups `Ambassador is the way` and `Argo for Life`.
4. Two services `argo-rollouts-metrics` and `argocd-dex-server` under the `Argo for Life` group. It is the same kind of resource than `agent-injector` (**1**), but indexed under a group.

