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
    hostname: ambassador-dev-portal
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

But if you would like to expose the portal with DNS and a hostname, you will need you use the following spec:


```yaml
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  labels:
    hostname: ambassador-dev-portal
  name: dev-portal
  namespace: ambassador
spec:
  prefix: /dev-portal/
  rewrite: /dev-portal/
  service:https://staging-app.datawire.io
  host_rewrite: staging-app.datawire.io
  add_request_headers:
    X-Staging-Authorization:
      value: Basic <staging-secret>
      append: False
    x-ambassador-api-key:
      value: <insert-api-key>
      append: False
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

<Alert severity="warning">
  You'll need to generate an <a href="https://app.getambassador.io/cloud/settings/api-key">API token</a>.
</Alert>

Then the developer portal will be reachable at `https://ambassador-dev-portal.internal.com/dev-portal/`

Since this is a mapping, you can add authentication service on top of it, leveraging filters, or use it with a private
IP to avoid any public exposure.