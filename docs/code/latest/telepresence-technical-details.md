---
title: "Technical details for Telepresence"
description: "Start using Telepresence in your own environment. Follow these steps to intercept your service in your cluster."
---
# Telepresence technical details

### Which operating systems does Telepresence work on?

Telepresence currently works on macOS (Intel and Apple silicon), Linux, and WSL 2. Starting with v2.4.0, there will be a native Windows version of Telepresence that we are considering a Developer Preview.

### What protocols can be intercepted by Telepresence?

All HTTP/1.1 and HTTP/2 protocols can be intercepted. This includes:

- REST
- JSON/XML over HTTP
- gRPC
- GraphQL

If you need another protocol supported, please [drop us a line](https://www.getambassador.io/feedback/) to request it.

### When using Telepresence to intercept a pod, are the Kubernetes cluster environment variables proxied to my local machine?

Yes. You can either set the pod's environment variables on your machine or write the variables to a file to use with Docker or another build process. 

### When connected to a Kubernetes cluster through Telepresence, can I access cluster-based services via their DNS name?

Yes. After you have successfully connected to your cluster with `telepresence connect` you can access any service in your cluster through their namespace qualified DNS name.

This means you can curl endpoints directly with a command like `curl <my_service_name>.<my_service_namespace>:8080/mypath`.

If you create an intercept for a service in a namespace, you can use the service name directly. So, if you `telepresence intercept <my_service_name> -n <my_service_namespace>`, you can resolve just the `<my_service_name>` DNS record.

You can connect to databases or middleware running in the cluster, such as MySQL, PostgreSQL and RabbitMQ with their service name.

### When connected to a Kubernetes cluster via Telepresence, can you access cloud-based services and data stores through their DNS name?

You can connect to cloud-based data stores and services that are directly addressable within the cluster (like when you use an [ExternalName](https://kubernetes.io/docs/concepts/services-networking/service/#externalname) Service type), such as AWS RDS, Google pub-sub, or Azure SQL Database.


### Why does running Telepresence require sudo access for the local daemon?

The local daemon needs sudo to create iptable mappings. Telepresence uses this to create outbound access from the laptop to the cluster.

On Fedora, Telepresence also creates a virtual network device (a TUN network) for DNS routing. That also requires root access.

### What components get installed in the cluster when you run Telepresence?

A single `traffic-manager` service is deployed in the `ambassador` namespace within your cluster, and this manages resilient intercepts and connections between your local machine and the cluster.

A Traffic Agent container is injected per pod that is being intercepted. The first time a workload is intercepted all pods associated with this workload will be restarted with the Traffic Agent automatically injected.

### Can I remove all of the Telepresence components installed within my cluster?

You can run the command `telepresence uninstall --everything` to remove the `traffic-manager` service installed in the cluster and `traffic-agent` containers injected into each pod being intercepted.

This command also stops the local daemon running.

### What language is Telepresence written in?

All components of the Telepresence application and cluster components are written using Go.

### How does Telepresence connect and tunnel into the Kubernetes cluster?

The connection between your laptop and cluster is established with the `kubectl port-forward` machinery (though without actually spawning a separate program) to establish a TCP connection to Telepresence Traffic Manager in the cluster. Telepresence's custom VPN protocol runs over that TCP connection.

### What identity providers are supported for authenticating to view a preview URL?

* GitHub
* GitLab
* Google

More authentication mechanisms and identity provider support will be added soon. Please [let us know](https://www.getambassador.io/feedback/) which providers are the most important to you and your team in order for us to prioritize those.

### Is Telepresence open source?

Yes, yes it is! You can find its source code on [GitHub](https://github.com/telepresenceio/telepresence).

### How do I share my feedback on Telepresence?

Your feedback is always appreciated and helps us build a product that provides as much value as possible for our community. You can chat with us directly on our [feedback page](https://www.getambassador.io/feedback/), or you can [join our Slack channel](https://a8r.io/Slack) to share your thoughts.
