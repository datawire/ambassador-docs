import Alert from '@material-ui/lab/Alert';

# Annotating a Service

Service Catalog lists all the services in your cluster, including helpful information like the owner, a description of the service, links to documentation, and more.

This information is all sourced from annotations set on the services.  Annotations can be set either via `kubectl` or via Kubernetes YAML files.

<Alert severity="info">The full list of supported annotations is available <a href="../../reference/annotations/">here</a>.</Alert>

## Annotate via `kubectl`

Find a service you would like to annotate in your Service Catalog list that does not have an owner yet listed.

Take a note of the service name and run this command, filling in the service name and your name:

```
kubectl annotate svc <service name> a8r.io/owner="<your name>"
```

Refresh your browser and you should see the owner field updated.

<Alert severity="info">It may take up to 30 seconds for Service Catalog to sync with your cluster and your annotation to appear. If there is no owner listed, wait a moment then refresh again.</Alert>

If an annotation already exists for that key you will get an error; add the `--overwrite` flag:

```
kubectl annotate --overwrite svc <service name> a8r.io/owner="<your name>"
```

If your service is in a namespace other than `default`, you must specify it with the `--namespace` flag:

```
kubectl annotate svc <service name> --namespace <namespace> a8r.io/owner="<your name>"
```

While this is a quick and effective way to set a single annotation on a service, it doesn't scale well to setting multiple annotations.  It also doesn't follow <a href="../../../topics/concepts/gitops-continuous-delivery/#continuous-delivery-and-gitops"><b>GitOps best practices</b></a> as normally such resource updates should be stored in version control and applied via a deployment pipeline.

To accomplish this, you can annotate instead using YAML.

<Alert severity="info">The full list of supported annotations is available <a href="../../reference/annotations/">here</a>.</Alert>

## Annotate via YAML

Open the YAML config file of one of your services.

Navigate to the `metadata` property and locate the `annotations` property directly beneath it.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: your_service_name
  annotations:
```

If you cannot find an `annotations` property, add one to your config in the location shown.

Now add the following annotation, filling in your repo URL:

`a8r.io/repository: "<repo URL>"`

Your updated Service config should look something like this:

```yaml
apiVersion: v1
kind: Service
metadata:
  Name: your_service_name
  annotations:
    a8r.io/repository: "https://github.com/datawire/ambassador"
```

Now apply this updated YAML to your cluster:

```
kubectl apply -f my_service.yaml
```

This YAML file can now be added to version control using your organization's practices.

<Alert severity="info">The full list of supported annotations is available <a href="../../reference/annotations/">here</a>.</Alert>