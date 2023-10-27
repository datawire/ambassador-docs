---
title: "Telepresence for Docker Compose"
description: "Learn about how to use Docker Compose with Telepresence"
indexable: true
---

# Telepresence for Docker Compose

The [Intercept Specification](../../reference/intercepts/specs) can contain an intercept handler that in turn references (or embeds) a [docker compose](../../reference/intercepts/specs#compose) specification. The docker compose services will then be used when handling the intercepted traffic.

The intended user for the docker compose integration runs an existing compose specification locally on a workstation but wants to try it out "in the cluster" by intercepting cluster services. This is challenging, because the cluster's network, the intercepted pod's environment and volume mounts, and which of the services in the compose file to actually redirect traffic to, are not known to docker compose. In fact, the environment and volume mounts are not known until the actual intercept is activated. Telepresence helps with all of this by using an ephemeral and modified copy of the compose file that it creates when the intercept starts. The modification steps are described below.

## Intended service behavior

The user starts by declaring how each service in the docker compose spec. are intended to behave. These intentions can be declared directly in the Intercept spec. so that the docker compose spec. is left untouched, or they can be added to the docker compose spec. in the form of `x-telepresence` extensions. This is explained ([in detail](../../reference/intercepts/specs#service)) in the reference.

The intended behavior can be one of `interceptHandler`, `remote`, or `local`, where `local` is the default that applies to all services that have no intended behavior specified.

### The interceptHandler behavior

A compose service intended to have the `interceptHandler` behavior will:

- handle traffic from the intercepted pod
- remotely mount the volumes of the intercepted pod
- have access to the environment variables of the intercepted pod

This means that Telepresence will:

- modify the `network-mode` of the compose service so that it shares the network of the containerized Telepresence daemon.
- modify the `environment` of the service to include the environment variables exposed by the intercepted pod.
- create volumes that correspond to the volumes of the intercepted pod and replace volumes on the compose service that have overlapping targets.
- delete any networks from the service and instead attach those networks to the daemon.
- delete any exposed ports and instead expose them using the `telepresence` network.

A docker compose service that originally looked like this:

```yaml
services:
  echo:
    environment:
      - PORT=8088
      - MODE=local
    build: .
    ports:
      - "8088:8088"
    volumes:
      - local-secrets:/var/run/secrets/kubernetes.io/serviceaccount:ro
    networks:
      - green
```

when acting as an `interceptHandler` for the `echo-server` service, will instead look something like this:

```yaml
services:
  echo:
    build: .
    environment:
      - A_TELEPRESENCE_MOUNTS=/var/run/secrets/kubernetes.io/serviceaccount
      # ... other environment variables from the pod left out for brevity.
      - PORT=8088
      - MODE=local
    network_mode: container:tp-minikube
    volumes:
      - echo-server-0:/var/run/secrets/kubernetes.io/serviceaccount
```

and Telepresence will also have added this to the compose file:

```yaml
volumes:
  echo-server-0:
    name: echo-server-0
    driver: datawire/telemount:amd64
    driver_opts:
      container: echo-server
      dir: /var/run/secrets/kubernetes.io/serviceaccount
      host: 192.168.208.2
      port: "34439"
```

### The remote behavior

A compose service intended to have the `remote` behavior will no longer run locally. Telepresence
will instead:

- Remove the service from the docker compose spec.
- Reassign any `depends_on` for that service to what the service in turn `depends_on`.
- Inform the containerized Telepresence daemon about the `mapping` that was declared in the service intent (if any).

### The local behavior

A compose service intended to have the `local` behavior is more or less left untouched. If it has `depends_on` to a
service intended to have `remote` behavior, then those are swapped out for the `depends_on` in that service. 

## Other modifications

### The telepresence network

The default network of the docker compose file will be replaced with the `telepresence` network. This network enables
port access on the local host.

```yaml
networks:
  default:
    name: telepresence
    external: true
  green:
    name: echo_green
```

### Auto-detection of watcher

Telepresence will check if the docker compose file contains a [watch](https://docs.docker.com/compose/file-watch/)
declaration for hot-deploy and start a `docker compose alpha watch` automatically when that is the case. This means that
an  intercept handler that is modified will be deployed instantly even though the code runs in a container and the
changes will be visible using a preview URL.
