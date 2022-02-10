---
title: "Basic commands in Telepresence"
description: "Simple commands for your Telepresence service."
---

# Telepresence basic commands

Once you've installed [Telepresence](../install-and-update-telepresence), take a moment to familiarize yourself with these basic Telepresence commands.

## Connect to Telepresence

To connect to your cluster, enter `telepresence connect` in your terminal. Then  connect to the Kubernetes API server:
   ```console
   $ curl -ik https://kubernetes.default
   HTTP/1.1 401 Unauthorized
   Cache-Control: no-cache, private
   Content-Type: application/json
   ...

   ```
<Alert>
 When you first connect, The 401 response is expected when you first connect. This occurs upon initial connection because you are sending a request to the Kubernetes API server inside the cluster, so it returns a 401 since it doesn't know who you, as a user, are. After you've deployed the services and to curl them the API server, this error will go away.
</Alert>

## View your services in Ambassador Cloud
   
After you connect to your cluster, enter `telepresence login` to launch Ambassador Cloud in your browser.


## View existing service

Enter `telepresence list` and Telepresence populates a list of the services available to intercept:

```console
$ telepresence list
   ...
   example-service: ready to intercept (traffic-agent not yet installed)
   ...
```

## Get the name of the port you want to intercept on your service

Enter `kubectl get service <service name> --output yaml` to retrieve the port of your desired service.

```console
$ kubectl get service example-service --output yaml
   ...
ports:
   - name: http
   port: 80
   protocol: TCP
   targetPort: http
   ...
```
