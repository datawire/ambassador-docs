# Intercept Specification Golden Path

## Why? 

Telepresence can be difficult to adopt Organization-wide. Each developer has their own local setup and adds many variables to running Telepresence, duplicating work amongst developers.

For these reasons, and many others we recommend using [Intercept Specifications](../../../reference/intercepts/specs).

## How?

When using an Intercept Specification you write a YAML file, similar to a CI workflow, or a Docker compose file. An Intercept Specification enables you to standardization amongst your developers.

With a spec you will be able to define the kubernetes context to work in, the workload you want to intercept, the local intercept handler your traffic will be flowing to, and any pre/post requisties that are required to run your applications.

Lets look at an example:

I have a service `quote` running in the `default` namespace I want to intercept to test changes I've made before opening a Pull Request.

I can use the Intercept Specification below to tell Telepresence to Intercept the quote serivce with a [Personal Intercept](../../../reference/intercepts#personal-intercept), in the default namespace of my cluster `test-cluster`. I also want to start the Intercept Handler, as a Docker container, with the provided image.

```yaml
---
connection:
  context: test-cluster
workloads:
  - name: quote
    namespace: default
    intercepts:
      - headers:
          - name: test-{{ .Telepresence.Username }}
            value: "{{ .Telepresence.Username }}"
        localPort: 8080
        mountPoint: "false"
        port: 80
        handler: quote
        service: quote
        previewURL:
          enable: true
handlers:
  - name: quote
    environment:
      - name: PORT
        value: "8080"
    docker:
      image: docker.io/datawire/quote:0.5.0
```

You can then run this Intercept Specification with:

```cli
telepresence intercept run quote-spec.yaml
   Intercept name         : quote-default
   State                  : ACTIVE
   Workload kind          : Deployment
   Destination            : 127.0.0.1:8080
   Service Port Identifier: http
   Intercepting           : HTTP requests with headers
         'test-user =~ user'
   Preview URL            : https://charming-newton-3109.preview.edgestack.me
   Layer 5 Hostname       : quote.default.svc.cluster.local
Intercept spec "quote-spec" started successfully, use ctrl-c to cancel.
2023/04/12 16:05:00 CONSUL_IP environment variable not found, continuing without Consul registration
2023/04/12 16:05:00 listening on :8080
```

You can see that the Intercept was started, and if I check the local docker containers I can see that the Telepresence daemon is running in a container, and your Intercept Handler was successfully started.

```cli
docker ps

CONTAINER ID   IMAGE                          COMMAND                  CREATED         STATUS         PORTS                        NAMES
bdd99d244fbb   datawire/quote:0.5.0           "/bin/qotm"              2 minutes ago   Up 2 minutes                                tp-quote
5966d7099adf   datawire/telepresence:2.12.1   "telepresence connec…"   2 minutes ago   Up 2 minutes   127.0.0.1:58443->58443/tcp   tp-test-cluster
```

## Key Learnings

* Using Intercept Specification enables you to create a standardized approach for Intercepts across your Organization in an easy to share way.
* You can easily leverage Docker to remove other potential hiccups associated with networking.
* There are many more great things you can do with an Intercept Specification, check those out [here](../../../reference/intercepts/specs)