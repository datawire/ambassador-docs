
import Alert from '@material-ui/lab/Alert';

# Argo CD Quick Start

(brief intro about Argo CD , what it does, the dev problems it solves)

# Prereqs

* [Kubectl](https://kubernetes.io/docs/tasks/tools/) 
* A cluster
* [Edge stack installed](../../tutorials/getting-started/)

## 1. How to set up your source repos

Argo CD needs access to a repo with your k8s projects in order to deploy them into a cluster.

It reads your repo, parses out the projects and YAML manifests that are in the repo, then lets you choose from those projects to deploy into your cluster.  It supports different methods of creating templates for apps (Helm, Kustomize, etc.) but we'll just focus on repos with plain k8s YAML files.

If repo is public then you're good to go. Otherwise if it is private you can give Argo CD GitHub creds for access.
We'll use a public repo with a sample app for this guide.

First, fork the app into your own account so you can make changes to it later:
`https://github.com/mattmcclure-dw/argotest`

## 2. Install Argo CD

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Install the Argo CD CLI:
```
# macOS:
brew install argocd

# Linux:
VERSION=$(curl --silent "https://api.github.com/repos/argoproj/argo-cd/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/download/$VERSION/argocd-linux-amd64
chmod +x /usr/local/bin/argocd
```

## 3. Set up Argo CD

Setup port forwarding to access Argo CD server UI and API:
(ideally we use Edge Stack for ingress, I had trouble getting it working and skipped it for now so I wasn't blocked finishing this draft)
```
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Retrieve the default admin password, it is name of the Argo CD API server Pod:
```
kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o name | cut -d'/' -f 2
```

Authenticate against the API, username is admin:
```
argocd login localhost:8080
```

Set new admin password:
```
argocd account update-password
```

## 4. Deploy sample app from repo

From UI, create new "Quote of the Moment" app

Application Name: `qotm`
> must be a valid DNS name

Project: `default`
Leave next options on their default

Repo URL: `https://github.com/<your github username>/argotest.git`
Revision: leave set on `HEAD`
Path: `yaml` (NO slashes)

Cluster URL: click and select `https://kubernetes.default.svc` (the cluster Argo is running on)
Namespace is `default`

Leave **Directory** settings on defaults
Click **Create** at the top

This creates the app but nothing gets deployed until you click **Sync** on the app.
This deploys the app to your cluster

Wait until status is healthy

Check status with `kubectl get deployment,pods,services`

## 5. Configure Edge Stack

Along with the Deployment and Svc, there was a Mapping YAML file in the repo that ARgo also deployed

`kubectl get mapping`

Get IP of cluster: `kubectl -n ambassador get svc ambassador \
  -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}"`

Go to `http://<cluster IP>/quote/`

<Alert severity="success">
    <strong>Victory!</strong> You've deployed your first app using ArgoCD!
</Alert>


## 5. Change app config and resync

Go to your fork of the repo in GitHub, edit `\yaml\mapping.yaml`
This URL should take you straight there:
`https://github.com/<your github username>/argotest/edit/main/yaml/mapping.yaml`

Change `prefix:` from `/quote/` to `/coolquote/`, click **Commit changes** at the bottom

In Argo UI, on the app hit Sync

Once healthy again, go to `http://<cluster IP>/coolquote/`

Argo synced the YAML from your repo, saw the updated `mapping.yaml`, and redeployed the Mapping into the cluster.

<Alert severity="success">
    <strong>Victory!</strong> Using Argo CD you can redeploy changes to your app's manifests in one click, applying your desired state to the current live state. From a small, single service app like this one to an app with hundreds of services, Argo CD makes app deployments and lifecycle management way easier to manage.
</Alert>

## 6. Deploy app using the CLI

Delete the app we just made in the UI, click **Delete** button, this deletes the app from the UI and all the resources (the Pod and Svc) from the cluster

Now recreate it using only the CLI:
```
argocd app create --name qotd --repo https://github.com/mattmcclure-dw/argotest.git --dest-server https://kubernetes.default.svc --dest-namespace default --path yaml  && argocd app sync qotd
```

All the same options we set in the UI are in the single command.

Go to `http://<cluster IP>/coolquote/`

<Alert severity="success">
    <strong>Victory!</strong> Using Argo CD from the CLI is easy!
</Alert>

# What's Next?

* [Argo Rollouts Quick Start](/qs-rollouts)
* [How Do I > Rollouts w/ Ambassador Cloud](/howtos/rollouts)
* [Technical Ref > the Rollout CRD](/reference/rolloutscrd)