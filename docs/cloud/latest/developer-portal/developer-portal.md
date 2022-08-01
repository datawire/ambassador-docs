---
title: "Ambassador Cloud Developer Portal"
description: "The Ambassador Cloud Developer Portal allows you to manage your services and their API. Learn how to expose the API with the Mapping custom resource."
---

# Ambassador Cloud Developer Portal overview

The Ambassador Cloud [Developer Portal](https://app.getambassador.io/cloud/dev-portal) provides a consolidated view of your [cells](../service-catalog/concepts/cells), clusters, and API documentation of your services.  Once the Developer Portal is configured for a service, you can try out API requests for the service directly in your browser.

Before you explore the Developer Portal, you first need to report your API docs using Mapping resources. To learn more about how to expose your services API, try the [API visualization quick start](../visualize-api/quick-start).


## Developer Portal access

To expose the Developer Portal in Ambassador Cloud, you need to add a `Mapping` resource to your Edge Stack cluster using one of the examples below. 

For the `x-ambassador-api-key` field in the `Mapping` resources shown below, you need to generate an [API key](https://app.getambassador.io/cloud/settings/api-key) in Ambassador Cloud and add that API token as the value for that field. Because these are standard Edge Stack `Mapping` resources, you can add additional security to the resource as you would with any other [Edge Stack `Mapping` resource](/edge-stack/latest/topics/using/intro-mappings/).

To expose the Developer Portal with an internal DNS entry, create a `Mapping` resource similar to the following: 

```yaml
spec:
  host: 
  apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  labels:
    hostname: ambassador-dev-portal
  name: private-portal
  namespace: ambassador
spec:
  prefix: /dev-portal/
  rewrite: /dev-portal/
  service: https://app.getambassador.io
  host_rewrite: app.getambassador.io
  hostname: my-private-portal-ambassador.internal.com
  add_request_header:
    x-ambassador-api-key: <API_TOKEN>
---
```

To expose the Developer Portal with DNS and a hostname, create a `Mapping` resource similar to the following: 

```yaml
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  labels:
    hostname: ambassador-dev-portal
  name: private-portal
  namespace: ambassador
spec:
  prefix: /dev-portal/
  rewrite: /dev-portal/
  service: https://app.getambassador.io
  host_rewrite: app.getambassador.io
  add_request_headers:
    x-ambassador-api-key:
      value: <insert-api-key>
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: ambassador-dev-portal
  namespace: ambassador
spec:
  hostname: ambassador-dev-portal.com
  requestPolicy:
    insecure:
      action: Route
  mappingSelector:
    matchLabels:
      hostname: ambassador-dev-portal
  tlsSecret:
    name: fallback-self-signed-cert
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: wildcard
  namespace: ambassador
spec:
  hostname: "*"
  tlsSecret:
    name: fallback-self-signed-cert
```

Once you've added the `Mapping` resources to your cluster, the developer portal is available at `https://ambassador-dev-portal.internal.com/dev-portal/`


`
