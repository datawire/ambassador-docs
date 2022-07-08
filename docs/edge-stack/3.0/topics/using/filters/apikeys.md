import Alert from '@material-ui/lab/Alert';

# API Keys Filter

The API Keys filter validates API Keys present in the HTTP header. The list of authorized API Keys is defined directly in a secret.

## API Keys global arguments

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: "example-apikeys-filter"
  namespace: "example-namespace"
spec:
  APIKey:
    httpHeader: "x-my-api-key-header" # optional; default is X-API-Key
    keys:
      - secretName: "my-secret-api-keys"
        secretNamespace: "example-namespace" # optional; default is the namespace the filter is created in.
---
apiVersion: v1
kind: Secret
metadata:
  namespace: ambassador
  name: my-secret-api-keys
data:
  key-one: bXktZmlyc3QtYXBpLWtleQ==
  key-two: bXktc2Vjb25kLWFwaS1rZXk=
```

 - `httpHeader` is the header used to do the API Keys validation.

 - `keys`: A list of API keys that will be used for the validation. A list of keys can be defined using a secret or you can define a standalone key directly in the filter resource.

