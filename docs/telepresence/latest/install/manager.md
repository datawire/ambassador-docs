# Install/Uninstall the Traffic Manager

Telepresence uses a traffic manager to send/recieve cloud traffic to the user. Telepresence uses [Helm](https://helm.sh) under the hood to install the traffic manager in your cluster. 

## Prerequisites

Before you begin, you need to have [Telepresence installed](../../install/).
In addition, you may need certain prerequisites depending on your cloud provider and platform.
See the [cloud provider installation notes](../../install/cloud) for more.

## Install the Traffic Manager

The telepresence cli can install the traffic manager for you. The basic install will install the same version as the client used.

1. Install the Telepresence Traffic Manager with the following command:

   ```shell
   telepresence helm install
   ```

### Customizing the Traffic Manager.

For details on what the Helm chart installs and what can be configured, see the Helm chart [configuration on artifacthub](https://artifacthub.io/packages/helm/datawire/telepresence).

1. Create a values.yaml file with your config values.

2. Run the install command with the values flag set to the path to your values file.

   ```shell
   telepresence helm install --values values.yaml
   ```


## Upgrading/Downgrading the Traffic Manager.

1. Download the cli of the version of Telepresence you wish to use.

2. Run the install command with the upgrade flag.

   ```shell
   telepresence helm install --upgrade
   ```


## Uninstall

The telepresence cli can uninstall the traffic manager for you using the `telepresence helm uninstall` command (previously `telepresence uninstall --everything`).

1. Uninstall the Telepresence Traffic Manager and all of the agents installed by it using the following command:

   ```shell
   telepresence helm uninstall
   ```

## Ambassador Agent

The Ambassador Agent is installed alongside the Traffic Manager to report your services to Ambassador Cloud and give you the ability to trigger intercepts from the Cloud UI. 

If you are already using the Emissary-Ingress or Edge-Stack you do not need to install the Ambassador Agent. When installing the `traffic-manager` you can add the flag `--set ambassador-agent.enabled=false`, to not include the ambassador-agent. Emissary and Edge-Stack both already include this agent within their deployments.

If your namespace runs with tight security parameters you may need to set a few additional parameters. These parameters are `securityContext`, `tolerations`, and `resources`. 
You can set these parameters in a `values.yaml` file under the `ambassador-agent` prefix to fit your namespace requirements.

### Adding an API Key to your Ambassador Agent

While installing the traffic-manager you can pass your cloud-token directly to the helm chart using the flag, `--set ambassador-agent.cloudConnectToken=<API_KEY>`.
The [API Key](../reference/client/login.md) will be created as a secret and your agent will use it upon start-up. Telepresence will not override the API key given via Helm.

### Creating a secret manually
The Ambassador agent watches for secrets with a name ending in `agent-cloud-token`. You can create this secret yourself. This API key will always be used.

  ```shell
kubectl apply -f - <<EOF
---
apiVersion: v1
kind: Secret
metadata:
  name: agent-cloud-token
  namespace: <agent namespace>
  labels:
    app.kubernetes.io/name: agent-cloud-token
data:
  CLOUD_CONNECT_TOKEN: <your api key>
EOF
  ```