---
title: "Ambassador Diagnostics | Ambassador Cloud"
description: "A Cloud option to view Emissary-Ingress Cluster Diagnostics"
---

import Alert from '@material-ui/lab/Alert';

# Diagnostics Overview

Ambassador Edge Stack and Emissary-ingress provide cluster diagnostics information, and now it can be accessed using Ambassador Cloud.

In order to use diagnostics, you need to have version 3.1 or greater of [EdgeStack](https://www.getambassador.io/docs/edge-stack/latest/topics/install/migration-matrix/) or [Emissary-ingress](https://www.getambassador.io/docs/emissary/latest/topics/install/migration-matrix/) installed.


## Accessing Diagnostics Overview Page

Inside the [clusters page](https://app.getambassador.io/cloud/clusters), on each cluster card displayed, there is a 'Diagnostics' button. Clicking it will take you to the diagnostics overview page.

  <p align="center">
    <img src="../../images/diag-button.png" width="300"/>
  </p>

Inside, you will be able to see two navigation tabs:

1. **Ambassador Routes** : Information about your Emissary-ingress [mapping resources](https://www.getambassador.io/docs/emissary/latest/topics/using/intro-mappings/) gets displayed, alongside the service name, weigth, and success rate.

  <p align="center">
    <img src="../../images/cluster-diag-routes-table.png" width="800"/>
  </p>

2. **Notices** : Provides configuration errors and notices coming from your cluster.

  <p align="center">
    <img src="../../images/cluster-diag-notices-table.png" width="800"/>
  </p>

## No Diagnostics Found?

A warning message on the Diagnostics Overview page means either that the cluster has no diagnostics information to report, that diagnostics reporting has been disabled, or that there is an issue with the deployment of the [Agent](https://www.getambassador.io/docs/edge-stack/) in this cluster.

  <p align="center">
    <img src="../../images/cluster-diag-warning-message.png" width="800"/>
  </p>

Add the following config fields to your associated [`Module` resource](/docs/edge-stack/latest/topics/running/ambassador/) to enable diagnostics data. If you don't have a `Module` resource, create one with the following fields and values:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
spec:
  config:
    diagnostics:
      enabled: true
```

Next, In your deployment for Edge Stack or Emissary-ingress, set the <code>AES_REPORT_DIAGNOSTICS_TO_CLOUD</code> environment variable to `"true"` to allow diagnostics information to be reported to the cloud.

  ```bash
  # Namespace and deployment name depends on your current install

  kubectl set env deployment/edge-stack-agent -n ambassador AES_REPORT_DIAGNOSTICS_TO_CLOUD="true"
  ```

Finally, set the `AES_DIAGNOSTICS_URL` environment variable to `"http://emissary-ingress-admin:8877/ambassador/v0/diag/?json=true"`.
  ```bash
  # Namespace, deployment name, and pod url/port depends on your current install

  kubectl set env deployment/edge-stack-agent -n ambassador AES_DIAGNOSTICS_URL="http://emissary-ingress-admin:8877/ambassador/v0/diag/?json=true"
  ```
