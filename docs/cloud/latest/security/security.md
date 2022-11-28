---
    title: "Security controls | Ambassador Cloud"
    description: "An overview of Ambassador Cloud's security page. Create API keys and Edge Stack filter resources, and learn how to manage secure access to your cluster." 
---
import Alert from '@material-ui/lab/Alert';

# Ambassador Cloud Security overview

The [Ambassador Cloud Security page](https://app.getambassador.io/cloud/security/api-keys) allows you to create and manage API keys for Edge Stack through the online Ambassador Cloud interface. 

   <Alert severity="info">
      API key management is only available for clusters running Edge Stack version 3.1 or later.
   </Alert>

## API keys and filters 

API keys in Ambassador Cloud are managed by the `FilterPolicy` and `Filter` resources in your cluster.

When you click the **Generate Filter** button in Ambassador Cloud, it opens the slideout to create the `FilterPolicy` and `Filter` resources for your API keys. 

The `FilterPolicy` resource is used by all the filters created in the Ambassador Cloud Security page. The `Filter` resource references the secret for all API Keys created within the designated Ambassador Cloud filter group.

Once you have added the `FilterPolicy` and `Filter` resources to your cluster, Ambassador Cloud will display any `Filter` resources you created in the UI with a **Generate an API Key** button to the right of the Filter name.

### Creating filters

Before you create API keys, you need to create a `FilterPolicy` resource and a `Filter` [resource](../../../../edge-stack/latest/topics/using/filters/apikeys/).

To create these filter resources: 

1. Click the **Create Filter** button to open the filters slideout. 
2. Enter a name for the filter and the hosts and paths to associate with the filter. These hosts and paths will apply to any API keys you generate for this filter in the future.
   Filters can only be generated for the ambassador namespace.
3. Once you've filled out the fields in the slideout, Click **Generate Filter**. 
   Ambassador Cloud generates the YAML text for the  `FilterPolicy` and `Filter` resources.
4. Copy the `FilterPolicy` and `Filter` resources from the slideout and paste them into a YAML file. Once you've saved the YAML file, synchronize it with your preferred GitOps tool or apply it directly to your cluster using `kubectl`:
```bash
kubectl apply -f generated-filters.yaml
```

When you reload the Security page in Ambassador Cloud, your filter displays on the page. Now you can create API keys to use with this filter.

### Creating API keys

Once you've created the `FilterPolicy` and `Filter` resource and added them to your cluster, you can create API keys in Ambassador Cloud. API keys are a special token that are added to HTTP headers.

To create a key: 

1. Locate the filter you want to create the API key for, and click **Generate an API key** to open the API key slideout.
2. Enter a name and description for the API key, then click **Generate**. 
   The slideout displays the API key. Be sure to copy this key down; this is the only time the key is displayed.
3. Pass the API key with cURL. 
   For example, for the endpoint at `https://${EDGE_STACK_IP}/api/my-service` with the HTTP header `x-api-key`, the following request will respond with HTTP status code `200`: 

```bash
curl -H "X-API-Key: ${MY_API_KEY}" https://staging-app.datawire.io/cloud/api/service-groups
```

#### Revoke an API key

To revoke a key, click on the filter in Ambassador Cloud to expand the list of all keys associated with the filter. Find the key you want to revoke access for and click **REVOKE**.

[This is just a test](https://www.getambassador.io/)