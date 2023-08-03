import Alert from '@material-ui/lab/Alert';

# Using the OAuth2 filter for SSO

$productName$ adds native support for configuring single sign-on with OAuth
and OIDC authentication schemes for single sign-on with an external identity
provider (IdP) via the [OAuth2 Filter custom resource][]. $productName$ has
been tested with Keycloak, Auth0, Okta, and UAA, although other OAuth/OIDC-compliant
identity providers should work. Please contact us on [Slack][] if you have
questions about IdPs not listed below.

## 1. Configure an OAuth2 filter

First, configure an OAuth2 Filter for your identity provider. For information
on configuring your IdP, see [the guide docs section][], which contains specific configurations for many of the most popular IDPs.

```yaml
---
apiVersion: gateway.getambassador.io/v1alpha1
kind: Filter
metadata:
  name: example-oauth2-filter
  namespace: default
spec:
  type: "oauth2"
  oauth2:
    authorizationURL: {{PROVIDER_URL}}
    grantType: "AuthorizationCode"
    authorizationCodeSettings:
      clientID: {{CLIENT_ID}}
      clientSecret: {{CLIENT_SECRET}}
      protectedOrigins:
      - origin: {{AMBASSADOR_URL}}
        includeSubdomains: true
```

- `{{PROVIDER_URL}}`: Replace with the URL where $productName$ can find the OAuth2 descriptor.
- `{{CLIENT_ID}}`: Replace with the client id from the application you created in your Idp.
- `{{CLIENT_SECRET}}`: Replace with the client secret from the application you created in your Idp.
- `{{AMBASSADOR_URL}}`: Replace this with the URL you want your IdP to redirect to. This is typically the same as the request's host.

If you have multiple domains that should all share the same single-sign-on authentication,
you can list more than one entry under `protectedOrigins`. Just make sure that the first one listed
is the one your IdP is configured to redirect back to.

Save the configuration to a file and apply it to the cluster: `kubectl apply -f oauth-filter.yaml`.

## 2. Create a FilterPolicy

Once we have a properly configured OAuth2 Filter, create a [FilterPolicy custom resource][]
that configures which requests this `Filter` should run against

```yaml
kubectl apply -f -<<EOF
---
apiVersion: getambassador.io/v3alpha1
kind: FilterPolicy
metadata:
  name: example-filter-policy
spec:
  rules:
  - host: "*"
    path: "*"
    filterRefs:
    - name: example-auth2-filter # Filter name from above
      namespace: default # Filter namespace from above
      arguments:
        type: oauth2
        oauth2:
          sameSite: lax
          scope:
          - openid
EOF
```

<Alert severity="success"><b>Success!</b> You can now protect your Services with OAuth2 Filters!</Alert>

## Filter Usage Guides

- [OAuth2 design in $productName$][]: Learn about how the OAuth2 system works
- [The Filter Resource][]: An API reference doc for the `Filter` custom resource.
- [The FilterPolicy Resource][]: An API reference doc for the `FilterPolicy` custom resource.
- [Using JWT Filters][]: Use the JWT Filter to validate and process JWTs on requests
- [SSO with Auth0][]: Setup single sign-on with Auth0
- [SSO with Azure][]: Setup single sign-on with Azure
- [SSO with Google][]: Setup single sign-on with Google
- [SSO with Keycloak][]: Setup single sign-on with Keycloak
- [SSO with Okta][]: Setup single sign-on with Okta
- [SSO with OneLogin][]: Setup single sign-on with OneLogin
- [SSO with Salesforce][]: Setup single sign-on with Salesforce
- [SSO with UAA][]: Setup single sign-on with UAA
- [Chaining Oauth2 and JWT Filters][]: Learn how to combine Filters for Oauth2 and JWT processing

[the guide docs section]: #filter-usage-guides
[OAuth2 Filter custom resource]: ../../../custom-resources/filter-oauth2
[FilterPolicy custom resource]: ../../../custom-resources/filterpolicy
[The Filter Resource]: ../../../custom-resources/filter
[The FilterPolicy Resource]: ../../../custom-resources/filterpolicy
[Using JWT Filters]: ../../auth/jwt
[SSO with Auth0]: ../auth0
[SSO with Azure]: ../azure
[SSO with Google]: ../google
[SSO with Keycloak]: ../keycloak
[SSO with Okta]: ../okta
[SSO with OneLogin]: ../onelogin
[SSO with Salesforce]: ../salesforce
[SSO with UAA]: ../uaa
[OAuth2 design in $productName$]: ../../../design/oauth2
[Chaining Oauth2 and JWT Filters]: ../../auth/oauth2-and-jwt
[Slack]: https://a8r.io/slack
