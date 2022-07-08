# Create a filter

Before creating any api keys, you need to define a filter which will handle them.

For that, we leverage the APIKey configuration of the [Filter CRD](../../../../../edge-stack/latest/topics/using/filters/apikeys/) from Edge Stack.

# Steps

First, click on the **Create filter** button to create one, and provide a name.

<p align="center">
  <img src="./../../../images/security-create-filter.png" width="300"/>
</p>

If this is the first time you create one, the UI should also ask for a route to associate
this first Filter with (you will then have to aprovide a host and a path).

Then clic on create, and paste the YAML source which has been generated for you.

You can then save it in your favorite GitOps tool, or apply it directly to your cluster.



