import Alert from '@material-ui/lab/Alert';
import GSTabs2 from '../../../tutorials/gs-tabs2'

# Service Catalog Quick Start

<div class="docs-article-toc">
<h3>Contents</h3>

* [Prerequisites](#prerequisites)
* [1. Connect your Cluster to Ambassador Cloud](#1-connect-your-cluster-to-ambassador-cloud)
* [2. Claim Ownership of a Service](#2-claim-ownership-of-a-service)
* [3. Add Additional Metadata via YAML](#3-add-additional-metadata-via-yaml)
* [What's Next?](#img-classos-logo-srcimageslogopng-whats-next)

</div>

## Prerequisites

Service Catalog requires Edge Stack version 2.0 or greater to be installed in your cluster.

<Alert severity="info">Install Edge Stack <a href="../../../tutorials/getting-started/">from here</a> if needed.</Alert>

If you already have Edge Stack installed, **check your Edge Stack version** by running this command:

```
kubectl get deploy -n ambassador ambassador -o jsonpath='{.spec.template.spec.containers[0].image}'
```

Is the `image` at version 2.0 or greater?  Than you're good to go with Service Catalog!

If not, [follow this doc](../../../topics/install/upgrading/) to upgrade Edge Stack.

## 1. Connect your Cluster to Ambassador Cloud

<Alert severity="info">If you followed the <a href="../../../tutorials/getting-started/">Edge Stack quick start</a>, you should have already completed this step.</Alert>

The Service Catalog within Ambassador Cloud allows you to easily list all of your cluster's services. You can view, add, and update metadata associated with each service, such as the owner, version control repository, and associated Slack channel.

Follow the instructions that match your Edge Stack installation method below to connect your cluster and start using Service Catalog.

<GSTabs2/>

When the installation completes, refresh the Ambassador Cloud page.  All of your services running in the cluster are now listed in Service Catalog!

If you installed Edge Stack into an empty cluster you won't see any services in your catalog (except for Edge Stack's services that start with `ambassador`).

Apply this sample app to quickly see an example of a service in the catalog:

```
kubectl apply -f http://getambassador.io/yaml/quickstart/qotm.yaml
```

Then refresh your Service Catalog page and you should see the `quote` service listed.

<Alert severity="success"><b>Success!</b> You can now see services in your Ambassador Cloud account!</Alert>

<hr style="height:0px; visibility:hidden;" />

<Alert severity="info">If you follow <a href="../../../topics/concepts/gitops-continuous-delivery/#continuous-delivery-and-gitops"><b>GitOps practices</b></a> please follow your own best practices to add the token to your configuration.</Alert>

## 2. Claim Ownership of a Service

Click the `quote` service in the list. The service details page now opens that displays additional information about the service.

(screenshot)

The metadata for each service is determined by annotations included within your Kubernetes YAML config files. You can annotate the config of the `ambassador` service that you have just installed to display your name.

Change the name of the owner of the `quote` service by replacing `YOUR_GITHUB_USERNAME` in the command below and running it:

```
kubectl annotate --overwrite svc quote -n ambassador a8r.io/owner="YOUR_GITHUB_USERNAME"
```

Look at the `quote` service in the service catalog and see the change with your GitHub username.

<Alert severity="info">It may take up to 30 seconds for Service Catalog to sync with your cluster and your annotation to appear.</Alert>

(screenshot)

<Alert severity="success"><b>Great!</b> You should see the owner change for your service in the catalog! Now any of your teammates can quickly find who the owner of the service is. You've updated the owner, but <b>Service Catalog supports many more annotations!</b>  See the full list <a href="../reference/annotations/">here</a>.</Alert>

Modifying the annotations via `kubectl` is quick and easy, but the changes made to the annotations will not remain if a new deployment of the service is made.

Let's set an annotation using YAML instead to ensure that a new deployment includes the annotations.

## 3. Add Additional Metadata via YAML

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

Now add the following annotation, replacing `YOUR_GIT_REPO_URL` with the URL on the related Git repository for the service:

`a8r.io/repository: "YOUR_GIT_REPO_URL"`

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

<hr style="height:0px; visibility:hidden;" />

<Alert severity="success"><b>Fantastic!</b> You should see the Git repo metadata change for your service in the catalog! Now any of your teammates can quickly find the repo for the service.</Alert>

## <img class="os-logo" src="../../../images/logo.png"/> What's Next?

You've updated owner and repo URL, but **Service Catalog supports many more annotations!**  See the full list [here](../../reference/annotations/).
