> **Developer Portal API visualization is now available in Ambassador Cloud. These docs will remain as a historical reference for hosted Developer Portal installations. [Go to the quick start guide](/docs/cloud/latest/visualize-api/quick-start/).**

# Developer Portal

## Rendering API documentation

The _Dev Portal_ uses the `Mapping` resource to automatically discover services known by
the Ambassador Edge Stack.

For each `Mapping`, the _Dev Portal_ will attempt to fetch an OpenAPI V3 document
when a `docs` attribute is specified.

### `docs` attribute in `Mapping`s

This documentation endpoint is defined by the optional `docs` attribute in the `Mapping`.

```yaml
  docs:
    path: "string"          # optional; default is ""
    url: "string"           # optional; default is ""
    ignored: bool           # optional; default is false
    display_name: "string"  # optional; default is ""
```

where:

* `path`: path for the OpenAPI V3 document.
The Ambassador Edge Stack will append the value of `docs.path` to the `prefix`
in the `Mapping` so it will be able to use Envoy's routing capabilities for
fetching the documentation from the upstream service . You will need to update
your microservice to return a Swagger or OAPI document at this URL.
* `url`:  absolute URL to an OpenAPI V3 document.
* `ignored`: ignore this `Mapping` for documenting services. Note that the service
will appear in the _Dev Portal_ anyway if another, non-ignored `Mapping` exists
for the same service.
* `display_name`: custom name to show for this service in the devportal.

> Note:
>
> Previous versions of the _Dev Portal_ tried to obtain documentation automatically
> from `/.ambassador-internal/openapi-docs` by default, while the current version
> will not try to obtain documentation unless a `docs` attribute is specified.
> Users should set `docs.path` to `/.ambassador-internal/openapi-docs` in their `Mapping`s
> in order to keep the previous behavior.
>
>
> The `docs` field of Mappings was not introduced until `Ambassador Edge Stack` version 1.9 because Ambassador was automatically searching for docs on `/.ambassador-internal/openapi-docs`
> Make sure to update your CRDs with the following command if you are encountering problems after upgrading from an earlier version of Ambassador.
```yaml
 `kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes-crds.yaml`
```

> If you are on an earlier version of Ambassador, either upgrade to a newer version, or make your documentation available on `/.ambassador-internal/openapi-docs`.

Example:

With the `Mapping`s below, the _Dev Portal_ would fetch OpenAPI documentation
from `service-a:5000` at the path `/srv/openapi/` and from `httpbin` from an
external URL. `service-b` would have no documentation.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  service-a
spec:
  prefix: /service-a/
  rewrite: /srv/
  service: service-a:5000
  docs:
    path: /openapi/            ## docs will be obtained from `/srv/openapi/`
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  service-b
spec:
  prefix: /service-b/
  service: service-b           ## no `docs` attribute, so service-b will not be documented
---
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: regular-httpbin
spec:
  hostname: "*"
  host_rewrite: httpbin.org
  prefix: /httpbin/
  service: httpbin.org
  docs:
    url: https://httpbin.org/spec.json
```

> Notes on access to documentation `path`s:
>
> By default, all the `path`s where documentation has been found will **NOT** be publicly
> exposed by the Ambassador Edge Stack. This is controlled by a special
> `FilterPolicy` installed internally.

> Limitations on Mappings with a `host` attribute
>
> The Dev Portal will ignore `Mapping`s that contain `host`s that cannot be
> parsed as a valid hostname, or use a regular expression (when `host_regex: true`).

### Publishing the documentation

All rendered API documentation is published at the `/docs/` URL by default. Users can
achieve a higher level of customization by creating a `DevPortal` resource.
`DevPortal` resources allow the customization of:

- _what_ documentation is published
- _how_ it looks

Users can create a `DevPortal` resource for specifying the default configuration for
the _Dev Portal_, filtering `Mappings` and namespaces and specifying the content.

> Note: when several `DevPortal` resources exist, the Dev Portal will pick a random
> one and ignore the rest. A specific `DevPortal` can be used as the default configuration
> by setting the `default` attribute to `true`. Future versions will
> use other `DevPortals` for configuring alternative _views_ of the Dev Portal.

`DevPortal` resources have the following syntax:

```yaml
apiVersion: getambassador.io/v3alpha1
kind:  DevPortal
metadata:
  name:  "string"
  namespace: "string"
spec:
  default: bool           ## optional; default false
  docs:                   ## optional; default is []
    - service: "string"   ## required
      url: "string"       ## required
  content:                ## optional
    url: "string"         ## optional; see below
    branch: "string"      ## optional; see below
    dir: "string"         ## optional; see below
  selector:               ## optional
    matchNamespaces:      ## optional; default is []
      - "string"
    matchLabels:          ## optional; default is {}
      "string": "string"
  naming_scheme: "string" ## optional; supported values [ "namespace.name", "name.prefix" ]; default "namespace.name"
  preserve_servers: bool ## optional; default false
  search:
    enabled: bool         ## optional; default false
    type: "string"        ## optional; supported values ["title-only", "all-content"]; default "title-only"
