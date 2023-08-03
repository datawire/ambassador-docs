import Alert from '@material-ui/lab/Alert';

# OAuth2 System Design

OAuth2 is provided in $productName$ by the [Oauth2 Filter custom resource][] to configure OAuth2 authorization against an identity provider implementing [OIDC Discovery][].

When using `OAuth2 Filters`, $productName$ functions as:

- An OAuth Client that fetches resources from the Resource Server on the user's behalf.
- Half of a Resource Server, validating the Access Token before allowing the request through to the upstream service, which implements the other half of the Resource Server.

This is different from most OAuth implementations where the Authorization Server and the Resource Server are in the same security domain.
With $productName$, the Client and the Resource Server are in the same security domain, and there is an independent Authorization Server.

In this architecture, $productName$ functions as an Identity Aware Proxy in a Zero Trust Network. For more about this security architecture,
read the [BeyondCorp security architecture whitepaper][] by Google.

If you want to jump straight into configuring OAuth2, the [usage guides section][] has several tutorials about integrating $productName$ with a number of Identity Providers.

## The $productName$ authentication flow

This is what the authentication process looks like at a high level when using $productName$ with an external identity provider.
The use case is an end-user accessing a secured app service.

![Edge Stack Authentication OAuth/OIDC](../images/ambassador_oidc_flow.jpg)

### Basic Authentication Terms

For those unfamiliar with authentication, here is a basic set of definitions that are often used.

- OpenID: is an [open standard][] and [decentralized authentication protocol][]. OpenID allows users to be authenticated by co-operating sites,
referred to as "relying parties" (RP) using a third-party authentication service. End-users can create accounts by selecting an OpenID
identity provider (such as Auth0, Okta, etc), and then use those accounts to sign onto any website that accepts OpenID authentication.
- Open Authorization (OAuth): an open standard for [token-based authentication and authorization][] on the Internet. OAuth provides to clients
a "secure delegated access" to server or application resources on behalf of an owner, which means that although you won't manage a user's
authentication credentials, you can specify what they can access within your application once they have been successfully authenticated.
The current latest version of this standard is OAuth 2.0.
- Identity Provider (IdP): an entity that [creates, maintains, and manages identity information][] for user accounts (also referred to "principals")
while providing authentication services to external applications (referred to as "relying parties") within a distributed network, such as the web.
- OpenID Connect (OIDC): is an [authentication layer that is built on top of OAuth 2.0][], which allows applications to verify the identity of an
end-user based on the authentication performed by an IdP, using a well-specified RESTful HTTP API with JSON as a data format. Typically an OIDC
implementation will allow you to obtain basic profile information for a user that successfully authenticates, which in turn can be used for implementing
additional security measures like Role-based Access Control (RBAC).
- JSON Web Token (JWT): is a [JSON-based open standard for creating access tokens][], such as those generated from an OAuth authentication. JWTs are compact,
web-safe (or URL-safe), and are often used in the context of implementing single sign-on (SSO) within federated applications and organizations. Additional
profile information, claims, or role-based information can be added to a JWT, and the token can be passed from the edge of an application right through
the application's service call stack.

The function of the entities involved should be more clear if you were not familiar with any of these details beforehand.

### Using an identity hub

Using an identity hub or broker allows you to support many IdPs without having to code individual integrations with them. For example,
[Auth0][] and [Keycloak][] both offer support for using Google and GitHub as an IdP.

An identity hub sits between your application and the IdP that authenticates your users, which not only adds a level of abstraction so that your
application (and $productName$) is isolated from any changes to each provider's implementation, but it also allows your users to choose which
provider they use to authenticate (and you can set a default, or restrict these options).

The Auth0 docs provide a guide for adding social IdP "[connections][]" to your Auth0 account, and the Keycloak docs provide a guide
for adding social identity "[brokers][]".

## XSRF protection

The `ambassador_xsrf.NAME.NAMESPACE` cookie is an opaque string that should be used as an XSRF token.
Applications wishing to leverage the $productName$ in their XSRF attack protection should take two extra steps:

 1. When generating an HTML form, the server should read the cookie and include a `<input type="hidden" name="_xsrf" value="COOKIE_VALUE" />` element in the form.
 2. When handling submitted form data should verify that the form value and the cookie value match.  If they do not match,
it should refuse to handle the request and return an HTTP 4XX response.

Applications using request submission formats other than HTML forms should perform analogous steps of ensuring that the value is
present in the request duplicated in the cookie and also in either the request body or secure header field.  A secure header
field is one that is not `Cookie`, is not "[simple][]" and is not explicitly allowed by the CORS policy.

<Alert severity="info">
Prior versions of $productName$ did not have an <code>ambassador_xsrf.NAME.NAMESPACE</code> cookie, and instead required you to use
the <code>ambassador_session.NAME.NAMESPACE</code> cookie.  The <code>ambassador_session.NAME.NAMESPACE</code> cookie should no longer be used for XSRF-protection purposes.
</Alert>

## RP-initiated logout

When a logout occurs, it is often not enough to delete $productName$'s session
cookie or session data; after this happens, and the web
browser is redirected to the Identity Provider to re-log-in, the
Identity Provider may remember the previous login, and immediately
re-authorize the user; it would be like the logout never even
happened.

