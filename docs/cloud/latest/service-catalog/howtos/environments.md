import Alert from '@material-ui/lab/Alert';

# Manage my environments

The Service Catalog associates distinct Kubernetes cluster namespaces with environments.

When you first generate an API key for a cluster, you are offered the choice to select which environment you want this cluster to initially report under. By default, all new namespaces detected in this cluster will automatically be added to the environment with the lowest criticality: Development.

## Associate a Cluster Namespace to an environment

To organize your services differently in Service Catalog,

1. Log in to [Ambassador Cloud](https://app.getambassador.io/cloud/) with your preferred identity provider.

2. On the left-hand side navigation, click **Environments**.

3. Locate the `cluster: namespace` you wish to move.

4. Click on the `cluster: namespace`'s **"..."** button to open the pop-up menu.

5. Select the new environment location of this `cluster: namespace` under **Move to...**.

