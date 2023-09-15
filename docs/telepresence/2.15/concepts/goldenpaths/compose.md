# Telepresence with Docker Compose Golden Path

## Why?

When adopting Telepresence, you may be hesitant to throw away all the investment you made replicating your infrastructure with
[Docker Compose](https://docs.docker.com/compose/).

Thankfully, it doesn't have to be this way, since you can associate the [Telepresence Specification](../specs)  with [Docker mode](../docker) to integrate your Docker Compose file.

## How?
Telepresence Intercept Specifications are integrated with Docker Compose! Let's look at an example to see how it works.

Below is an example of an Intercept Spec and Docker Compose file that is intercepting an echo service with a custom header and being handled by a service created through Docker Compose.

Intercept Spec:
```yaml
workloads:
  - name: echo
    intercepts:
      - handler: echo
        localport: 8080
        port: 80
        headers:
          - name: "{{ .Telepresence.Username }}"
            value: 1
handlers:
  - name: echo
    docker:
      compose:
        services:
          - name: echo
            behavior: interceptHandler
```

The Docker Compose file is creating two services, a postgres database, and your local echo service. The local echo service is utilizing Docker's [watch](https://docs.docker.com/compose/file-watch/) feature to take advantage of hot reloads.

Docker compose file:
```yaml
services:
  postgres:
    image: "postgres:14.1"
    ports:
      - "5432"
  echo:
    build: .
    ports:
      - "8080"
    x-develop:
      watch:
        - action: rebuild
          path: main.go
    environment:
      DATABASE_HOST: "localhost:5432"
      DATABASE_PASSWORD: postgres
      DEV_MODE: "true"
```

By combining Intercept Specifications and Docker Compose, you can intercept the traffic going to your cluster while developing on multiple local services and utilizing hot reloads.

## Key learnings

* Using **Docker Compose** with **Telepresence** allows you to have a **hybrid** development setup between local & remote.
* You can **reuse your existing setup** with minimum effort.
