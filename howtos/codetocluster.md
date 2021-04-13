import Alert from '@material-ui/lab/Alert';

# Get code running on my cluster

<div class="docs-article-toc">
<h3>Contents</h3>

* [Prerequisites](#prerequisites)
* [1. Install ingress controller](#1-install-ingress-controller)
* [2. Bulletin board web app](#2-bulletin-board-web-app)
* [3. Build container and test](#3-build-container-and-test)
* [4. Push to Docker Hub](#4-push-to-docker-hub)
* [5. Create a Deployment, Service, and Mapping in Kubernetes](#5-create-a-deployment-service-and-mapping-in-kubernetes)
* [6. Deploy app and test](#6-deploy-app-and-test)
* [What's next?](#img-classos-logo-srcimageslogopng-whats-next)

</div>

This guide will walk you through going from code to building a Docker container to running that container in a Kubernetes cluster.

## Prerequisites

* [Kubectl](../howtos/howtos/devenv/#kubectl)
* a Kubernetes cluster <!--([minikube](../howtos/howtos/devenv/#minikube) would work if you don't have access to a real cluster)-->
* [Docker](https://docs.docker.com/get-docker/) and a basic knowledge of running and building containers
* A Docker Hub account ([sign up](https://hub.docker.com) if you don't have one]

## 1. Install ingress controller

We'll need an ingress controller for your cluster to get traffic from the internet to your app.  We'll use the Ambassador Edge Stack for this. [Follow step one on this page](https://www.getambassador.io/docs/edge-stack/latest/tutorials/getting-started/) to install Edge Stack.

Now that your cluster is ready to go, let's check out the app we're going to use.

## 2. Bulletin board web app

We're going to use a sample web app provided by Docker: a bulletin board written using Node.js.  The repo contains the app's code and a Dockerfile for building a container.

Start by cloning the repo and switching into the directory containing the Dockerfile.

```
git clone https://github.com/dockersamples/node-bulletin-board.git
cd node-bulletin-board/bulletin-board-app
```

Open and inspect the Dockerfile. It follows these basic steps:

* use the latest Node.js slim base image
* install dependencies using npm
* expose port 8080 on the container
* start the Node.js server using npm

## 3. Build container and test

Next, we'll build the container and start running it locally, to make sure everything works and see what the app looks like.  Run the commands to build and run the container, substituting in your Docker Hub username:

```
docker build . -t <your docker hub username>/nodebb:1.0
docker run -d -p 80:8080 --name nodebb <your Docker Hub username>/nodebb:1.0
```

Let's look at the flags on the `docker run` command:

* `-d` runs in detached mode, runs in the background after starting 
* `-p` sets a `localhost` port to map to a container port, in this case `localhost:80` will map to 8080 on the container
* `--name` sets the name of the running container
* `<your Docker Hub username>/nodebb:1.0` is the built image that the container will run

Go to `http://localhost` to see the web app in action.

<Alert severity="success">
<strong>Success!</strong> The container is built and running locally!
</Alert>

Let's stop and remove the container before moving on:

```
docker stop nodebb
docker rm nodebb
```

## 4. Push to Docker Hub

To deploy the app to your cluster, Kubernetes must be able to pull the image from a repository.  In this case, we are using Docker Hub.  First, you must log in to Docker Hub on the Docker CLI to authorize it to push to your account:

`docker login`

Login to your account as prompted.  

Next, push the `nodebb` image to Docker Hub:

`docker push <your Docker Hub username>/nodebb:1.0`

When it finishes go to [Docker Hub](https://hub.docker.com/) and you should see your image as a public repository

## 5. Create a Deployment, Service, and Mapping in Kubernetes

Save this file as `nodebb.yaml`, replacing the values for Docker Hub username and your name.  This manifest file first creates a Deployment, which defines and runs the Pod.  Pods in Kubernetes are usually made up of a single container, in this case, the `nodebb` container you pushed to Docker Hub. [Learn more about the basics of Kubernetes](../concepts/basics)

Next, it creates a Service, which handles getting the traffic on the specified port to the Pod.

Finally, it creates a [Mapping](https://www.getambassador.io/docs/edge-stack/latest/topics/using/intro-mappings/#introduction-to-the-mapping-resource), which is used by Edge Stack to expose a Service to the internet at a specific URL prefix, `/` in this case (as in the root of your hostname or IP address, like `http://google.com/` or `http://1.2.3.4/`)

```
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodebb-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nodebb
  template:
    metadata:
      labels:
        app: nodebb
    spec:
      containers:
      - name: backend
        image: docker.io/<your Docker Hub username>/nodebb:1.0
        ports:
        - name: http
          containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: nodebb-service
spec:
  ports:
  - name: http
    port: 80
    targetPort: 8080
  selector:
    app: nodebb
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: nodebb-mapping
spec:
  prefix: /
  service: nodebb-service

```

Compare the Deployment and Service to our previous `docker run` command.  You should see things that look familiar, like the image repository, name, and tag, and the port on the container being mapped to a port on the host.

Also, notice how certain values match across the different resources?  For example, the Deployment's `spec.template.metadata.labels` value and the Service's `spec.selector` value match.  This is essential to connect these different cluster resources together so that the Services knows what Deployment to send the traffic to.

## 6. Deploy app and test

Deploy the YAML file with `kubectl apply -f nodebb.yaml`.

Get IP of the your ingress controller that you installed at the beginning of this guide:

```
kubectl -n ambassador get svc ambassador \
-o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}"
```

Finally, go to `http://<load balancer IP>/` and you should see your app.

<Alert severity="success">
<strong>Victory!</strong> You went from code to a web app running in Kubernetes!
</Alert>

## <img class="os-logo" src="../../../../../images/logo.png"/> What's Next?

YAML files used to deploy Kubernetes resources are generally kept under version control.  You can automate deploying and updating resources as changes are committed to your code repositories using a CI/CD system like Argo!  [Check out our guide on getting started with Argo](https://www.getambassador.io/docs/argo/latest/quick-start/).

Debugging services running on Kubernetes can be a frustrating process, make it easier and faster [using Telepresence](https://www.getambassador.io/docs/telepresence/latest/quick-start/)!