import Alert from '@material-ui/lab/Alert';

# Using Filters and FilterPolicies

Filters are used to extend the Ambassador Edge Stack to modify or intercept a request before sending to your
backend service. The most common use case for Filters is authentication, and Edge Stack includes a number
of built-in filters for this purpose. Edge Stack also supports developing custom filters.

## Filter types

Edge Stack supports the following filter types:

- [JWT][]: Validates JSON Web Tokens
- [OAuth2][]: Performs OAuth2 authorization against an identity provider implementing [OIDC Discovery][].
- [Plugin][]: Allows users to write custom Filters in Go that run as part of the Edge Stack container
- [External][]: Allows users to call out to other services for request processing. This can include both custom services (in any language) or third party services.
- [API Keys][]: Validates API Keys present in a custom HTTP header

## Managing Filters

Filters are created with the `Filter` resource type, which contains global arguments to that filter.
Which Filter(s) to use for which HTTP requests is then configured in [FilterPolicy resources][],
which may contain path-specific arguments to the filter.

## Using a Filter in a FilterPolicy

In the example below, the `param-filter` Filter Plugin is loaded and configured to run on requests to `/httpbin/`.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Filter
metadata:
  name: param-filter # This is the name used in FilterPolicy
  namespace: standalone
spec:
  Plugin:
    name: param-filter # The plugin's `.so` file's base name

---
apiVersion: getambassador.io/v3alpha1
kind: FilterPolicy
metadata:
  name: httpbin-policy
spec:
  rules:
  # Don't apply any filters to requests for /httpbin/ip
  - host: "*"
    path: /httpbin/ip
    filters: null
  # Apply param-filter and auth0 to requests for /httpbin/
  - host: "*"
    path: /httpbin/*
    filters:
    - name: param-filter
    - name: auth0
  # Default to authorizing all requests with auth0
  - host: "*"
    path: "*"
    filters:
    - name: auth0
```

<Alert severity="info">
  Edge Stack will choose the first FilterPolicy rule that matches the incoming request. As in the above example, you must list your rules in the order of least to most generic.
</Alert>

## FilterPolicies With Multiple Domains

In this example, the `foo-keycloak` filter is used for requests to `foo.bar.com`, while the `example-auth0` filter is used for requests to `example.com`. This configuration is useful if you are hosting multiple domains in the same cluster.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: FilterPolicy
metadata:
  name: multi-domain-policy
spec:
  rules:
  - host: foo.bar.com
    path: "*"
    filters:
      - name: foo-keycloak
  - host: example.com
    path: "*"
    filters:
      - name: example-auth0
```

## Filters Using Self-Signed Certificates

The JWT and OAuth2 filters speak to other services over HTTP or HTTPS.  If those services are configured to speak HTTPS using a self-signed certificate, attempting to talk to them will result in an error mentioning `ERR x509: certificate signed by unknown authority`. You can fix this by installing that self-signed certificate into the AES container by copying the certificate to `/usr/local/share/ca-certificates/` and then running `update-ca-certificates`.  Note that the `aes` image sets `USER 1000` but `update-ca-certificates` needs to be run as root.

The following Dockerfile will accomplish this procedure for you. When deploying Edge Stack, refer to that custom Docker image rather than to `docker.io/datawire/aes:$version$`

```Dockerfile
FROM docker.io/datawire/aes:$version$
USER root
COPY ./my-certificate.pem /usr/local/share/ca-certificates/my-certificate.crt
RUN update-ca-certificates
USER 1000
```

[JWT]: ../jwt
[OAuth2]: ../oauth2
[Plugin]: ../plugin
[External]: ../external
[API Keys]: ../apikeys
[FilterPolicy resources]: ../../../../custom-resources/getambassador.io/v3alpha1/filterpolicy
[OIDC Discovery]: https://openid.net/specs/openid-connect-discovery-1_0.html
