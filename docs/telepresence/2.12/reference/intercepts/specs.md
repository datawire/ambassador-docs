# Configuring intercept using specifications

This page references the different options available to the telepresence intercept specification.

With telepresence, you can provide a file to define how an intercept should work.

## Specification

Your intercept specification is where you can create a standard, easy to use, configuration to easily run pre and post tasks, start an intercept, and start your local application to handle the intercepted traffic. 

There are many ways to configure your specification to suit your needs, the table below shows the possible options within your specifcation,
and you can see the spec's schema, with all available options and formats, [here](#ide-integration).

| Options                                   | Description                                                                                             |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [name](#name)                             | Name of the specification.                                                                              | 
| [connection](#connection)                 | Connection properties to use when Telepresence connects to the cluster.                                 |
| [handlers](#handlers)                     | Local processes to handle traffic and/or setup  .                                                       |
| [prerequisites](#prerequisites)           | Things to set up prior to starting any intercepts, and tear things down once the intercept is complete. | 
| [workloads](#workloads)                   | Remote workloads that are intercepted, keyed by workload name.                                          |

### Name
The name is optional. If you don't specify the name it will use the filename of the specification file.

```yaml
name : echo-server-spec
```

### Connection

The connection option is used to define how Telepresence connects to your cluster.

```yaml
connection:
  context: "shared-cluster"
  mappedNamespaces:
    - "my_app"
```

You can pass the most common parameters from telepresence connect command (`telepresence connect --help`) using a camel case format.

Some of the most commonly used options include:

| Options          | Type        | Format                  | Description                                             |
|------------------|-------------|-------------------------|---------------------------------------------------------|
| context          | string      | N/A                     | The kubernetes context to use                           |
| mappedNamespaces | string list | [a-z0-9][a-z0-9-]{1,62} | The namespaces that Telepresence will be concerned with |


### Handlers

A handler is code running locally.

It can receive traffic for an intercepted service, or can set up prerequisites to run before/after the intercept itself.

When it is intended as an intercept handler (i.e. to handle traffic), it's usually the service you're working on, or another dependency (database, another third party service, ...) running on your machine.
A handler can be a Docker container, or an application running natively. 

The sample below is creating an intercept handler, giving it the name `echo-server` and using a docker container. The container will
automatically have access to the ports, environment, and mounted directories of the intercepted container.

<Alert severity="warning">
  The <b>ports</b> field is important for the intercept handler while running in docker, it indicates which ports should be exposed to the host. If you want to access to it locally (to attach a debugger to your container for example), this field must be provided.
</Alert>

```yaml
handlers:
  - name: echo-server
    environment:
      - name: PORT
        value: "8080"
    docker:
      image: jmalloc/echo-server:latest
      ports:
        - 8080
```

If you don't want to use Docker containers, you can still configure your handlers to start via a regular script.
The snippet below shows how to create an handler called echo-server, that sets an environment variable of `PORT=8080`
and starts the application.


```yaml
handlers:
  - name: echo-server
    environment:
      - name: PORT
        value: "8080"
    script:
      run: bin/echo-server
```

Keep in mind that an empty handler is still a valid handler. This is sometimes useful when you want to, for example,
simulate an intercepted service going down:

```yaml
handlers:
  - name: no-op
```

The table belows defines the parameters that can be used within the handlers section.

| Options                | Type        | Format                   | Description                                                                  |
|------------------------|-------------|--------------------------|------------------------------------------------------------------------------|
| name                   | string      |  [a-zA-Z][a-zA-Z0-9_-]*  | Defines name of your handler that the intercepts use to reference it         |
| environment            | map list    |  N/A                     | Environment Defines environment variables within your handler                |
| environment[*].name    | string      |  [a-zA-Z_][a-zA-Z0-9_]*  | The name of the environment variable                                         |
| environment[*].value   | string      |  N/A                     | The value for the environment variable                                       |
| [script](#script)      | map         |  N/A                     | Tells the handler to run as a script, mutually exclusive to docker           |
| [docker](#docker)      | map         |  N/A                     | Tells the handler to run as a docker container, mutually exclusive to script |

#### Script

The handler's script element defines the parameters:

| Options | Type   | Format                 | Description                                                                                                                 |
|---------|--------|------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| run     | string | N/A                    | The script to run. Can be multi-line                                                                                        |
| shell   | string | bash&#124;sh&#124;sh | Shell that will parse and run the script. Can be bash, zsh, or sh. Defaults to the value of the`SHELL` environment variable |

#### Docker
The handler's docker element defines the parameters. The `build` and `image` parameters are mutually exclusive:

| Options         | Type        | Format | Description                                                                                                                          |
|-----------------|-------------|--------|--------------------------------------------------------------------------------------------------------------------------------------|
| [build](#build) | map         | N/A    | Defines how to build the image from source using [docker build](https://docs.docker.com/engine/reference/commandline/build/) command |
| image           | string      | image  | Defines which image to be used                                                                                                       |
| ports           | int list    | N/A    | The ports which should be exposed to the host                                                                                        |
| options         | string list | N/A    | Options for docker run [options](https://docs.docker.com/engine/reference/commandline/run/#options)                                  |
| command         | string      | N/A    | Optional command to run                                                                                                              |
| args            | string list | N/A    | Optional command arguments                                                                                                           |

#### Build

The docker build element defines the parameters:

| Options | Type        | Format | Description                                                                                |
|---------|-------------|--------|--------------------------------------------------------------------------------------------|
| context | string      | N/A    | Defines either a path to a directory containing a Dockerfile, or a url to a git repository |
| args    | string list | N/A    | Additional arguments for the docker build command.                                         |

For additional informations on these parameters, please check the docker [documentation](https://docs.docker.com/engine/reference/commandline/run).

### Prerequisites
When creating an intercept specification there is an option to include prerequisites. 

Prerequisites give you the ability to run scripts for setup, build binaries to run as your intercept handler, or many other use cases.

Prerequisites is an array, so it can handle many options prior to starting your intercept and running your intercept handlers.
The elements of the `prerequisites` array correspond to [`handlers`](#handlers).

The sample below is declaring that `build-binary` and `rm-binary` are two handlers; the first will be run before any intercepts,
the second will be run after cleaning up the intercepts.

If a prerequisite create succeeds, the corresponding delete is guaranteed to run even if the other steps in the spec fail.

```yaml
prerequisites:
  - create: build-binary
    delete: rm-binary
```


The table below defines the parameters availble within the prerequistes section.

| Options | Description                                       |
|---------|-------------------------------------------------- |
| create  | The name of a handler to run before the intercept |
| delete  | The name of a handler to run after the intercept  |


### Workloads

Workloads define the services in your cluster that will be intercepted.

The example below is creating an intercept on a service called `echo-server` on port 8080.
It creates a personal intercept with the header of `x-intercept-id: foo`, and routes its traffic to a handler called `echo-server`

```yaml
workloads:
  # You can define one or more workload(s)
  - name: echo-server:
    intercepts:
      # You can define one or more intercept(s)
      - headers: 
        - name: x-intercept-id
          value: foo
        port: 8080
        handler: echo-server
```

This table defines the parameters available within a workload.

| Options                   | Type                           | Format                  | Description                                                   | Default |
|---------------------------|--------------------------------|-------------------------|---------------------------------------------------------------|---------|
| name                      | string                         | [a-z][a-z0-9-]*         | Name of the workload to intercept                             | N/A     |
| namespace                 | string                         | [a-z0-9][a-z0-9-]{1,62} | Namespace of workload to intercept                            | N/A     |
| intercepts                | [intercept](#intercepts) list  |  N/A                    | The list of intercepts associated to the workload             | N/A     |

#### Intercepts
This table defines the parameters available for each intercept.

| Options             | Type                    | Format               | Description                                                           | Default        |
|---------------------|-------------------------|----------------------|-----------------------------------------------------------------------|----------------|
| enabled             | boolean                 | N/A                  | If set to false, disables this intercept.                             | true           |
| headers             | [header](#header) list  | N/A                  | Headers that will filter the intercept.                               | Auto generated |
| service             | name                    | [a-z][a-z0-9-]{1,62} | Name of service to intercept                                          | N/A            |
| localPort           | integersh&#124;string   | 0-65535              | The port for the service which is intercepted                         | N/A            |
| port                | integer                 | 0-65535              | The port the service in the cluster is running on                     | N/A            |
| pathPrefix          | string                  | N/A                  | Path prefix filter for the intercept. Defaults to "/"                 | /              |
| previewURL          | boolean                 | N/A                  | Determine if a preview url should be created                          | true           |
| banner              | boolean                 | N/A                  | Used in the preview url option, displays a banner on the preview page | true           |

##### Header

You can define headers to filter the requests which should end up on your machine when intercepting.

| Options                   | Type     | Format                  | Description                                                   | Default |
|---------------------------|----------|-------------------------|---------------------------------------------------------------|---------|
| name                      | string   | N/A                     | Name of the header                                            | N/A     |
| value                     | string   | N/A                     | Value of the header                                           | N/A     |

Telepresence specs also support dynamic headers with **variables**: 

```yaml
intercepts:
  - headers:
    - name: test-{{ .Telepresence.Username }}
      value: "{{ .Telepresence.Username }}"
```

| Options                   | Type     | Description                              |
|---------------------------|----------|------------------------------------------|
| Telepresence.Username     | string   | The name of the user running the spec    |


### Running your specification
After you've written your intercept specification you will want to run it.

To start your intercept, use this command:

```bash
telepresence intercept run <path/to/file>
```
This will validate and run your spec. In case you just want to validate it, you can do so by using this command:

```bash
telepresence intercept validate <path/to/file>
```

### Using and sharing your specification as a CRD

If you want to share specifications across your team or your organization. You can save specifications as CRDs inside your cluster.

<Alert severity="info">
  The Intercept Specification CRD requires Kubernetes 1.22 or higher, if you are using an old cluster you will
  need to install using helm directly, and use the --disable-openapi-validation flag
</Alert>

1. Install CRD object in your cluster (one time installation) :

  ```bash
  telepresence helm install --crds
  ```

1. Then you need to deploy the specification in your cluster as a CRD:

  ```yaml
  apiVersion: getambassador.io/v1alpha2
  kind: InterceptSpecification
  metadata:
    name: my-crd-spec
    namespace: my-crd-namespace
  spec:
    {intercept specification}
  ```

  So `echo-server` example looks like this:

  ```bash
  kubectl apply -f - <<EOF
  ---
  apiVersion: getambassador.io/v1alpha2
  kind: InterceptSpecification
  metadata:
    name: echo-server-spec
    namespace: my-crd-namespace
  spec:
    connection:
      context: "my-context"
    workloads:
      - name: echo-easy
        namespace: default
        intercepts:
          - headers:
              - name: test-{{ .Telepresence.Username }}
                value: "{{ .Telepresence.Username }}"
            localPort: 9090
            port: proxied
            handler: echo-easy
            service: echo-easy
            previewURL:
              enable: false
    handlers:
      - name: echo-easy
        environment:
          - name: PORT
            value: "9090"
        docker:
          image: jmalloc/echo-server
  EOF
  ```

  Then every person that is connected to the cluster can start your intercept by using this command:

  ```bash
  telepresence intercept run echo-server-spec
  ```

  You can also list available specifications:

  ```bash
  kubectl get ispecs
  ```

### Docker integration

Intercept specification can be used within the [docker extension](../../extension/intercept) if you are using a YAML file and a docker runtime as handlers.

### IDE Integration
You can integrate our JSON schemas into your IDE to give you autocompletion and hints while writing your intercept specification. There is two schemas available :

- [one for YAML specification](https://app.getambassador.io/yaml/telepresence/$docsVersion$/intercept-schema.yaml)
- [one for CRD specification](https://app.getambassador.io/yaml/telepresence/$docsVersion$/intercept-crd-schema.yaml)

To then add the schema to your IDE follow the instructions for you given IDE, a few popular our listed below:
[VSCode](https://code.visualstudio.com/docs/languages/json#_json-schemas-and-settings)
[GoLand](https://www.jetbrains.com/help/go/json.html#ws_json_using_schemas)
