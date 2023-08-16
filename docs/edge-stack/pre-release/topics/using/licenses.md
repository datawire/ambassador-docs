# Licenses for $productName$

$productName$ requires a valid license to startup, but that does not mean that you have to pay for $productName$ to get started.

There are two options for the type of license that you can obtain for $productName$

## The Community License

The community license is a license that will let you use $productName$ for free with certain restrictions.

The core routing functionality of $productName$ is free to use and has no limits whatsoever. The premium features
such as Single Sign-On and Rate Limiting are free to use up to an average of 5 requests per second
(calculated as an average every ~10 seconds) with the community license. Requests going over these limits will
not be dropped, but you will start seeing log warnings about being out of compliance with the community
license. The community license is valid for 2 days and renews automatically via a check-in request to Ambassador
Cloud. So long as you are not abusing the community license and going consistently over the limit of 5 RPS for
the premium features, then your community license will continue to be renewed automatically. If you need more
than 5 RPS for the premium features or wish to use $productName$ in an air-gapped cluster, you will need to
obtain an [enterprise license][] please [reach out to our sales team][] for more information about licensing plans.

For more details on core unlimited features and premium features, see the [editions page](/editions).

1. Creating a Community License

   you can follow the instructions on [the quickstart guide][] to get signed into [Ambassador Cloud][] and obtain a cloud connect token for your installation of $productName$ if you don't already have one.
   This will let $productName$ request and renew your community license from Ambassador Cloud.

   The Cloud Connect Token is a `ConfigMap` that you will create in your Kubernetes cluster and looks like this:

   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: edge-stack-agent-cloud-token
     namespace: ambassador
   data:
     CLOUD_CONNECT_TOKEN: <Your Cloud Connect Token from Abassador Cloud>
   ```

2. Create the Cloud Connect Token with Helm

   ```bash
   helm install edge-stack --namespace ambassador datawire/edge-stack --set emissary-ingress.createDefaultListeners=true --set emissary-ingress.agent.cloudConnectToken=<Your Cloud Connect Token from Abassador Cloud>
   ```

3. Create the Cloud Connect Token with Yaml

   If you do not want to use Helm to manage your installation, then you can create the Cloud Connect Token with raw yaml instead.

   ```bash
   kubectl create configmap --namespace ambassador edge-stack-agent-cloud-token --from-literal=CLOUD_CONNECT_TOKEN=<Your Cloud Connect Token from Abassador Cloud>
   ```

## Enterprise Licenses

To obtain an enterprise license, you can [reach out to our sales team][] for more information about plans and pricing.

[reach out to our sales team]: /contact-us/
[enterprise license]: #enterprise-licenses
[the quickstart guide]: ../../../tutorials/getting-started
[Ambassador Cloud]: https://app.getambassador.io/cloud/
