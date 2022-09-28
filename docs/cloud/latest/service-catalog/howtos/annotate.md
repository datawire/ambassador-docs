---
description: "Annotating services | Ambassador Cloud"
title: "Learn how to add service annotations with Ambassador Cloud. Find out how to use kubectl and YAML to annotate services."
---

import Alert from '@material-ui/lab/Alert';

# Annotating in Ambassador Cloud

[Service Catalog](https://app.getambassador.io/cloud/) lists all the services in your cluster, including helpful information like the owner, a description of the service, links to documentation, and more.

This information is all sourced from annotations set on the services.  Annotations can be set either via `kubectl` or via Kubernetes YAML files.

## A Convention for Annotations

The following are the supported annotation keys, also documented at [a8r.io](https://a8r.io/):

| Annotation | Description | Example |
| --- | --- | --- |
| `a8r.io/description` | Unstructured text description of the service for humans | `Edge Stack, responsible for handling all ingress traffic` |
| `a8r.io/owner` | GitHub or equivalent username (prefix with @), email address, or unstructured owner description | `@edgey` |
| `a8r.io/chat` | Slack channel, or link to other external chat system | `#ambassador` |
| `a8r.io/bugs` | Link to external bug tracker | `https://github.com/datawire/ambassador/issues` |
| `a8r.io/logs` | Link to external log viewer | `https://kibana.getambassador.io` |
| `a8r.io/documentation` | Link to external project documentation | `https://www.getambassador.io/docs/edge-stack/latest/` |
| `a8r.io/repository` | Link to external VCS repository | `https://github.com/datawire/ambassador` |
| `a8r.io/support` | Link to external support center | `http://a8r.io/slack` |
| `a8r.io/runbook` | Link to external project runbook | `https://www.getambassador.io/docs/edge-stack/latest/topics/running/debugging/` |
| `a8r.io/ignore`  | When present, prevent the service from appearing in the Service Catalog | `any` |
| `a8r.io/incidents`  | Link to external incident dashboard | `https://incidents.getambassador.io` |
| `a8r.io/uptime` | Link to external uptime dashboard | `https://uptime.getambassador.io` |
| `a8r.io/performance` | Link to external performance dashboard | `https://performance.getambassador.io` |
| `a8r.io/dependencies` | Unstructured text description of the service dependencies for humans | `Redis` |
| `a8r.io/rollouts.scm.path` | Path to the directory containing manifests for this service | `path/to/directory` |
| `a8r.io/rollouts.scm.branch` | Branch to target for rollout pull requests | `main` |
| `a8r.io/rollouts.image-repo.type` | Image repository type for rollouts; currently, only `dockerhub` is supported | `dockerhub` |
| `a8r.io/rollouts.image-repo.name` | Base image name that should be updated by rollouts | `docker.io/datawire/demo-image` |
| `a8r.io/rollouts.deployment` | Name of the Kubernetes Deployment or Rollout object to update for rollouts | `demo-app` |
| `a8r.io/rollouts.mappings` | Coma separated list of Mapping objects that should control rollout traffic | `demo-app-mapping,other-mapping` |

## Annotating with kubectl

Find a service you would like to add an owner annotate to in your Service Catalog.

Run the following command, filling in the service name and your name:

```
kubectl annotate svc <service name> a8r.io/owner="<your name>"
```

Refresh your browser the owner is field updated.

If an annotation already exists for that key you will get an error; add the `--overwrite` flag:
```
kubectl annotate --overwrite svc <service name> a8r.io/owner="<your name>"
```

If your service is in a namespace other than `default`, you must specify it with the `--namespace` flag:
```
kubectl annotate svc <service name> --namespace <namespace> a8r.io/owner="<your name>"
```

While this is a quick and effective way to set a single annotation on a service, it doesn't scale well to setting multiple annotations.  It also doesn't follow GitOps best practices; resource updates should be stored in version control and applied through a deployment pipeline. To accomplish this, you can add annotations to your YAML directly.

## Annotating YAML config files directly

Open the YAML config file of one of your services.

Navigate to the `metadata` property and locate the `annotations` property directly beneath it.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: your_service_name
  annotations:
```

If you cannot find an `annotations` property, add one to your config in the location shown above.

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
Finally, apply the updated YAML to your cluster:

```
kubectl apply -f my_service.yaml
```
