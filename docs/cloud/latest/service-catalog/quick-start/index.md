import Alert from '@material-ui/lab/Alert';
import { LogInText } from '../../../../../../src/components/Docs/LogInText';
import { QuickStartServiceCatalogAlert } from '../../../../../../src/components/Docs/Cloud';

# Quick start

<div class="docs-article-toc">
<h3>Contents</h3>

* [Kubernetes annotations](#kubernetes-annotations)
* [Prerequisites](#prerequisites)
* [1. Connect your cluster to Ambassador Cloud](#1-connect-your-cluster-to-ambassador-cloud)
* [2. Claim ownership of a service](#2-claim-ownership-of-a-service)
* [3. Add additional metadata via YAML](#3-add-additional-metadata-via-yaml)
* [What's next?](#img-classos-logo-srcimageslogopng-alttelepresence-logo--whats-next)

</div>

<QuickStartServiceCatalogAlert />

## Kubernetes annotations

Service Catalog aggregates the Kubernetes annotations on your services into a single portal for your developers to reference, such as the owner, version control repository, and associated Slack channel. Learn more about [adding metadata to services using Kubernetes annotations](../concepts/annotating/).

## Prerequisites

Service Catalog requires **Edge Stack version 1.12 or greater** or **Emissary-ingress 1.13 or greater** to be installed in your cluster.

**Install** Edge Stack <a href="../../../../edge-stack/latest/tutorials/getting-started/">from here</a> if needed.

If you already have Edge Stack or Emissary-ingress installed, **check your version** by running this command (adjust your namespace if necessary):

```
kubectl get deploy -A -l app.kubernetes.io/name=edge-stack -o jsonpath='{.items[].spec.template.spec.containers[0].image}'
```
[Upgrade Edge Stack to the latest version](../../../../edge-stack/latest/topics/install/upgrading/) if needed.

## 1. Connect your cluster to Ambassador Cloud

<Alert severity="info">
  If you followed the <a href="../../../../edge-stack/latest/tutorials/getting-started/">Edge Stack quick start</a>, you should have already completed this step.
</Alert>

1. <LogInText />

2. At the top, click **Add Services** then click **Connection Instructions** in the Edge Stack installation section.

3. Follow the prompts to name the cluster and click **Generate a Cloud Token**.

4. Follow the prompts to install the cloud token into your cluster.

5. When the token installation completes, refresh the Service Catalog page.

<Alert severity="success"><b>Victory!</b> All the Services running in your cluster are now listed in Service Catalog!</Alert>

If you installed Edge Stack into an empty cluster you won't see any services in your catalog (except for the Edge Stack services which start with `ambassador`).  Apply this sample app to quickly see an example of a service in the catalog:

```
kubectl apply -f https://app.getambassador.io/yaml/ambassador-docs/latest/quickstart/qotm.yaml
```

Then refresh your Service Catalog page and you should see the `quote` service listed.

<Alert severity="success"><b>Success!</b> You can now see services in your Ambassador Cloud account!</Alert>



<Alert severity="info">If you follow <a href="../../../../edge-stack/latest/topics/concepts/gitops-continuous-delivery/#continuous-delivery-and-gitops"><b>GitOps practices</b></a> please follow your organization's best practices to add the token to your configuration.</Alert>

## 2. Claim ownership of a service

Click the `quote` service in the list. The service details page now opens that displays additional information about the service.

The metadata for each service is determined by annotations included within your Kubernetes YAML config files. You can annotate the config of the `ambassador` service that you have just installed to display your name.

1. Change the name of the owner of the `quote` service by replacing `<your name>` in the command below and running it.  The value could be a GitHub username, an email address, or your actual name.

  ```
  kubectl annotate --overwrite svc quote a8r.io/owner="<your name>"
  ```

2. Refresh your Service Catalog page and look at the `quote` service to see the change with your name.

<Alert severity="info">It may take up to 30 seconds for Service Catalog to sync with your cluster and your annotation to appear.</Alert>

<Alert severity="success"><b>Great!</b> You should see the owner change for your service in the catalog! Now any of your teammates can quickly find who the owner of the service is. You've updated the owner, but <b>Service Catalog supports many more annotations!</b>  See the full list <a href="/docs/cloud/latest/service-catalog/concepts/annotating">here</a>.</Alert>

Modifying the annotations via `kubectl` is quick and easy, but the changes made to the annotations will not remain if a new deployment of the service is made.

Let's set another annotation using YAML instead to ensure that a new deployment includes the annotations.

## 3. Add additional metadata via YAML

Open the YAML config file of one of your services.  If you applied our `quote` service earlier, you can download the YAML <a href="https://app.getambassador.io/yaml/ambassador-docs/latest/quickstart/qotm.yaml" target="_blank">here</a>.

1. Navigate to the `metadata` property and locate the `annotations` property directly beneath it.

  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: <service name>
    annotations:
  ```

  If you cannot find an `annotations` property, add one to your config in the location shown.

2. Now add the following annotation, replacing `<repo URL>` with the related Git repository for the service:

  `a8r.io/repository: "<repo URL>"`

  Your updated Service config should look something like this:

  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    Name: <service name>
    annotations:
      a8r.io/repository: "https://github.com/datawire/ambassador"
  ```

3. Now apply this updated YAML to your cluster, replacing the file name:

  ```
  kubectl apply -f my_service.yaml
  ```

<Alert severity="success"><b>Fantastic!</b> You should see the Git repo metadata change for your service in the catalog! Now any of your teammates can quickly find the repo for the service.</Alert>

## <img class="os-logo" src="../../images/logo.png" alt="Telepresence Logo" /> What's next?

You've updated the owner and repo URL, but Service Catalog supports many more annotations! See the full list [here](/docs/cloud/latest/service-catalog/concepts/annotating).

