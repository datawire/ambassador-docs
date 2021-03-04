---
description: "A simple three step guide to installing Edge Stack and quickly get started routing traffic from the edge of your Kubernetes cluster to your services."
---

import Alert from '@material-ui/lab/Alert';
import GSTabs from './gs-tabs'
import GSTabs2 from './gs-tabs2'

# Edge Stack Quick Start

<div class="docs-article-toc">
<h3>Contents</h3>

* [1. Installation](#1-installation)
* [2. Routing Traffic from the Edge](#2-routing-traffic-from-the-edge)
* [3. Connect your Cluster to Ambassador Cloud](#3-connect-your-cluster-to-ambassador-cloud)
* [What's Next?](#img-classos-logo-srcimageslogopng-whats-next)

</div>

## 1. Installation

Quickly install Edge Stack into your cluster.

**We recommend using Helm** but there are other options below to choose from.

<GSTabs/>

<Alert severity="success"><b>Success!</b> You have installed Edge Stack, now let's get some traffic flowing to your services.</Alert>

## 2. Routing Traffic from the Edge

Like any other Kubernetes object, Custom Resource Definitions (CRDs) are used to declaratively define Edge Stack’s desired state. The workflow you are going to build uses a simple demo app and the Mapping CRD, which is the core resource that you will use with Edge Stack. It lets you route requests by host and URL path from the edge of your cluster to Kubernetes services.

First apply the YAML for the “Quote of the Moment" service.

```
kubectl apply -f https://www.getambassador.io/yaml/quickstart/qotm.yaml
```

<hr style="height:0px; visibility:hidden;" />

<Alert severity="info">The Service and Deployment are created in the Ambassador namespace.  You can use <code>kubectl get services,deployments quote --namespace ambassador</code> to see their status.</Alert>

Copy the configuration below and save it to a file called `quote-backend.yaml` so that you can create a Mapping on your cluster. This Mapping tells Edge Stack to route all traffic inbound to the `/backend/` path to the `quote` Service.

```yaml
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: quote-backend
  namespace: ambassador
spec:
  prefix: /backend/
  service: quote
```

Apply the configuration to the cluster:

```
kubectl apply -f quote-backend.yaml
```

Now with our Mapping created, we need to access it!

Store the Edge Stack load balancer IP address to a local environment variable. You will use this variable to test accessing your service.

```
export AMBASSADOR_LB_ENDPOINT=$(kubectl -n ambassador get svc ambassador \
  -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
```

Test the configuration by accessing the service through the Ambassador load balancer:
`curl -Lk https://$AMBASSADOR_LB_ENDPOINT/backend/`

```
$ curl -Lk https://$AMBASSADOR_LB_ENDPOINT/backend/

  {
   "server": "idle-cranberry-8tbb6iks",
   "quote": "Non-locality is the driver of truth. By summoning, we vibrate.",
   "time": "2021-02-26T15:55:06.884798988Z"
  }
```

<Alert severity="success"><b>Victory!</b> You have created your first Edge Stack Mapping, routing a request from your cluster's edge to a service!</Alert>

## 3. Connect your Cluster to Ambassador Cloud

The Service Catalog within Ambassador Cloud allows you to easily list all of your cluster's services. You can view, add, and update metadata associated with each service, such as the owner, version control repository, and associated Slack channel.

Follow the instructions that match your Edge Stack installation method below to connect your cluster and start using Service Catalog.

<GSTabs2/>

When the installation completes, refresh the Ambassador Cloud page.  All of your services running in the cluster are now listed in Service Catalog!

<Alert severity="success"><b>Fantastic!</b> You can now see all your services in your Ambassador Cloud account! Metadata on your services about the owner, repo location, etc. can also be shown in Service Catalog via Kubernetes annotations. Continue in the <a href="../../service-catalog/quick-start/">Service Catalog docs</a> to set annotations on your services.</Alert>

## <img class="os-logo" src="../../images/logo.png"/> What's Next?

(links to other common Edge Stack docs)
