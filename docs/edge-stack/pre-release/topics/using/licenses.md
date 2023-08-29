# Licenses for $productName$

$productName$ requires a valid Enterprise license or Community license to start up. The Community license allows you to use $productName$ for free with certain restrictions and the Enterprise license lifts these restrictions for further use of premium features.

For more details on the different licenses please visit the [editions page](/editions).

## Applying a License
The process for applying a license is the same regardless of which license plan you wish to follow.

If you have already spoken with our Sales department and purchased an Enterprise License, you can follow the steps below to connect your clusters to Ambassador Cloud. Your Enterprise license will automatically apply to all clusters that you connect.

If you wish to utilize a free community license for your Edge Stack clusters, you can follow the steps below to connect your clusters to Ambassador Cloud and the Community license will be automatically applied.

If you believe you have an Enterprise license, but this is not reflected in Ambassador Cloud after connecting your Clusters, please reach out to our support team by submitting a ticket in our [Support Portal][].


1. Installing the cloud connect token

   You can follow the instructions on [the quickstart guide][] to get signed into [Ambassador Cloud][] and obtain a cloud connect token for your installation of $productName$ if you don't already have one.
   This will let $productName$ request and renew your license from Ambassador Cloud.

   The Cloud Connect Token is a `ConfigMap` that you will install in your Kubernetes cluster and looks like this:

   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: edge-stack-agent-cloud-token
     namespace: ambassador
   data:
     CLOUD_CONNECT_TOKEN: <Your Cloud Connect Token from Abassador Cloud>
   ```

2. Install the Cloud Connect Token with Helm

   ```bash
   helm install edge-stack --namespace ambassador datawire/edge-stack --set emissary-ingress.createDefaultListeners=true --set emissary-ingress.agent.cloudConnectToken=<Your Cloud Connect Token from Abassador Cloud>
   ```

3. Install the Cloud Connect Token with Yaml

   If you do not want to use Helm to manage your installation, then you can create the Cloud Connect Token with raw yaml instead.

   ```bash
   kubectl create configmap --namespace ambassador edge-stack-agent-cloud-token --from-literal=CLOUD_CONNECT_TOKEN=<Your Cloud Connect Token from Abassador Cloud>
   ```

## Enterprise Licenses

To obtain an Enterprise license, you can [reach out to our sales team][] for more information about plans and pricing.

If you have any questions regarding your Enterprise license, or require an air gapped license, please to reach out to [support][].

[reach out to our sales team]: /contact-us/
[the quickstart guide]: ../../../tutorials/getting-started
[Ambassador Cloud]: https://app.getambassador.io/cloud/
[Support Portal]: http://support.datawire.io