```

where:

* `default`: `true` when this is the default Dev Portal configuration.
* `content`: see [section below](#styling-the-devportal).
* `selector`: rules for filtering `Mapping`s:
  * `matchNamespaces`: list of namespaces, used for filtering the `Mapping`s that
  will be shown in the `DevPortal`. When multiple namespaces are provided, the `DevPortal`
  will consider `Mapping`s in **any** of those namespaces.
  * `matchLabels`: dictionary of labels, filtering the `Mapping`s that will
  be shown in the `DevPortal`. When multiple labels are provided, the `DevPortal`
  will only consider the `Mapping`s that match **all** the labels.
* `docs`: static list of _service_/_documentation_ pairs that will be shown
  in the _Dev Portal_. Only the documentation from this list will be shown in the _Dev Portal_
  (unless additional docs are included with a `selector`).
  * `service`: service name used for listing user-provided documentation.
  * `url`: a full URL to a OpenAPI document for this service. This document will be
  served _as it is_, with no extra processing from the _Dev Portal_ (besides replacing
  the _hostname_).
* `naming_scheme`: Configures how DevPortal docs are displayed and linked to in the UI.
  * "namespace.name" will display the docs with the namespace and name of the mapping.
  e.g. a Mapping named `quote` in namespace `default` will be displayed as `default.quote`
  and its docs will have the relative path of `/default/quote`
  * "name.prefix" will display the docs with the name and prefix of the mapping.
  e.g. a Mapping named `quote` with a prefix `backend` will be displayed as `quote.backend`
  and its docs will have the relative path of `/quote/backend`
* `preserve_servers`: Configures the DevPortal to no longer dynamically build server definitions
  for the "try it out" request builder by using the Edge Stack hostname. When set to `true`, the
  DevPortal will instead display the server definitions from the `servers` section of the Open API
  docs supplied to the DevPortal for the service.
* `search`: as of Edge Stack 1.13.0, the DevPortal content is now searchable
  * `enabled`: default `false``; set to true to enable search functionality.
    * When `enabled=false`, the DevPortal search endpoint (`/[DEVPORTAL_PATH/api/search`) will return an empty response
  * `type`: Configure the items fed into search
    * `title-only` (default): only search over the names of DevPortal services and markdown pages
    * `all-content`: Search over openapi spec content and markdown page content.

Example:

The scope of the default _Dev Portal_ can be restricted to
`Mappings` with the `public-api: true` and `documented: true` labels by creating
a `DevPortal` `ambassador` resource like this:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  DevPortal
metadata:
  name:  ambassador
spec:
  default: true
  content:
    url: https://github.com/datawire/devportal-content-v2.git
  selector:
    matchLabels:
      public-api: "true"    ## labels for matching only some Mappings
      documented: "true"    ## (note that "true" must be quoted)
```

Example:

The _Dev Portal_ can show a static list OpenAPI docs. In this example, a `eks.aws-demo`
_service_ is shown with the documentation obtained from a URL. In addition,
the _Dev Portal_ will show documentation for all the services discovered in the
`aws-demo` namespace:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  DevPortal
metadata:
  name:  ambassador
spec:
  default: true
  docs:
    - service: eks.aws-demo
      url: https://api.swaggerhub.com/apis/kkrlogistics/amazon-elastic_kubernetes_service/2017-11-01/swagger.json
  selector:
    matchNamespaces:
      - aws-demo            ## matches all the services in the `aws-demo` namespace
                            ## (note that Mappings must contain a `docs` attribute)
```

> Note:
>
> The free and unlicensed versions of `Ambassador Edge Stack` only support documentation for five services in the `DevPortal`.
> When you start publishing documentation for more services to your `DevPortal`, keep in mind that you will not see more than 5 OpenAPI documents even if you have more than 5 services properly configured to report their OpenAPI specifications.
> For more information on extending the number of services in your `DevPortal` please contact sales via our [pricing information page](/editions/).


## Styling the `DevPortal`

The look and feel of a `DevPortal` can be fully customized for your particular
organization by specifying a different `content`, customizing not only _what_
is shown but _how_ it is shown, and giving the possibility to
add some specific content on your API documentation (e.g., best practices,
usage tips, etc.) depending on where it has been published.

The default _Dev Portal_ content is loaded in order from:

