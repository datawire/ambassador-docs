---
title: "Ambassador Diagnostics"
description: "A Cloud option to view Emissary-Ingress Cluster Diagnostics"
---

import Alert from '@material-ui/lab/Alert';

# Diagnostics Overview

Ambassador Edge Stack and Emissary-ingress provide cluster diagnostics information, and now it can be accessed using Ambassador Cloud.

<Alert severity="warning">
    In order to use diagnostics, you need <a href="https://www.getambassador.io/docs/edge-stack/latest/topics/install/migration-matrix/" target="_blank">Edge Stack</a> or <a href="https://www.getambassador.io/docs/emissary/latest/topics/install/migration-matrix/" target="_blank">Emissary-ingress</a> version 3.1 or greater running in your cluster.
</Alert>

## Accessing Diagnostics Overview Page

Inside the [clusters page](https://app.getambassador.io/cloud/clusters), on each cluster card displayed, there is a 'Diagnostics' button. Clicking it will take you to the diagnostics overview page.

  <p align="center">
    <img src="../../images/diag-button.png" width="300"/>
  </p>

Inside, you will be able to see two navigation tabs, containing the following:

1. **Ambassador Routes** : Information about your Emissary-ingress [mapping resources](https://www.getambassador.io/docs/emissary/latest/topics/using/intro-mappings/) gets displayed, alongside service name, weigth, and success rate.

  <p align="center">
    <img src="../../images/cluster-diag-routes-table.png" width="800"/>
  </p>

2. **Notices** : Provides configuration errors and notices coming from your cluster.

  <p align="center">
    <img src="../../images/cluster-diag-notices-table.png" width="800"/>
  </p>

## No Diagnostics Found?

Seeing a warning message on the Diagnostics Overview page means that there are no diagnostics information for that particular cluster.

  <p align="center">
    <img src="../../images/cluster-diag-warning-message.png" width="800"/>
  </p>

Be sure to have diagnostics enabled for your ambassador module.

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

And enable the <code>AES_REPORT_DIAGNOSTICS_TO_CLOUD</code> environment flag.

  ```bash
  kubectl set env deployment/edge-stack-agent -n ambassador AES_REPORT_DIAGNOSTICS_TO_CLOUD="true"
  ```

## Can't access the diagnostics interface ?

If you are unable to hit your diagnostics interface using your Emissary-ingress admin port, this means that your access to the diagnostics interface is protected, thus, you won't be able to see the diagnostics overview in Ambassador Cloud. 

You will need to re-enable the <code>/ambassador/v0/diag</code> mapping, and and allow non local access to the Emissary-ingress pod.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
spec:
  config:
    diagnostics:
      enabled: true
      allow_non_local: true
```

<Alert severity="info">
    Still not getting back diagnostics information? This could mean that your diagnostics interface is <a href="https://www.getambassador.io/docs/emissary/latest/howtos/protecting-diag-access/" target="_blank">protected</a> or only the <a href="https://www.getambassador.io/docs/emissary/latest/topics/running/ambassador/#observability" target="_blank">local pod</a> can access it. 
    Also, check this <a href="https://www.getambassador.io/docs/edge-stack/pre-release/topics/running/environment/#aes_report_diagnostics_to_cloud" target="_blank">emissary flag</a>, it needs to be enabled!
</Alert>
 
