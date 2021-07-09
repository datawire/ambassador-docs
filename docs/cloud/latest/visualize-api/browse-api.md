# Visualizing APIs in your existing cluster

## Prerequisites

1. You must have Ambassador Edge Stack installed in your Kubernetes cluster. If you do not have edge stack installed go to [Edge Stack Quick start](../../../../edge-stack/2.0/tutorials/getting-started/)
2. Connect your cluster to the DCP

## Configure Edge stack to publish documents:

In order to display your API docs in the DCP, the edge stack running in your cluster needs to be configured to publish the service’s Open API documentation. This is done by including a mapping that tells Edge stack the appropriate endpoint. For a complete list of the available mappings go [here](../../../../edge-stack/1.13/topics/using/dev-portal/)

If you would like to see an example of how this works, check the [Quick start](../quick-start)

## Visualize your API in the DCP

1. Navigate to [Ambassador Cloud](https://app.getambassador.io/cloud/services) to see your connected services.

2. Select the service from the Service Catalog page.

3. Click on the API tab to access the documentation.
