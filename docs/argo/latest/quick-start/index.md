
import Alert from '@material-ui/lab/Alert';
import Tabs from './tabs'

# Argo Quick Start

<div class="docs-article-toc">
<h3>Contents</h3>

* [Prerequisites](#prerequisites)
* [Argo CD](#argo-cd)
* [Argo Rollouts](#argo-rollouts)
* [What's next?](#img-classos-logo-srcimageslogopng-whats-next)

</div>

(brief intro about Argo CD and Rollouts, what they do, the different dev problems they solve)

# Prerequisites

* [Kubectl](https://kubernetes.io/docs/tasks/tools/) 
* A cluster
* a GitHub account

## 1. Install and configure Edge Stack

You'll need to first install Edge Stack in your cluster. Follow the [Edge Stack installation](../../edge-stack/latest/tutorials/getting-started) to install Edge Stack via Kubernetes YAML, Helm, or the command-line installer in your cluster.

By default, Edge Stack routes via Kubernetes services. For best performance with canaries, we recommend you use [endpoint routing](../../../edge-stack/latest/topics/running/resolvers/). Enable endpoint routing on your cluster by saving the following configuration in a file called `resolver.yaml`:

```yaml
apiVersion: getambassador.io/v2
kind: KubernetesEndpointResolver
metadata:
  name: endpoint
```

Apply this configuration to your cluster:  
`kubectl apply -f resolver.yaml`

## 2. Install Argo in your cluster

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://raw.githubusercontent.com/datawire/argo-rollouts/ambassador/release/manifests/install.yaml
```

Now some tools to your laptop: the Argo CD CLI (for building pipelines) and the Argo Rollouts plugin (for managing and visualizing rollouts):

<Tabs/>

## 1. How to set up your source repos

Argo needs access to a repo with your k8s projects in order to deploy them into a cluster.

It reads your repo, parses out the projects and YAML manifests that are in the repo, then lets you choose from those projects to deploy into your cluster.  It supports different methods of creating templates for apps (Helm, Kustomize, etc.) but we'll just focus on repos with plain k8s YAML files.

If repo is public then you're good to go. Otherwise if it is private you can give Argo GitHub creds for access.
We'll use a public repo with a sample app for this guide.

First, fork the app into your own account so you can make changes to it later:
`https://github.com/mattmcclure-dw/argotest`



## 3. Set up Argo 

Setup port forwarding to access Argo server UI and API:
(ideally we use Edge Stack for ingress, I had trouble getting it working and skipped it for now so I wasn't blocked finishing this draft)
```
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Retrieve the default admin password, it is name of the Argo API server Pod:
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

<!--
## 4. Deploy sample app from repo

From UI, create new "Quote of the Moment" app
(this could change to be a different, more complex app later, I just chose something small to start with)

Application Name (this must be a valid DNS name): `qotm`

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
-->

## 5. Configure Edge Stack

Along with the Deployment and Svc, there was a Mapping YAML file in the repo that ARgo also deployed

`kubectl get mapping`

Get IP of cluster: `kubectl -n ambassador get svc ambassador \
  -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}"`

Go to `http://<cluster IP>/quote/`

<Alert severity="success">
    <strong>Victory!</strong> You've deployed your first app using ArgoCD!
</Alert>


## 6. Change app config and resync

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

## 7. Deploy app using the CLI

If you prefer the terminal over a web interface, Argo CD has a CLI tool that has much of the same functionality as the web version.

Install the CLI:


Delete the app we made earlier in the web UI, click **Delete** button, this deletes the app from the UI and all the resources (the Pod and Svc) from the cluster

Now recreate it using only the CLI:
```
argocd app create --name qotd --repo https://github.com/mattmcclure-dw/argotest.git --dest-server https://kubernetes.default.svc --dest-namespace default --path yaml  && argocd app sync qotd
```

All the same options we set in the UI are in the single command.

Go to `http://<cluster IP>/coolquote/`

<Alert severity="success">
    <strong>Victory!</strong> Using Argo CD from the CLI is easy!
</Alert>


# Argo Rollouts

This tutorial will walk you through the process of configuring Argo Rollouts to work with Edge Stack to facilitate canary releases. This will enable users to safely [rollout new versions](https://blog.getambassador.io/deploying-argo-rollouts-for-canary-releases-on-kubernetes-f5910ed1fd61) of services on Kubernetes. 

<!--
## 1. Install and configure Edge Stack

You'll need to first install Edge Stack in your cluster. Follow the [Edge Stack installation](../../edge-stack/latest/tutorials/getting-started) to install Edge Stack via Kubernetes YAML, Helm, or the command-line installer in your cluster.


By default, Edge Stack routes via Kubernetes services. For best performance with canaries, we recommend you use endpoint routing. Enable endpoint routing on your cluster by saving the following configuration in a file called `resolver.yaml`:

```yaml
apiVersion: getambassador.io/v2
kind: KubernetesEndpointResolver
metadata:
  name: endpoint
```

Apply this configuration to your cluster:  
`kubectl apply -f resolver.yaml`
-->
## 2. Install and configure Argo Rollouts

If you're using Google Kubernetes Engine, grant your account the ability to create new Cluster Roles:

```
kubectl create clusterrolebinding YOURNAME-cluster-admin-binding --clusterrole=cluster-admin --user=YOUREMAIL@gmail.com
```

Now, install the Argo Rollouts controller in your cluster that [supports Edge Stack](https://github.com/datawire/argo-rollouts/). Note that Argo must be installed in the `argo-rollouts` namespace.

```
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://raw.githubusercontent.com/datawire/argo-rollouts/ambassador/release/manifests/install.yaml
```

Finally, install the Argo `kubectl` plugin, which will let you manage and visualize rollouts from the command line.

<!--
<AppStateContext>
         {state => {
           return (<CodeBlockMultiLang state={state}  type="terminal" data={
             {
               tabs: [
                   {
                     id: "Linux",
                     display: "Linux",
                     os:"linux",
                     prompt: "$",
                     commands: [
                       {
                         input: [
                           "linux command",
                           "moar"
                         ]
                         outputs: [
                           "Linux output"
                         ]
                       }
                     ]
                   },
                   {
                     id: "macOS",
                     display: "macOS",
                     prompt: "$",
                     os:"macos",
                     commands: [
                       {
                         input: "brew install argocd",
                       }
                     ]
                   }
                 ]
             }} />)
         }
       }
</AppStateContext>
-->

Verify correct installation:

```
kubectl argo rollouts version
```

## 3. Create the Kubernetes Services

We'll create two Kubernetes services, named `echo-stable` and `echo-canary`. Save this configuration to the file `echo-service.yaml`.

```
apiVersion: v1
kind: Service
metadata:
  labels:
    app: echo
  name: echo-stable
spec:
  type: ClusterIP
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 8080
  selector:
    app: echo
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: echo
  name: echo-canary
spec:
  type: ClusterIP
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 8080
  selector:
    app: echo 
```

We'll also create an Edge Stack route to the services. Save the following configuration to a file called `echo-mapping.yaml`.

```
apiVersion: getambassador.io/v2
kind:  Mapping
metadata:
  name:  echo
spec:
  prefix: /echo
  rewrite: /echo
  service: echo-stable:80
  resolver: endpoint
```

Apply both of these configurations to the Kubernetes cluster:

```
kubectl apply -f echo-service.yaml
kubectl apply -f echo-mapping.yaml
```

## 4. Deploy the Echo Service

Argo Rollouts is orchestrated via the Rollouts resource. A Rollout resource is an alternative to the standard Kubernetes Deployment resource, and adds the ability to manage the process by which your service is deployed.

Create a Rollout resource and save it to a file called `rollout.yaml`. Note the `trafficRouting` attribute, which tells Argo to use Edge Stack for routing.

```
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: echo-rollout
spec:
  selector:
    matchLabels:
      app: echo
  template:
    metadata:
      labels:
        app: echo
    spec:
      containers:
        - image: hashicorp/http-echo
          args:
            - "-text=VERSION 1"
            - -listen=:8080
          imagePullPolicy: Always
          name: echo-v1
          ports:
            - containerPort: 8080
  strategy:
    canary:
      stableService: echo-stable
      canaryService: echo-canary
      trafficRouting:
        ambassador:
          mappings:
            - echo
      steps:
      - setWeight: 30
      - pause: {duration: 30s}
      - setWeight: 60
      - pause: {duration: 30s}
      - setWeight: 100
      - pause: {duration: 10}
```

Apply the rollout to your cluster `kubectl apply -f rollout.yaml`. Note that no canary rollout will occur, as this is the first version of the service being deployed. 

## 5. Test the service

We'll now test that this rollout works as expected.  Open a new terminal window. We'll use this window to send requests to the cluster. Get the external IP address for Edge Stack:

```
export AMBASSADOR_LB_ENDPOINT=$(kubectl -n ambassador get svc ambassador -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")
```

Send a request to the `echo` service:  

```
curl -Lk "https://$AMBASSADOR_LB_ENDPOINT/echo/"
```

You should get a response of "VERSION 1".

<Alert severity="success">
    <strong>Congratulations</strong>, you've deployed your first Rollout service successfully!
</Alert>

## 6. Rollout a new version 

It's time to rollout a new version of the service. Update the echo container in the `rollout.yaml` to display "VERSION 2":

```
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: echo-rollout
spec:
  selector:
    matchLabels:
      app: echo
  template:
    metadata:
      labels:
        app: echo
    spec:
      containers:
        - image: hashicorp/http-echo
          args:
            - "-text=VERSION 2"
            - -listen=:8080
          imagePullPolicy: Always
          name: echo-v1
          ports:
            - containerPort: 8080
  strategy:
    canary:
      stableService: echo-stable
      canaryService: echo-canary
      trafficRouting:
        ambassador:
          mappings:
            - echo
      steps:
      - setWeight: 30
      - pause: {duration: 30s}
      - setWeight: 60
      - pause: {duration: 30s}
      - setWeight: 100
      - pause: {duration: 10}
```

Apply the rollout to the cluster by typing `kubectl apply -f rollout.yaml`. This will rollout a version 2 of the service by routing 30% of traffic to the service for 30 seconds, followed by 60% of traffic for another 30 seconds.

You can monitor the status of your rollout at the command line:

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

In your other terminal window, you can verify that the canary is progressing appropriately by sending requests in a loop:

```
while true; do curl -k https://$AMBASSADOR_LB_ENDPOINT/echo/; sleep 0.2; done
```

This will display a running list of responses from the service that will gradually transition from VERSION 1 strings to VERSION 2 strings.

<Alert severity="success">
    <strong>Victory!</strong> You've successfully integrated Argo Rollouts with Edge Stack!
</Alert>

# <img class="os-logo" src="../../images/logo.png"/> What's Next?

* [How Do I > Rollouts w/ Ambassador Cloud](../howtos/canary)
* [Technical Ref > the Rollout CRD](../reference/rolloutcrd)