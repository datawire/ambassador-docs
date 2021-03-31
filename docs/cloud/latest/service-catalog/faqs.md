# Service Catalog FAQs

**Where do I sign in to Service Catalog?**

Sign in to Service Catalog [here](https://app.getambassador.io/cloud/catalog).

**How can I see Service Catalog in action?**

Check out our [demo video](https://www.youtube.com/watch?v=Osedx_ksD7Q)!

**Why Service Catalog?**

Service Catalog provides a comprehensive view of all services deployed across your cluster.

Service Catalog also supports [a set of annotations](../reference/annotations#supported-annotations) that you can add to your services to provide critical human-visible metadata: the owner of the service, a link to the GitHub repo, and more.

Having this type of service metadata easily available in a single location is invaluable when reacting to a production incident.

**What type of services can be added to the Service Catalog?**

You can add any type of [Kubernetes Service](https://kubernetes.io/docs/concepts/services-networking/service/) to Service Catalog. 

When you connect your Edge Stack to Ambassador Cloud all of the Services within your current cluster will be listed in the Service Catalog.

**What type of metadata can be added to each service in the catalog?**

Please find the entire list of supported annotations [here](../reference/annotations#supported-annotations).

**How can I *add* metadata to a service within the catalog?**

Please find instructions on annotating services [here](../reference/annotations/#annotate-via-kubectl).

**How do I *update* metadata on a service within the catalog?**

You can use the `kubectl annotate --overwrite` command (substituting your annotation key and value as required):

`kubectl annotate --overwrite svc service-name a8r.io/description=”<your description>”`

You can also update annotations directly in your Kubernetes Service YAML or templates and `kubectl apply` this or deploy via a build pipeline (e.g. Argo CD).

**How do I *remove* metadata on a service within the catalog?**

You can use the `kubectl annotate --overwrite` command with an empty string (substituting your annotation key and value as required):

`kubectl annotate --overwrite svc service-name a8r.io/description=""`

If you want to remove the annotation entirely you can add a “-” postfix to your required annotation key:

`kubectl annotate svc service-name a8r.io/owner-`

You can also update annotations directly in your Kubernetes Service YAML or templates and `kubectl apply` this or deploy via a build pipeline (e.g. Argo CD).

**Why should I use Kubernetes annotations rather than labels?**

The short answer is that labels are for Kubernetes, while annotations are for humans.

The Kubernetes documentation says annotations can “attach arbitrary non-identifying metadata to objects.” This means that annotations should be used for attaching metadata that is external to Kubernetes (i.e., metadata that Kubernetes won’t use to identify objects). As such, annotations can contain any type of data. 

This is a contrast to labels, which are designed for uses internal to Kubernetes. As such, label structure and values are [constrained](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set) so they can be efficiently used by Kubernetes.

**Does the service metadata persist across cluster restart?**

Annotations added to a service via any method will persist after a Kubernetes cluster restart. 

**Does the service metadata persist after a new service deployment?**

Annotations added to a Kubernetes Service via YAML (or associated config template) will be reapplied upon each new deployment. Any annotations added via `kubectl annotate` will be overwritten by the annotations in the YAML config being applied. This includes the removal of annotations if they are not specified in the new YAML config.


**Why can’t I connect my cluster and services to Service Catalog?**

Please check the following:

* Has the Edge Stack been successfully installed in your cluster? Are all of the Edge Stack Pods in a healthy state (e.g. no status of `CrashLoopBackoff`)?
* Have you successfully applied your Cloud Connect token to your installation of the Edge Stack? If not, please sign in to [Ambassador Cloud](https://app.getambassador.io/cloud/catalog) and follow the instructions to add a cluster to the Service Catalog.
* Are you running Ambassador Edge Stack 1.12 or later? Earlier versions of the Edge Stack, or an Edge Stack running in “legacy” mode, do not support reporting Service metadata to Ambassador Cloud.

**Why have my cluster/services disappeared from Service Catalog?**

Please check the following:

* Is your cluster still running? For example, if you are using `minikube`, the cluster will stop when the Docker daemon is stopped.
* Is the Edge Stack still installed in your cluster? Are all of the associated Services and Pods in a healthy state (e.g. no status of `CrashLoopBackoff`)?

**What components get installed into my cluster when connecting to Service Catalog?**

The standard [Edge Stack Services](../../../../edge-stack/latest/topics/install/) get installed within your cluster. The Edge Stack components are responsible for synchronizing the list of Services within your cluster with the list displayed within the Service Catalog.

**How do I share my feedback on Ambassador Cloud and Service Catalog?**

Your feedback is always appreciated and helps us build a product that provides as much value as possible for our community. You can chat with us directly on our [feedback page](../../../../../feedback), or you can join our [Slack channel](http://d6e.co/slack) to share your thoughts.
