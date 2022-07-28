---
title: "Ambassador Cloud Developer Portal"
description: "API Management by Ambassador"
---

# Troubleshooting

## The URL displayed in the Developer Portal does not contain the hostname

The hostname must be set in your `Mapping` resource.

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

## The URL displayed in the Developer Portal contains the prefix two times

If you've defined a base path in your API documentation and a prefix is also defined in your mapping, the URL might contain the prefix two times.

We are working on a long-term solution to fix this issue, in the mean time there are multiple workarounds to fix that :
- Remove the base path in your API documentation
- Keep the same API documentation but alter the endpoint where the mapping gets the API documentation.
