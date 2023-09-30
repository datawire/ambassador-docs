---
description: "Start using Telepresence in your own environment. Follow these steps to intercept your service in your cluster."
---

import Alert from '@material-ui/lab/Alert';
import Platform from '@src/components/Platform';
import QSCards from '../quick-start/qs-cards'

# Intercept a service in your own environment

<div class="docs-article-toc">
<h3>Contents</h3>

* [Prerequisites](#prerequisites)
* [1. Install the Telepresence CLI](#1-install-the-telepresence-cli)
* [2. Test Telepresence](#2-test-telepresence)
* [3. Intercept your service](#3-intercept-your-service)
* [4. Create a preview URL to only intercept certain requests to your service](#4-create-a-preview-url-to-only-intercept-certain-requests-to-your-service)
* [What's next?](#img-classos-logo-srcimageslogopng-whats-next)

</div>

<Alert severity="info">For a detailed walk-though on creating intercepts using our sample app, follow the <a href="../../quick-start/demo-node/">quick start guide</a>.</Alert>

## Prerequisites
You’ll need [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/) or `oc` installed
and set up
([Linux](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/#verify-kubectl-configuration) /
 [macOS](https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/#verify-kubectl-configuration) /
 [Windows](https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/#verify-kubectl-configuration))
to use a Kubernetes cluster, preferably an empty test cluster.  This
document uses `kubectl` in all example commands, but OpenShift
users should have no problem substituting in the `oc` command instead.

If you have used Telepresence previously, please first reset your Telepresence deployment with:
`telepresence uninstall --everything`.

This guide assumes you have a Kubernetes deployment and service accessible publicly by an ingress controller and that you can run a copy of that service on your laptop.

## 1. Install the Telepresence CLI

<Platform.TabGroup>
<Platform.MacOSTab>

```shell
# Install via brew:
brew install datawire/blackbird/telepresence

# OR install manually:
# 1. Download the latest binary (~60 MB):
sudo curl -fL https://app.getambassador.io/download/tel2/darwin/amd64/$dlVersion$/telepresence -o /usr/local/bin/telepresence

# 2. Make the binary executable:
sudo chmod a+x /usr/local/bin/telepresence
```

</Platform.MacOSTab>
<Platform.GNULinuxTab>

```shell
# 1. Download the latest binary (~50 MB):
sudo curl -fL https://app.getambassador.io/download/tel2/linux/amd64/$dlVersion$/telepresence -o /usr/local/bin/telepresence

# 2. Make the binary executable:
sudo chmod a+x /usr/local/bin/telepresence
```

</Platform.GNULinuxTab>
</Platform.TabGroup>

## 2. Test Telepresence

Telepresence connects your local workstation to a remote Kubernetes cluster.

1. Connect to the cluster:
   `telepresence connect`

  ```
  $ telepresence connect

    Launching Telepresence Daemon
    ...
    Connected to context default (https://<cluster public IP>)
  ```

  <Alert severity="info">
    macOS users: If you receive an error when running Telepresence that the developer cannot be verified, open
    <br />
    <strong>System Preferences → Security & Privacy → General</strong>.
    <br />
    Click <strong>Open Anyway</strong> at the bottom to bypass the security block. Then retry the <code>telepresence connect</code> command.
  </Alert>

2. Test that Telepresence is working properly by connecting to the Kubernetes API server:
   `curl -ik https://kubernetes.default`

  <Alert severity="info">
    <strong>Didn't work?</strong> Make sure you are using Telepresence 2.0.3 or greater, check with <code>telepresence version</code> and upgrade <a href="../../install/upgrade/">here</a> if needed.
  </Alert>

  ```
  $ curl -ik https://kubernetes.default

    HTTP/1.1 401 Unauthorized
    Cache-Control: no-cache, private
    Content-Type: application/json
    ...

  ```
<Alert severity="info">
    The 401 response is expected.  What's important is that you were able to contact the API.
</Alert>

<Alert severity="success">
    <strong>Congratulations!</strong> You’ve just accessed your remote Kubernetes API server as if you were on the same network! With Telepresence, you’re able to use any tool that you have locally to connect to any service in the cluster.
</Alert>

## 3. Intercept your service

In this section, we will go through the steps required for you to intercept all traffic going to a service in your cluster and route it to your local environment instead.

1. List the services that you can intercept with `telepresence list` and make sure the one you want to intercept is listed.

    For example, this would confirm that `example-service` can be intercepted by Telepresence:
    ```
    $ telepresence list

    ...
    example-service: ready to intercept (traffic-agent not yet installed)
    ...
    ```

2. Get the name of the port you want to intercept on your service:
  `kubectl get service <service name> --output yaml`.

    For example, this would show that the port `80` is named `http` in the `example-service`:

    ```
    $ kubectl get service example-service --output yaml

    ...
      ports:
      - name: http
        port: 80
        protocol: TCP
        targetPort: http
    ...
    ```

3. Intercept all traffic going to the service in your cluster:
    `telepresence intercept <service-name> --port <local-port>[:<remote-port>] --env-file <path-to-env-file>`.

   - For the `--port` argument, specify the port on which your local instance of your service will be running.
     - If the service you are intercepting exposes more than one port, specify the one you want to intercept after a colon.
   - For the `--env-file` argument, specify the path to a file on which Telepresence should write the environment variables that your service is currently running with. This is going to be useful as we start our service.

   For the example below, Telepresence will intercept traffic going to service `example-service` so that requests reaching it on port `http` in the cluster get routed to `8080` on the workstation and write the environment variables of the service to `~/example-service-intercept.env`.

   ```
   $ telepresence intercept example-service --port 8080:http --env-file ~/example-service-intercept.env

     Using Deployment example-service
     intercepted
         Intercept name: example-service
         State         : ACTIVE
         Workload kind : Deployment
         Destination   : 127.0.0.1:8080
         Intercepting  : all TCP connections
   ```

4. Start your local environment using the environment variables retrieved in the previous step.<a name="start-local-instance"></a>

  Here are a few options to pass the environment variables to your local process:
   - with `docker run`, provide the path to the file using the [`--env-file` argument](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)
   - with JetBrains IDE (IntelliJ, WebStorm, PyCharm, GoLand, etc.) use the [EnvFile plugin](https://plugins.jetbrains.com/plugin/7861-envfile)
   - with Visual Studio Code, specify the path to the environment variables file in the `envFile` field of your configuration

5. Query the environment in which you intercepted a service the way you usually would and see your local instance being invoked.

  <Alert severity="info">
      <strong>Didn't work?</strong> Make sure the port you're listening on matches the one specified when   creating your intercept.
  </Alert>

<Alert severity="success">
    <strong>Congratulations!</strong> All the traffic usually going to your Kubernetes Service is now being routed to your local environment!
</Alert>

You can now:
- Make changes on the fly and see them reflected when interacting with your Kubernetes environment.
- Query services only exposed in your cluster's network.
- Set breakpoints in your IDE to investigate bugs.

## 4. Create a preview URL to only intercept certain requests to your service

When working on a development environment with multiple engineers, you
don't want your intercepts to impact your teammates.  If you are
[logged in](../../reference/client/login/), then when creating an
intercept, by default Telpresence will automatically talk to
Ambassador Cloud to generate a preview URL.  By doing so, Telepresence
can route only the requests coming from that preview URL to your local
environment; the rest will be routed to your cluster as usual.

1. Clean up your previous intercept by removing it:
`telepresence leave <service name>`

2. Log in to Ambassador Cloud, a web interface for managing and
   sharing preview URLs:

   ```console
   $ telepresence login
   Launching browser authentication flow...
   <web browser opens, log in and choose your organization>
   Login successful.
   ```

   If you are in an environment where Telepresence cannot launch a
   local browser for you to interact with, you will need to pass the
   [`--apikey` flag to `telepresence
   login`](../../reference/client/login/).

3. Start the intercept again:
`telepresence intercept <service-name> --port <local-port>[:<remote-port>] --env-file <path-to-env-file>`

   You will be asked for the following information:
   1. **Ingress layer 3 address**: This would usually be the internal address of your ingress controller in the format `<service name>.namespace`. For example, if you have a service `ambassador-edge-stack` in the `ambassador` namespace, you would enter `ambassador-edge-stack.ambassador`.
   2. **Ingress port**: The port on which your ingress controller is listening (often 80 for non-TLS and 443 for TLS).
   3. **Ingress TLS encryption**: Whether the ingress controller is expecting TLS communication on the specified port.
   4. **Ingress layer 5 hostname**: If your ingress controller routes traffic based on a domain name (often using the `Host` HTTP header), this is the value you would need to enter here.

    <Alert severity="info">
        Telepresence supports any ingress controller, not just <a href="https://www.getambassador.io/docs/edge-stack/latest/tutorials/getting-started/">Ambassador Edge Stack</a>.
    </Alert>

   For the example below, you will create a preview URL that will send traffic to the `ambassador` service in the `ambassador` namespace on port `443` using TLS encryption and setting the `Host` HTTP header to `dev-environment.edgestack.me`:

   ```
   $ telepresence intercept example-service --port 8080:http --env-file ~/example-service-intercept.env

     To create a preview URL, telepresence needs to know how cluster
     ingress works for this service.  Please Confirm the ingress to use.

     1/4: What's your ingress' layer 3 (IP) address?
          You may use an IP address or a DNS name (this is usually a
          "service.namespace" DNS name).

            [default: -]: ambassador.ambassador

     2/4: What's your ingress' layer 4 address (TCP port number)?

            [default: -]: 443

     3/4: Does that TCP port on your ingress use TLS (as opposed to cleartext)?

            [default: n]: y

     4/4: If required by your ingress, specify a different layer 5 hostname
          (TLS-SNI, HTTP "Host" header) to access this service.

            [default: ambassador.ambassador]: dev-environment.edgestack.me

     Using Deployment example-service
     intercepted
         Intercept name         : example-service
         State                  : ACTIVE
         Workload kind          : Deployment
         Destination            : 127.0.0.1:8080
         Service Port Identifier: http
         Intercepting           : HTTP requests that match all of:
           header("x-telepresence-intercept-id") ~= regexp("<intercept id>:example-service")
         Preview URL            : https://<random domain name>.preview.edgestack.me
         Layer 5 Hostname       : dev-environment.edgestack.me
   ```

4. Start your local service as <a href="#start-local-instance">in the previous step</a>.

5. Go to the preview URL printed after doing the intercept and see that your local service is processing the request.

    <Alert severity="info">
    <strong>Didn't work?</strong> It might be because you have services in between your ingress controller and the service you are intercepting that do not propagate the <code>x-telepresence-intercept-id</code> HTTP Header. Read more on <a href="../../concepts/context-prop">context propagation</a>.
    </Alert>

6. Make a request on the URL you would usually query for that environment.  The request should not be routed to your laptop.

   Normal traffic coming into the cluster through the Ingress (i.e. not coming from the preview URL) will route to services in the cluster like normal.

<Alert severity="success">
    <strong>Congratulations!</strong> You have now only intercepted traffic coming from your preview URL, without impacting your teammates.
</Alert>

You can now:
- Make changes on the fly and see them reflected when interacting with your Kubernetes environment.
- Query services only exposed in your cluster's network.
- Set breakpoints in your IDE to investigate bugs.

...and all of this <strong>without impacting your teammates!</strong>
## <img class="os-logo" src="../../images/logo.png"/> What's Next?

<QSCards/>