- the `ambassador` `DevPortal` resource.
- the Git repo specified in the optional `DEVPORTAL_CONTENT_URL` environment variable.
- the default repository at [GitHub](https://github.com/datawire/devportal-content-v2.git).

To use your own styling, clone or copy the repository, create an `ambassador` `DevPortal`
and update the `content` attribute to point to the repository. If you wish to use a
private GitHub repository, create a [Personal Access Token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line)
and include it in the `content` following the example below:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  DevPortal
metadata:
  name:  ambassador
spec:
  default: true
  content:
    url: https://9cb034008ddfs819da268d9z13b7ecd26@github.com/datawire/private-devportal-repo.git
  selector:
    matchLabels:
      public-api: true
```

The `content` can be have the following attributes:

```yaml
  content:
    url: "string"      ## optional; default is the default repo
    branch: "string"   ## optional; default is "master"
    dir: "string"      ## optional; default is  "/"
```

where:

* `url`: Git URL for the content
* `branch`: the Git branch
* `dir`: subdirectory in the Git repo

#### Iterating on _Dev Portal_ styling and content

**Local Development**

Check out a local copy of your content repo and from within run the following docker image:

```
docker run -it --rm --volume $PWD:/content --entrypoint local-devportal --publish 1080:1080
  docker.io/datawire/aes:$version$ /content
```

and open `http://localhost:1080` in your browser. Any changes made locally to
devportal content will be reflected immediately on page refresh.

> Note:
>
> The docker command above will only work for AES versions 1.13.0+.

**Remote Ambassador**

After committing and pushing changes to your devportal content repo changes to git, set your DevPortal to fetch from your branch:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  DevPortal
metadata:
  name:  ambassador
spec:
  default: true
  content:
    url: $REPO_URL
    branch: $DEVELOPMENT_BRANCH
```

Then you can force a reload of DevPortal content by hitting a refresh endpoint on your remote ambassador:

```
# first, get your ambassador service
export AMBASSADOR_LB_ENDPOINT=$(kubectl -n ambassador get svc ambassador \
  -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")

# Then refresh the DevPortal content
curl -X POST -Lk ${AMBASSADOR_LB_ENDPOINT}/docs/api/refreshContent
```

> Note:
>
> The DevPortal does not share a cache between replicas, so the content refresh endpoint
> will only refresh the content on a single replica. It is suggested that you use this
> endpoint in a single replica Edge Stack setup.

#### Customizing documentation names and paths

The _Dev Portal_ displays the documentation's Mapping name and namespace by default,
but you can override this behavior.

To change the documentation naming scheme for the entire _Dev Portal_, you can set
`naming_scheme` in the `DevPortal` resource:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  DevPortal
metadata:
  name:  ambassador
spec:
  default: true
  naming_scheme: "name.prefix"
```

With the above configuration, a mapping for `service-a`:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  service-a
spec:
  prefix: /path/
  service: service-a:5000
  docs:
    path: /openapi/
```

Will be displayed in the _Dev Portal_ as `service-a.path`,
and the API documentation will be accessed at `$AMBASSADOR_URL/docs/doc/service-a/path`.

You can also override the display name of documentation on a per-mapping basis.
Per-mapping overrides will take precedence over the `DevPortal` `naming_scheme`.

A mapping for `service-b` with `display_name` set:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  service-b
spec:
  prefix: /otherpath/
  service: service-b:5000
  docs:
    path: /openapi/
    display_name: "Cat Service"
```

Will be displayed in the _Dev Portal_ as `Cat Service`, and the documentation will be
accessed at `$AMBASSADOR_URL/docs/doc/Cat%20Service`.


## Default configuration

The _Dev Portal_ supports some default configuration in some environment variables
(for backwards compatibility).

### Environment variables

The _Dev Portal_ can also obtain some default configuration from environment variables
defined in the AES `Deployment`. This configuration method is considered deprecated and
kept only for backwards compatibility: users should configure the default values with
the `ambassador` `DevPortal`.

| Setting                  | Description                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| AMBASSADOR_URL           | External URL of Ambassador Edge Stack; include the protocol (e.g., `https://`) |
| POLL_EVERY_SECS          | Interval for polling OpenAPI docs; default 60 seconds                          |
| DEVPORTAL_CONTENT_URL    | Default URL to the repository hosting the content for the Portal               |
| DEVPORTAL_CONTENT_DIR    | Default content subdir (defaults to `/`)                                       |
| DEVPORTAL_CONTENT_BRANCH | Default content branch (defaults to `master`)                                  |
| DEVPORTAL_DOCS_BASE_PATH | Base path for api docs (defaults to `/doc/`)                                   |

## Visualize your API documentation in the cloud

If you haven't already done so, you may want to [connect your cluster to Ambassador Cloud](../../../tutorials/getting-started). Connected clusters will automatically report your `Mapping`s' OpenAPI documents, allowing you to host and visualize all of your services API documentation on a shared, secure and authenticated platform.
