import Alert from '@material-ui/lab/Alert';

# Quick start

## OpenAPI

You can visualize and explore your service’s OpenAPI (formally known as Swagger Specifications) documentation from directly within the Developer Control Plane.

## Prerequisites

1. You must have [Ambassador Edge Stack installed](../../../../edge-stack/2.0/tutorials/getting-started) in your
   Kubernetes cluster. This quick start assumes you have deployed the `quote` app and
   apply `Mapping` from that quickstart.
2. Enable the documentation by modifying the file `quote-backend.yaml` with the following path `/.ambassador-internal/openapi-docs`

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
     docs:
       path: '/.ambassador-internal/openapi-docs'
   ```

3. Apply the configuration to the cluster:
   ```
   kubectl apply -f quote-backend.yaml
   ```

## Connect your cluster to Ambassador Cloud

<Alert severity="info">
If you followed the <a href="../../../../edge-stack/1.13/tutorials/getting-started/">Edge Stack quick start</a>, you should have already completed this step.
</Alert>

1. Log in to [Ambassador Cloud](https://app.getambassador.io/cloud/) with your preferred identity provider.

2. At the top, click **Add Services** then click **Connection Instructions** in the Edge Stack installation section.

3. Follow the prompts to name the cluster and click **Generate a Cloud Token**.

4. Follow the prompts to install the cloud token into your cluster.

5. When the token installation completes, refresh the Service Catalog page.

<Alert severity="success"><b>Victory!</b> The Quote service is now available in the DCP
</Alert>

## Visualize the API Documentation

1. Navigate to [Ambassador Cloud](https://app.getambassador.io/cloud/services) to see your connected services.

2. Select the quote service from the Service Catalog page.

3. Click on the API tab to access the documentation.
