---
description: "A simple three step guide to installing $productName$ and quickly get started routing traffic from the edge of your Kubernetes cluster to your services."
---

import Alert from '@material-ui/lab/Alert';
import EmissaryGSTabs from './gs-tabs'
import EmissaryGSTabs2 from './gs-tabs2'
import { LogInText } from '../../../../../src/components/Docs/LogInText';

# $productName$ quick start

<div class="docs-article-toc">
<h3>Contents</h3>

* [1. Installation](#1-installation)
* [2. Routing Traffic from the Edge](#2-routing-traffic-from-the-edge)
* [3. Connect your Cluster to Ambassador Cloud](#3-connect-your-cluster-to-ambassador-cloud)
* [What's Next?](#img-classos-logo-srcimageslogopng-whats-next)

</div>

## 1. Installation

We'll start by installing $productName$ into your cluster.

**We recommend using Helm** but there are other options below to choose from.

<EmissaryGSTabs/>

<Alert severity="success"><b>Success!</b> You have installed $productName$, now let's get some traffic flowing to your services.</Alert>

## 2. Routing traffic from the edge

Like any other Kubernetes object, Custom Resource Definitions (CRDs) are used to declaratively define $productName$’s desired state. The workflow you are going to build uses a simple demo app and the **Mapping CRD**, which is the core resource that you will use with $productName$. It lets you route requests by host and URL path from the edge of your cluster to Kubernetes services.

1. First, apply the YAML for the [“Quote of the Moment" service](https://github.com/datawire/quote).

  ```
  kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/$version$/quickstart/qotm.yaml
  ```


  <Alert severity="info">The Service and Deployment are created in your default namespace. You can use <code>kubectl get services,deployments quote</code> to see their status.</Alert>


2. Copy the configuration below and save it to a file called `quote-backend.yaml` so that you can create a Mapping on your cluster. This Mapping tells $productName$ to route all traffic inbound to the `/backend/` path to the `quote` Service.

  ```yaml
  ---
  apiVersion: getambassador.io/v2
  kind: Mapping
  metadata:
    name: quote-backend
  spec:
    prefix: /backend/
    service: quote
  ```

3. Apply the configuration to the cluster:

  ```
  kubectl apply -f quote-backend.yaml
  ```

  With our Mapping created, now we need to access it!

4. Store the $productName$ load balancer IP address to a local environment variable. You will use this variable to test accessing your service.

  ```
  export EMISSARY_LB_ENDPOINT=$(kubectl get svc ambassador \
    -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
  ```

5. Test the configuration by accessing the service through the $productName$ load balancer:

  `curl -Lk http://$EMISSARY_LB_ENDPOINT/backend/`

  ```
  $ curl -Lk http://$EMISSARY_LB_ENDPOINT/backend/

    {
     "server": "idle-cranberry-8tbb6iks",
     "quote": "Non-locality is the driver of truth. By summoning, we vibrate.",
     "time": "2021-02-26T15:55:06.884798988Z"
    }
  ```

<Alert severity="success"><b>Victory!</b> You have created your first $productName$ Mapping, routing a request from your cluster's edge to a service!</Alert>

## 3. Connect your cluster to Ambassador Cloud

The Service Catalog is a web-based interface that lists all of your cluster's Services. You can view, add, and update metadata associated with each Service, such as the owner, version control repository, and associated Slack channel.

1. <LogInText />

2. At the top, click **Add Services** then click **Connection Instructions** in the Edge Stack installation section.

3. Follow the prompts to name the cluster and click **Generate a Cloud Token**.

4. Follow the prompts to install the cloud token into your cluster.

5. When the token installation completes, refresh the Service Catalog page.

<Alert severity="success"><b>Fantastic!</b> You can now see all your Services in your Ambassador Cloud account! Metadata on your Services about the owner, repo location, etc. can also be shown in Service Catalog via Kubernetes annotations. Continue in the <a href="/docs/cloud/latest/service-catalog/quick-start/">Service Catalog docs</a> to set annotations on your Services.</Alert>

## <img class="os-logo" src="../../images/logo.png"/> What's next?

Explore some of the popular tutorials on $productName$:

* [Intro to Mappings](../../topics/using/intro-mappings/): declaratively routes traffic from
the edge of your cluster to a Kubernetes service
* [Host resource](../../topics/running/host-crd/): configure a hostname and TLS options for your ingress.
* [Rate Limiting](../../topics/using/rate-limits): create policies to control sustained traffic loads

$productName$ has a comprehensive range of [features](/features/) to
support the requirements of any edge microservice.

To learn more about how $productName$ works, read the [$productName$ Story](../../about/why-ambassador).
