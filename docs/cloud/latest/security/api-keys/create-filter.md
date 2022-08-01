# Create a filter

Before creating any API keys, you need to define a filter which will handle them.

For that, we leverage the API Key configuration of the [Filter CRD](../../../../../edge-stack/latest/topics/using/filters/apikeys/) from Edge Stack.

# Steps

Click on the **Create filter** button to create one, and start by providing a name. 

You will be asked for a host and path to associate the Filter. Each host / 
route you define will be secured by the api keys you'll be able to generate for this filter.

<p align="center">
  <img src="./../../../images/security-create-filter.png" width="500"/>
</p>

<Alert severity="info">
  Filters can only be generated in the <strong>ambassador</strong> namespace.
</Alert>

Click on **CREATE**, and copy the YAML source which has been generated for you:

<p align="center">
  <img src="./../../../images/security-create-filter-yaml-source.png" width="500"/>
</p>

You can now paste the content into a YAML file, and synchronize it with your favorite GitOps tool, or apply it directly to your cluster using `kubectl`.

```bash
kubectl apply -f generated-filters.yaml
```



