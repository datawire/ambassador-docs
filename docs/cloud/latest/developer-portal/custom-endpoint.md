import Alert from '@material-ui/lab/Alert';

# Custom endpoint


Since you may want to limit who can access to Ambassador Cloud, you
have the option to expose the developer portal the way you want by leveraging
its stand alone version.

To achieve that, use your edge-stack cluster to configure the way you want to expose
the dev portal.

<Alert severity="warning">
  You'll need to generate an <a href="https://app.getambassador.io/cloud/settings/api-key">API token</a>.
</Alert>


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

Then the doc should be reachable at `https://my-private-portal-ambassador.internal.com/cloud/dev-portal/standalone`

Since this is a mapping, you can add an authentication on top of it, leveraging filters, or use it with a private
IP to avoid any public exposure.



