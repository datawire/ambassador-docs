---
description: "Use Edge Stack and Argo to facilitate canary releases in your Kubernetes cluster."
---

import Alert from '@material-ui/lab/Alert';
import Tabs from './tabs'

# Argo Rollouts and Edge Stack Quick Start

This tutorial will walk you through the process of configuring Argo Rollouts to work with Edge Stack to facilitate canary releases. This will enable users to safely [rollout new versions](https://blog.getambassador.io/deploying-argo-rollouts-for-canary-releases-on-kubernetes-f5910ed1fd61) of services on Kubernetes. 

## 1. Install and configure Edge Stack

You'll need to first install Edge Stack in your cluster. Follow the [Edge Stack installation](../../tutorials/getting-started) to install Edge Stack via Kubernetes YAML, Helm, or the command-line installer in your cluster.

By default, Edge Stack routes via Kubernetes services. For best performance with canaries, we recommend you use endpoint routing. Enable endpoint routing on your cluster by saving the following configuration in a file called `resolver.yaml`:

```yaml
apiVersion: getambassador.io/v2
kind: KubernetesEndpointResolver
metadata:
  name: endpoint
```

Apply this configuration to your cluster:  
`kubectl apply -f resolver.yaml`

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

<Tabs/>

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
