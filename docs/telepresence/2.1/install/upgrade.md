---
description: "How to upgrade your installation of Telepresence and install previous versions."
---

import Platform from '@src/components/Platform';

# Upgrade Telepresence

<div class="docs-article-toc">
<h3>Contents</h3>

* [Upgrade Process](#upgrade-process)
* [Installing Older Versions of Telepresence](#installing-older-versions-of-telepresence)
* [Migrating from Telepresence 1 to Telepresence 2](#migrating-from-telepresence-1-to-telepresence-2)

</div>

## Upgrade Process
The Telepresence CLI will periodically check for new versions and notify you when an upgrade is available.  Running the same commands used for installation will replace your current binary with the latest version.

<Platform.TabGroup>
<Platform.MacOSTab>

```shell
# 1. Download the latest binary (~60 MB):
sudo curl -fL https://app.getambassador.io/download/tel2/darwin/amd64/$dlVersion$/telepresence -o /usr/local/bin/telepresence

# 2. Make the binary executable:
sudo chmod a+x /usr/local/bin/telepresence
```

</Platform.MacOSTab>
<Platform.GNULinuxTab>

```shell
# 1. Download the latest binary (~50 MB):
sudo curl -fL https://app.getambassador.io/download/tel2/linux/amd64/$dlVersion$/telepresence -o /usr/local/bin/telepresence

# 2. Make the binary executable:
sudo chmod a+x /usr/local/bin/telepresence
```

</Platform.GNULinuxTab>
</Platform.TabGroup>

After upgrading your CLI, the Traffic Manager **must be uninstalled** from your cluster. This can be done using `telepresence uninstall --everything` or by `kubectl delete svc,deploy traffic-manager`. The next time you run a `telepresence` command it will deploy an upgraded Traffic Manager.

## Installing Older Versions of Telepresence

Use these URLs to download an older version for your OS, replacing `x.x.x` with the version you want.

<Platform.TabGroup>
<Platform.MacOSTab>

```
https://app.getambassador.io/download/tel2/darwin/amd64/x.y.z/telepresence
```

</Platform.MacOSTab>
<Platform.GNULinuxTab>

```
https://app.getambassador.io/download/tel2/linux/amd64/x.y.z/telepresence
```

</Platform.GNULinuxTab>
</Platform.TabGroup>

## Migrating from Telepresence 1 to Telepresence 2

Telepresence 2 (the current major version) has different mechanics and requires a different mental model from [Telepresence 1](https://www.telepresence.io/docs/v1/) when working with local instances of your services.

In Telepresence 1, a pod running a service is swapped with a pod running the Telepresence proxy. This proxy receives traffic intended for the service, and sends the traffic onward to the target workstation or laptop. We called this mechanism "swap-deployment".

In practice, this mechanism, while simple in concept, had some challenges. Losing the connection to the cluster would leave the deployment in an inconsistent state. Swapping the pods would take time.

Telepresence 2 introduces a [new architecture](../../reference/architecture/) built around "intercepts" that addresses this problem. With Telepresence 2, a sidecar proxy is injected onto the pod. The proxy then intercepts traffic intended for the pod and routes it to the workstation/laptop. The advantage of this approach is that the service is running at all times, and no swapping is used. By using the proxy approach, we can also do selective intercepts, where certain types of traffic get routed to the service while other traffic gets routed to your laptop/workstation.

Please see [the Telepresence quick start](../../quick-start/) for an introduction to running intercepts and [the intercept reference doc](../../reference/intercepts/) for a deep dive into intercepts.
