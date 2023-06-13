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

For details on what the Helm chart installs and what can be configured, see the Helm chart [README](https://github.com/telepresenceio/telepresence/tree/release/v2/charts/telepresence).

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
