import Alert from '@material-ui/lab/Alert';

# Annotations

<div class="docs-article-toc">
<h3>Contents</h3>

* [About annotations](#about-annotations)  
* [Supported annotations](#supported-annotations)  
* [Annotate via `kubectl`](#annotate-via-kubectl)  
* [Annotate via YAML](#annotate-via-yaml)  
* [Example YAML](#annotate-via-kubectl)

</div>

## About annotations

[Annotations](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/) are used to attach metadata to your Kubernetes objects.  Typically they are used to provide contextual information around the object for teammates or information used by third-party tools.  Service Catalog combines these uses to build a readily available catalog of your services, accessible by your teammates via [Ambassador Cloud](https://app.getambassador.io/cloud/catalog).

## Supported annotations

[Service Catalog's](https://app.getambassador.io/cloud/catalog) supported annotation keys all start with [`a8r.io`](http://a8r.io) followed by the specific field. These are the metadata keys that Service Catalog supports:

| Key | Description | Example |
| --- | --- | --- |
| `a8r.io/description` | Unstructured text description of the service for humans | `Edge Stack, responsible for handling all ingress traffic` |
| `a8r.io/owner` | GitHub or equivalent username (prefix with @), email address, or unstructured owner description | `@edgey` |
| `a8r.io/chat` | Slack channel, or link to other external chat system | `#ambassador` |
| `a8r.io/bugs` | Link to external bug tracker | `https://github.com/datawire/ambassador/issues` |
| `a8r.io/logs` | Link to external log viewer | `https://kibana.getambassador.io` |
| `a8r.io/documentation` | Link to external project documentation | `https://www.getambassador.io/docs/edge-stack/latest/` |
| `a8r.io/repository` | Link to external VCS repository | `https://github.com/datawire/ambassador` |
| `a8r.io/support` | Link to external support center | `https://a8r.io/Slack` |
| `a8r.io/runbook` | Link to external project runbook | `https://www.getambassador.io/docs/edge-stack/latest/topics/running/debugging/` |
| `a8r.io/incidents`  | Link to external incident dashboard | `https://incidents.getambassador.io` |
| `a8r.io/uptime` | Link to external uptime dashboard | `https://uptime.getambassador.io` |
| `a8r.io/performance` | Link to external performance dashboard | `https://performance.getambassador.io` |
| `a8r.io/dependencies` | Unstructured text description of the service dependencies for humans | `Redis` |

## Annotate via `kubectl`

<Alert severity="info">Annotations made via <code>kubectl</code> will not be retained if the service is redeployed via a CI/CD pipeline or other means. <a href="../../../../../edge-stack/latest/topics/concepts/gitops-continuous-delivery/#continuous-delivery-and-gitops">GitOps best practice</a> is to modify and track annotations via YAML under version control.</Alert>

```
kubectl annotate svc <service name> a8r.io/owner="<your name>"
```

If an annotation already exists for that key, you will get an error. You must add the `--overwrite` flag:

```
kubectl annotate --overwrite svc <service name> a8r.io/owner="<your name>"
```

If your service is in a namespace other than `default`, you must specify it with the `--namespace` flag:

```
kubectl annotate svc <service name> --namespace <namespace> a8r.io/owner="<your name>"
```

## Annotate via YAML

```
apiVersion: v1
kind: Service
metadata:
  Name: your_service_name
  annotations:
    a8r.io/repository: "https://github.com/<your org>/<your repo>"
```

## Example YAML

An example service YAML completely annotated can be seen below:

```yaml
apiVersion: v1
kind: Service
metadata:
  Name: ambassador
  annotations:
    a8r.io/description: "Edge Stack, responsible for handling all ingress traffic"
    a8r.io/owner: "Edgey"
    a8r.io/chat: "#ambassador"
    a8r.io/bugs: "https://github.com/datawire/ambassador/issues"
    a8r.io/logs: "https://kibana.getambassador.io"
    a8r.io/documentation: "https://www.getambassador.io/docs/edge-stack/latest/"
    a8r.io/repository: "https://github.com/datawire/ambassador"
    a8r.io/support: "https://a8r.io/Slack"
    a8r.io/runbook: "https://www.getambassador.io/docs/edge-stack/latest/topics/running/debugging/"
    a8r.io/incidents: "https://incidents.getambassador.io"
    a8r.io/uptime: "https://uptime.getambassador.io"
    a8r.io/performance: "https://performance.getambassador.io"
    a8r.io/dependencies: "Redis"
```

Once you have modified your YAML, don’t forget to apply this with `kubectl` or via your standard deployment process:

```
kubectl apply -f my_service.yaml
```