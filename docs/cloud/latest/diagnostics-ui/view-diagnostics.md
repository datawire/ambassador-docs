---
title: "Ambassador Diagnostics | Ambassador Cloud"
description: "A Cloud option to view Emissary-Ingress Cluster Diagnostics"
---

import Alert from '@material-ui/lab/Alert';
import Tab from '@material-ui/core/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';

export function TabsContainer({ children, ...props }) {
    const [state, setState] = React.useState({curTab: "edgestack"});
    React.useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        var interceptType = query.get('installType') || "edgestack";
        if (state.curTab != interceptType) {
            setState({curTab: interceptType});
        }
    }, [state, setState])
    var setURL = function(newTab) {
        history.replaceState(null,null,
            `?installType=${newTab}${window.location.hash}`,
        );
    };
    return (
        <div class="TabGroup">
            <TabContext value={state.curTab}>
                <AppBar class="TabBar" elevation={0} position="static">
                    <TabList onChange={(ev, newTab) => {setState({curTab: newTab}); setURL(newTab)}} aria-label="intercept types">
                        <Tab class="TabHead" value="edgestack" label="Edge Stack"/>
                        <Tab class="TabHead" value="emissary" label="Emissary"/>
                    </TabList>
                </AppBar>
                {children}
            </TabContext>
        </div>
    );
};

# Diagnostics Overview

Ambassador Edge Stack and Emissary-ingress provide cluster diagnostics information, and now it can be accessed using Ambassador Cloud.

In order to use diagnostics, you need to have version 3.1 or greater of [EdgeStack](https://www.getambassador.io/docs/edge-stack/latest/topics/install/migration-matrix/) or [Emissary-ingress](https://www.getambassador.io/docs/emissary/latest/topics/install/migration-matrix/) installed.


## Accessing Diagnostics Overview Page

Inside the [clusters page](https://app.getambassador.io/cloud/clusters), on each cluster card displayed, there is a 'Diagnostics' button. Clicking it will take you to the diagnostics overview page.

  <p align="center">
    <img src="../../images/diag-button.png" width="300"/>
  </p>

Inside, you will be able to see two navigation tabs:

1. **Ambassador Routes** : Information about your Emissary-ingress [mapping resources](https://www.getambassador.io/docs/emissary/latest/topics/using/intro-mappings/) gets displayed, alongside the service name, weight, and success rate.

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

<TabsContainer>
<TabPanel class="TabBody" value="edgestack">

Add the following config fields to your associated `Module` [resource](/docs/edge-stack/latest/topics/running/ambassador/) to enable diagnostics data. If you don't have one, create it with the following fields and values:

```shell

$ kubectl apply -f - <<EOF
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
  namespace: ambassador
spec:
  config:
    diagnostics:
      enabled: true
EOF
```

Next, in your deployment for Edge Stack or Emissary-ingress, set the <code>AES_REPORT_DIAGNOSTICS_TO_CLOUD</code> environment variable to `"true"` to allow diagnostics information to be reported to the cloud.

  ```shell
  # Namespace and deployment name depends on your current install

  kubectl set env deployment/edge-stack-agent -n ambassador AES_REPORT_DIAGNOSTICS_TO_CLOUD="true"
  ```

Finally, set the `AES_DIAGNOSTICS_URL` environment variable
  ```shell
  # Namespace, deployment name, and pod url/port depends on your current install

  kubectl set env deployment/edge-stack-agent -n ambasador AES_DIAGNOSTICS_URL="http://edge-stack-admin:8877/ambassador/v0/diag/?json=true"
  ```

</TabPanel>
<TabPanel class="TabBody" value="emissary">

Add the following config fields to your associated `Module` [resource](/docs/emissary/latest/topics/running/ambassador/) to enable diagnostics data. If you don't have one, create it with the following fields and values:

```shell

$ kubectl apply -f - <<EOF
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
  namespace: emissary
spec:
  config:
    diagnostics:
      enabled: true
EOF
```

Next, in your deployment for Edge Stack or Emissary-ingress, set the <code>AES_REPORT_DIAGNOSTICS_TO_CLOUD</code> environment variable to `"true"` to allow diagnostics information to be reported to the cloud.

  ```shell
  # Namespace and deployment name depends on your current install

  kubectl set env deployment/emissary-ingress-agent -n emissary AES_REPORT_DIAGNOSTICS_TO_CLOUD="true"
  ```

Finally, set the `AES_DIAGNOSTICS_URL` environment variable
  ```shell
  # Namespace, deployment name, and pod url/port depends on your current install

  kubectl set env deployment/emissary-ingress-agent -n emissary AES_DIAGNOSTICS_URL="http://emissary-ingress-admin:8877/ambassador/v0/diag/?json=true"
  ```
</TabPanel>
</TabsContainer>

