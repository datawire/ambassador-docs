
import Alert from '@material-ui/lab/Alert';
import Tabs from './tabs'

# Argo Quick Start

<div class="docs-article-toc">
<h3>Contents</h3>

* [Prerequisites](#prerequisites)
* [1. Install and configure Edge Stack](#1-install-and-configure-edge-stack)
* [2. Install Argo](#2-install-argo)
* [3. Set up Argo](#3setup-argo)
* [4. Deploy the sample app](#4-deploy-the-sample-app)
* [5. Create the canary deployment](#5-create-the-canary-deployment)
* [6. Rollout a new version](#6-rollout-a-new-version)

</div>

Argo is an open source suite of projects that helps developers safely deploy code to production.

Within a GitOps context, Argo makes application deployment and lifecycle management easier, particularly as the line between developers and operators disappears, because it automates deployment, makes rollbacks easier and can be audited for easier troubleshooting.

For this guide, we will build a CD pipeline to deploy an app from a repo into a Kubernetes cluster, then perform a [canary release](../concepts/canary) on that app to test incrementally rolling out a new version.

Argo can use Kubernetes projects formatted using different templating systems (Helm, Kustomize, etc.) but for this app we're just going to deploy a folder of static YAML files.

# Prerequisites

* [Kubectl](https://kubernetes.io/docs/tasks/tools/) installed and configured to use a cluster
* a GitHub account

## 1. Install and configure Edge Stack

You'll first need to install Edge Stack in your cluster. Follow the [Edge Stack installation](../../../edge-stack/latest/tutorials/getting-started) to install via Kubernetes YAML, Helm, or the command-line installer in your cluster.

By default, Edge Stack routes via Kubernetes services. For best performance with canaries, we recommend you use [endpoint routing](../../../edge-stack/latest/topics/running/resolvers/). Enable endpoint routing on your cluster by saving the following configuration in a file called `resolver.yaml`:

```yaml
apiVersion: getambassador.io/v2
kind: KubernetesEndpointResolver
metadata:
  name: endpoint
```

Apply this configuration to your cluster:
`kubectl apply -f resolver.yaml`

## 2. Install Argo

First, if you're using Google Kubernetes Engine, grant your account the ability to create new Cluster Roles:

```
kubectl create clusterrolebinding YOURNAME-cluster-admin-binding --clusterrole=cluster-admin --user=YOUREMAIL@gmail.com
```

Run the following commands to create the namespaces required for Argo and install the components:
```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://raw.githubusercontent.com/datawire/argo-rollouts/ambassador/release/manifests/install.yaml
```

Next, you will need to install the Argo CD CLI (for building pipelines) and the Argo Rollouts plugin (for managing and visualizing rollouts) on your laptop:

<AppStateContext>
{state => {
  return (<CodeBlockMultiLang type="terminal" state={state}  data={
    {
      tabs: [
          {
            id: "macOS",
            display: "macOS",
            os:"macos",
            prompt: "",
            commands: [
              {
                input: "brew install argocd"
              },
              {
                input: "brew install argoproj/tap/kubectl-argo-rollouts",
                outputs: [
                  "# Need brew? https://brew.sh/"
                ]
              }
            ]
          },
          {
            id: "linux",
            display: "Linux",
            os:"linux",
            prompt: "",
            commands: [
              {
                 comments:[
                    "# Argo CD CLI"
                 ],
                input: "curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/download/v1.7.14/argocd-linux-amd64"
              },
              {
                comments:[],
                input: "chmod +x /usr/local/bin/argocd"
              },
              {
                 comments:[
                    "# Argo Rollouts plugin"
                 ],
                input: "sudo curl -fL https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64 -o /usr/local/bin/kubectl-argo-rollouts"
              },
              {
                comments:[],
                input: "sudo chmod a+x /usr/local/bin/kubectl-argo-rollouts"
              },
            ]
          }
        ]
    }} />)
}
}
</AppStateContext>

## 3. Set up Argo

First set up port forwarding to access the Argo API:
```
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

In a new terminal window, retrieve the default password (it is name of the Argo API server Pod):
```
kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o name | cut -d'/' -f 2
```

Authenticate against the API using the default username `admin` and password (answer `y` about the certificate error):
```
argocd login localhost:8080
```

Finally, set a new admin password:
```
argocd account update-password
```

## 4. Deploy the sample app

Argo can quickly create pipelines and deploy apps using the CLI tool.  

To start with, we'll deploy an app from the `echo` directory in [this repo](https://github.com/datawire/argo-qs.git). Later on in this guide however you will need to edit a part of the repo to perform a canary release, so [fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) this repo now into your own GitHub account.  **On the commands that reference the repo from here to the end of the guide you will need to edit the GitHub URL to include your own username.**

Now build the pipeline that deploys our app. The following command points Argo to the repo and specific path to the YAML files we want to deploy and sets the destination to the local cluster. Finally, it syncs the app, which is the action that actually deploys the manifests to the cluster.

```
argocd app create --name echo --repo https://github.com/<your Github username>/argo-qs.git --path echo --dest-server https://kubernetes.default.svc --dest-namespace default && argocd app sync echo
```

To access your deployed app, first get your load balancer IP:
```
export LOAD_BALANCER_IP=$(kubectl -n ambassador get svc ambassador -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
```

Now curl the service:

```
curl -Lk http://$LOAD_BALANCER_IP/echo/
```

You should get a reply saying `Successful Argo deployment!`

<Alert severity="success">
    <strong>Victory!</strong> You've deployed your first app using Argo!
</Alert>

## 5. Create the canary deployment

Next we'll start by removing the previously created app. This deletes all the Kubernetes resources from the cluster that Argo created.

```
argocd app delete echo
```

Now we'll deploy a slightly different version of the app from [here](https://github.com/datawire/argo-qs/tree/main/canary).  There is a new [Rollout file](https://github.com/datawire/argo-qs/blob/main/canary/rollout.yaml).  This is similar to a Deployment, but it adds a rollout strategy section that defines how the rollout will incrementally happen once started. In this case, it will route 30% of traffic to the new service for 30 seconds, followed by 60% of the traffic for another 30 seconds, then 100% of the traffic.

Deploy the app to your cluster (note the different value for `--path`):

```
argocd app create --name echo --repo https://github.com/<your Github username>/argo-qs.git --path canary --dest-server https://kubernetes.default.svc --dest-namespace default && argocd app sync echo
```

Curl again to test the app:
```
curl -Lk http://$LOAD_BALANCER_IP/echo/
```

You should get a response of `Canary v1`.

<Alert severity="success">
    <strong>Congratulations</strong>, you've deployed your first Rollout service successfully!
</Alert>

## 6. Rollout a new version

It's time to rollout a new version of the service. Edit the `rollout.yaml` file in your fork here: `https://github.com/<your GitHub username>/argo-qs/edit/main/canary/rollout.yaml` and change line 17 from `Canary v1` to `Canary v2`.  Then click **Commit changes** at the bottom.

Apply the rollout to the cluster.  Argo will 1) look at the repo for anything that's changed since the app was created 2) apply those changes (in this case, our update to the Rollout) and 3) begin rolling out a version 2 of the service based on the Rollout strategy.

```
argocd app sync echo
```

Verify that the canary is progressing appropriately by sending curl requests in a loop:

```
while true; do curl -k https://$LOAD_BALANCER_IP/echo/ ; sleep 0.2; done
```

This will display a running list of responses from the service that will gradually transition from `Canary v1` strings to `Canary v2` strings.

In a new terminal window, you can monitor the status of your rollout at the command line:

```
kubectl argo rollouts get rollout echo-rollout --watch
```

Will display an output similar to the following:

```
Name:            echo-rollout
Namespace:       default
Status:          ॥ Paused
Message:         CanaryPauseStep
Strategy:        Canary
  Step:          1/6
  SetWeight:     30
  ActualWeight:  30
Images:          hashicorp/http-echo (canary, stable)
Replicas:
  Desired:       1
  Current:       2
  Updated:       1
  Ready:         2
  Available:     2

NAME                                      KIND        STATUS        AGE    INFO
⟳ echo-rollout                            Rollout     ॥ Paused      2d21h
├──# revision:3
│  └──⧉ echo-rollout-64fb847897           ReplicaSet  ✔ Healthy     2s     canary
│     └──□ echo-rollout-64fb847897-49sg6  Pod         ✔ Running     2s     ready:1/1
├──# revision:2
│  └──⧉ echo-rollout-578bfdb4b8           ReplicaSet  ✔ Healthy     3h5m   stable
│     └──□ echo-rollout-578bfdb4b8-86z6n  Pod         ✔ Running     3h5m   ready:1/1
└──# revision:1
   └──⧉ echo-rollout-948d9c9f9            ReplicaSet  • ScaledDown  2d21h
```

<Alert severity="success">
    <strong>Victory!</strong> You've successfully integrated Argo Rollouts with Edge Stack!
</Alert>