import Alert from '@material-ui/lab/Alert';

# Custom endpoint

Since you may want to limit who has access to your Ambassador Cloud account, you
have the option to expose the developer portal as a stand alone version.

To expose your developer portal, you will need to add a mapping to your edge-stack cluster.

For example, to expose the portal using an internal DNS entry, you can create
the following mapping : 

```yaml
spec:
  host: 
  apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  labels:
    hostname: proxy-ambassador
  name: private-portal
  namespace: ambassador
spec:
  prefix: /cloud/
  rewrite: /cloud/
  service: https://app.getambassador.io
  host_rewrite: app.getambassador.io
  hostname: my-private-portal-ambassador.internal.com
  add_request_header:
    x-ambassador-api-key: <API_TOKEN>
---
```

<Alert severity="warning">
  You'll need to generate an <a href="https://app.getambassador.io/cloud/settings/api-key">API token</a>.
</Alert>

Then the developer portal will be reachable at `https://my-private-portal-ambassador.internal.com/cloud/dev-portal/standalone`

Since this is a mapping, you can add authentication service on top of it, leveraging filters, or use it with a private
IP to avoid any public exposure.