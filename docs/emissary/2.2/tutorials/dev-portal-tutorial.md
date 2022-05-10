# Dev Portal tutorial

In this tutorial, you will access and explore some of the key features of the [Dev Portal](/products/edge-stack/developer-portal/).

## Prerequisites

You must have [$productName$ installed](../getting-started/) in your
Kubernetes cluster. This tutorial assumes you have connected your cluster to Ambassador Cloud and deployed the `quote` app with the
`Mapping` from the [$productName$ tutorial](../getting-started/).


  ```
  export AMBASSADOR_LB_ENDPOINT=$(kubectl -n ambassador get svc ambassador -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
  ```

## Developer API documentation

The `quote` service you just deployed publishes its API as an
[OpenAPI (formerly Swagger)](https://swagger.io/solutions/getting-started-with-oas/)
document. $productName$ automatically detects and publishes this documentation.
This can help with internal and external developer onboarding by serving as a
single point of reference for of all your microservice APIs.

1. To visualize your service's API doc, go to [Ambassador Cloud](https://app.getambassador.io/cloud/), navigate to your service's detailed view, and click on the "API" tab.

1. Navigate to `https://<load-balancer-endpoint>/docs/` to see the
publicly visible Developer Portal. Make sure you include the trailing `/`.
This is a fully customizable portal that you can share with third parties who
need information about your APIs.
