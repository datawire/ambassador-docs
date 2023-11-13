
import Alert from '@material-ui/lab/Alert';

# The **APIKey Filter** Type (v3alpha1)

The `APIKey Filter` validates API Keys present in HTTP headers. The list of authorized API Keys is defined directly in a Secret.
If an incoming request does not have the header specified by the `APIKey Filter` or it does not contain one of the key values
configured by the `Filter` then the request is denied.
For more information about how requests are matched to `Filter` resources and the order in which `Filters` are executed, please
refer to the [FilterPolicy Resource][] documentation.

<br />

This doc is an overview of all the fields on the `APIKey Filter` Custom Resource with descriptions of the purpose, type, and default values of those fields.
This page is specific to the `getambassador.io/v3alpha1` version of the `APIKey Filter` resource. For the newer `gateway.getambassador.io/v1alpha1` resource,
please see [the v1alpha1 APIKey Filter api reference][].

<Alert severity="info">
    <code>v3alpha1</code> <code>Filters</code> can only be referenced from <code>v3alpha1</code> <code>FilterPolicies</code>.
</Alert>

## APIKey Filter API Reference

To create an APIKey Filter, the `spec.type` must be set to `apikey`, and the `apikey` field must contain the configuration for your
APIKey Filter.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: "example-apikey-filter"
  namespace: "example-namespace"
spec:
  ambassador_id: []string
  APIKey:  APIKeyFilter            # required
    httpHeader: string             # optional, default: `x-api-key`
    keys: []APIKeyItem             # required, min items: 1
    - secretName: string           # required
```

### APIKeyFilter

| **Field**          | **Type**            | **Description**  |
|--------------------|---------------------|------------------|
| `httpHeader`       | `string`            | The name of the http header where the api-key will be found (always case-insensitive). By default it will use the `x-api-key` header. |
| `keys`             | \[\][APIKeyItem][]        | The set of APIKeys that are used to check the whether the incoming request is valid. |

### APIKeyItem

| **Field**          | **Type**            | **Description**  |
|--------------------|---------------------|------------------|
| `secretName`       | `string`            | Defines how to resolve the values of the keys. Currently the only supported way to resolve a key is via a local secret. APIKeys cannot use shared secrets in a different namespace than the `APIKey Filter` resource. |

**Note about Secret formatting**:
When supplying secrets to an API Key filter, the keys of the Secret do not matter, but the value of your API Key must be [base64][] encoded.

For example, if you want to create a secret for the API Key value `example-api-key-value`, the secret should look like:

```yaml
---
   apiVersion: v1
   kind: Secret
   metadata:
     name: apikey-filter-keys
   type: Opaque
   data:
     any-name-you-want: ZXhhbXBsZS1hcGkta2V5LXZhbHVl
```

You can specify as many API Keys in the Secret as you like.

[APIKeyItem]: #apikeyitem
[FilterPolicy Resource]: ../filterpolicy
[the v1alpha1 APIKey Filter api reference]: ../../../gateway-getambassador/v1alpha1/filter-apikey
[base64]: https://en.wikipedia.org/wiki/Base64
