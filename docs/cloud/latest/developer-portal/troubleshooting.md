---
title: "Troubleshooting  |  Ambassador Cloud Developer Portal"
description: "Common troubleshooting tips for the Ambassador Cloud Developer Portal."
---

# Troubleshooting

## The URL displayed in the Developer Portal does not contain the hostname

The hostname or host must be set in your `Mapping` resource depending on your apiVersion.

<Alert severity="warning">
  If you are using getambassador.io/v3alpha1 apiVersion and beyond, you must use hostname.
</Alert>

   ```yaml
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: quote-backend
   spec:
     hostname: my-awesome-company.com
     prefix: /backend/
     service: quote
     docs:
       path: "/.ambassador-internal/openapi-docs"
   ...
   ```

<Alert severity="warning">
  If you are using getambassador.io/v2 apiVersion, you must use host instead.
</Alert>

  ```yaml
   ---
   apiVersion: getambassador.io/v2
   kind: Mapping
   metadata:
     name: quote-backend
   spec:
     host: my-awesome-company.com
     prefix: /backend/
     service: quote
     docs:
       path: "/.ambassador-internal/openapi-docs"
   ...
   ```

## The URL displayed in the Developer Portal contains duplicated prefixes

If you've defined a base path in your API documentation and a prefix is in your mapping, the URL might contain duplicates.
For example, my-awesome-company.com/backend/backend

We are working on a long-term solution to fix this issue, in the mean time there are multiple workarounds to fix that :
- Remove the [base path](https://swagger.io/docs/specification/2-0/api-host-and-base-path/) in your API documentation
- Keep the same API documentation but alter the endpoint where the mapping gets the API documentation

[This is just a test](https://www.getambassador.io/)