To solve this, $productName$ can use [OpenID Connect Session Management][]
to perform an "RP-Initiated Logout" where Edge Stack
(the OpenID Connect "Relying Party" or "RP")
communicates directly with Identity Providers that support OpenID
Connect Session Management to properly log out the user.
Unfortunately, many Identity Providers do not support OpenID Connect
Session Management.

This is done by having your application direct the web browser `POST`
*and navigate* to `/.ambassador/oauth2/logout`.  There are two
form-encoded values that you need to include:

 1. `realm`: The `name.namespace` of the `Filter` that you want to log
    out of.  This may be submitted as part of the POST body or may be set as a URL query parameter.
 2. `_xsrf`: The value of the `ambassador_xsrf.{{realm}}` cookie
    (where `{{realm}}` is as described above).  This must be set in the POST body. The URL query part will not be checked.

### Example configurations

Below are a few examples about how to instruct $productName$ to perform RP-initiated logout from your client application

```html
<form method="POST" action="/.ambassador/oauth2/logout" target="_blank">
  <input type="hidden" name="realm" value="myfilter.mynamespace" />
  <input type="hidden" name="_xsrf" value="{{ .Cookie.Value }}" />
  <input type="submit" value="Log out" />
</form>
```


```html
<form method="POST" action="/.ambassador/oauth2/logout?realm=myfilter.mynamespace" target="_blank">
  <input type="hidden" name="_xsrf" value="{{ .Cookie.Value }}" />
  <input type="submit" value="Log out" />
</form>
```

Using JavaScript:

```js
function getCookie(name) {
    var prefix = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trimStart();
        if (cookie.indexOf(prefix) == 0) {
            return cookie.slice(prefix.length);
        }
    }
    return "";
}

function logout(realm) {
    var form = document.createElement('form');
    form.method = 'post';
    form.action = '/.ambassador/oauth2/logout?realm='+realm;
    //form.target = '_blank'; // uncomment to open the identity provider's page in a new tab

    var xsrfInput = document.createElement('input');
    xsrfInput.type = 'hidden';
    xsrfInput.name = '_xsrf';
    xsrfInput.value = getCookie("ambassador_xsrf."+realm);
    form.appendChild(xsrfInput);

    document.body.appendChild(form);
    form.submit();
}
```

## OAuth2 Usage Guides

- [OAuth2 Filter custom resource][]: An API reference about all the fields of the OAauth2 Filter
- [Using Oauth2 Filters][]: Use the OAuth2 Filter for authentication to protect access to services
  - [SSO with Auth0][]: Setup single sign-on with Auth0
  - [SSO with Azure][]: Setup single sign-on with Azure
  - [SSO with Google][]: Setup single sign-on with Google
  - [SSO with Keycloak][]: Setup single sign-on with Keycloak
  - [SSO with Okta][]: Setup single sign-on with Okta
  - [SSO with OneLogin][]: Setup single sign-on with OneLogin
  - [SSO with Salesforce][]: Setup single sign-on with Salesforce
  - [SSO with UAA][]: Setup single sign-on with UAA
- [Chaining Oauth2 and JWT Filters][]: Learn how to combine Filters for Oauth2 and JWT processing

[usage guides section]: #oauth2-usage-guides
[Oauth2 Filter custom resource]: ../../custom-resources/filter-oauth2
[Using Oauth2 Filters]: ../../guides/sso/oauth2-sso
[SSO with Auth0]: ../../guides/sso/auth0
[SSO with Azure]: ../../guides/sso/azure
[SSO with Google]: ../../guides/sso/google
[SSO with Keycloak]: ../../guides/sso/keycloak
[SSO with Okta]: ../../guides/sso/okta
[SSO with OneLogin]: ../../guides/sso/onelogin
[SSO with Salesforce]: ../../guides/sso/salesforce
[SSO with UAA]: ../../guides/sso/uaa
[Chaining Oauth2 and JWT Filters]: ../../guides/auth/oauth2-and-jwt
[open standard]: https://openid.net/
[Auth0]: https://auth0.com/docs/identityproviders
[token-based authentication and authorization]: https://oauth.net/
[JSON-based open standard for creating access tokens]: https://jwt.io/
[connections]: https://auth0.com/docs/identityproviders
[OIDC Discovery]: https://openid.net/specs/openid-connect-discovery-1_0.html
[decentralized authentication protocol]: https://en.wikipedia.org/wiki/OpenID
[authentication layer that is built on top of OAuth 2.0]: https://openid.net/connect/
[BeyondCorp security architecture whitepaper]: https://ai.google/research/pubs/pub43231
[simple]: https://www.w3.org/TR/cors/#simple-header
[OpenID Connect Session Management]: https://openid.net/specs/openid-connect-session-1_0.html
[Keycloak]: https://www.keycloak.org/docs/latest/server_admin/index.html#social-identity-providers
[brokers]: https://www.keycloak.org/docs/latest/server_admin/index.html#social-identity-providers
[creates, maintains, and manages identity information]: https://en.wikipedia.org/wiki/Identity_provider
