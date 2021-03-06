import Alert from '@material-ui/lab/Alert';
import GSTabs2 from '../../../tutorials/gs-tabs2'

# Service Catalog Quick Start

<div class="docs-article-toc">
<h3>Contents</h3>

* [The Power of Kubernetes Annotations](#the-power-of-kubernetes-annotations)
* [Prerequisites](#prerequisites)
* [1. Connect your Cluster to Ambassador Cloud](#1-connect-your-cluster-to-ambassador-cloud)
* [2. Claim Ownership of a Service](#2-claim-ownership-of-a-service)
* [3. Add Additional Metadata via YAML](#3-add-additional-metadata-via-yaml)
* [What's Next?](#img-classos-logo-srcimageslogopng-whats-next)

</div>

<Alert severity="info">Looking for the link to log in to Service Catalog? <a href="https://app.getambassador.io/cloud/catalog">Click here!</a> If you haven't configured your cluster yet the catalog will be empty, you first need to complete with this quick start guide.</Alert>

## The Power of Kubernetes Annotations 

Have you ever been asked to troubleshoot a failing Kubernetes service and struggled to find basic information about the service such as the source repository and owner? Troubleshooting always begins with information gathering. 

Kubernetes annotations are designed to solve exactly this problem. They are designed to add metadata to Kubernetes objects. 

Using `kubectl`, let's create a basic service named `ghost-service` with the `a8r.io/description` annotation set to "An annotated ghost service that points to nowhere in particular".

Copy and paste this into your terminal:

```
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: Service
metadata:
  name: ghost-service
  annotations:
    a8r.io/description: "An annotated ghost service that points to nowhere in particular"
spec:
  ports:
    - protocol: TCP
      port: 80
EOF
```

You can easily view all of the annotations on your new service using `kubectl`:

```
$ kubectl describe svc ghost-service
  
  Name:              ghost-service
  Namespace:         default
  Labels:            <none>
  Annotations:       a8r.io/description: An annotated ghost service that points to nowhere in particular
  ...
```

<Alert severity="success"><b>Success!</b> You can easily add important metadata using Kubernetes annotations to your services. This information is invaluable when trying to resolve issues and understand your system.</Alert>

You can also add annotations using the `kubectl annotate` command:

```
$ kubectl annotate svc ghost-service a8r.io/owner=Casper
  
  service/ghost-service annotated
  
$ kubectl describe svc ghost-service 
  
  Name:              ghost-service
  Namespace:         default
  Labels:            <none>
  Annotations:       a8r.io/owner: Casper
                     a8r.io/description: An annotated ghost service that points to nowhere in particular
  ...
```

<Alert severity="success"><b>Congratulations!</b> You can easily add Kubernetes annotations to service via <code>kubectl annotate</code> and view the information via <code>kubectl describe</code>.</Alert>

As your number of services grows it can be challenging to view all of the annotation information via `kubectl describe`. 

Ambassador Cloud Service Catalog provides a centralized view with an easily navigable web-based UI of your services running in all of your clusters. Let’s configure this now!

<Alert severity="info">Before proceeding, you can remove the <code>ghost-service</code> with <code>kubectl delete svc ghost-service</code>.</Alert>

## Prerequisites

Service Catalog requires **Edge Stack version 1.12 or greater** to be installed in your cluster.

**Install** Edge Stack <a href="../../../tutorials/getting-started/">from here</a> if needed.

If you already have Edge Stack installed, **check your version** by running this command:

```
kubectl get deploy -n ambassador ambassador -o jsonpath='{.spec.template.spec.containers[0].image}'
```

Is the `image` at version 1.12 or greater?  Then you are ready to start using Service Catalog!

If not, [follow this doc](../../../topics/install/upgrading/) to **upgrade** Edge Stack.

## 1. Connect your Cluster to Ambassador Cloud

<Alert severity="info">If you followed the <a href="../../../tutorials/getting-started/">Edge Stack quick start</a>, you should have already completed this step.</Alert>

The Service Catalog is a web-based interface that lists all of your cluster's Services. You can view, add, and update metadata associated with each Service, such as the owner, version control repository, and associated Slack channel.

<!--
Follow the instructions that match your Edge Stack installation method below to connect your cluster and start using Service Catalog.

<GSTabs2/>
-->

1. Log in to [Ambassador Cloud](https://app.getambassador.io/cloud/catalog) with your GitHub account.

2. At the top, hover over **All Clusters** then click **Add a Cluster**.

3. Follow the prompts to name the cluster and click **Generate a Cloud Token**.

4. Follow the prompts to install the cloud token into your cluster.

5. When the token installation completes, refresh the Service Catalog page.  

<Alert severity="success"><b>Victory!</b> All the Services running in your cluster are now listed in Service Catalog!</Alert>

If you installed Edge Stack into an empty cluster you won't see any services in your catalog (except for the Edge Stack services which start with `ambassador`).  Apply this sample app to quickly see an example of a service in the catalog:

```
kubectl apply -f http://getambassador.io/yaml/quickstart/qotm.yaml
```

Then refresh your Service Catalog page and you should see the `quote` service listed.

<Alert severity="success"><b>Success!</b> You can now see services in your Ambassador Cloud account!</Alert>



<Alert severity="info">If you follow <a href="../../../topics/concepts/gitops-continuous-delivery/#continuous-delivery-and-gitops"><b>GitOps practices</b></a> please follow your organization's best practices to add the token to your configuration.</Alert>

## 2. Claim Ownership of a Service

Click the `quote` service in the list. The service details page now opens that displays additional information about the service.

The metadata for each service is determined by annotations included within your Kubernetes YAML config files. You can annotate the config of the `ambassador` service that you have just installed to display your name.

1. Change the name of the owner of the `quote` service by replacing `<your name>` in the command below and running it:

  ```
  kubectl annotate --overwrite svc quote -n ambassador a8r.io/owner="<your name>"
  ```

2. Refresh your Service Catalog page anl dook at the `quote` service to see the change with your name.

<Alert severity="info">It may take up to 30 seconds for Service Catalog to sync with your cluster and your annotation to appear.</Alert>

<Alert severity="success"><b>Great!</b> You should see the owner change for your service in the catalog! Now any of your teammates can quickly find who the owner of the service is. You've updated the owner, but <b>Service Catalog supports many more annotations!</b>  See the full list <a href="../reference/annotations/">here</a>.</Alert>

Modifying the annotations via `kubectl` is quick and easy, but the changes made to the annotations will not remain if a new deployment of the service is made.

Let's set another annotation using YAML instead to ensure that a new deployment includes the annotations.

## 3. Add Additional Metadata via YAML

Open the YAML config file of one of your services.  If you applied our `quote` service earlier, you can download the YAML [here](/yaml/quickstart/qotm.yaml).

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

## <img class="os-logo" src="../../../images/logo.png"/> What's Next?

You've updated the owner and repo URL, but **Service Catalog supports many more annotations!**  See the full list [here](../reference/annotations/).
