import Alert from '@material-ui/lab/Alert';

# Single Sign-On with Okta

## Create an OIDC application in Okta

   > If you have a [standard Okta account][] you must first navigate to your Okta Org's admin portal (step 1). [Developer accounts][] can skip to Step 2.

1. Go to your org and click `Admin` in the top right corner to access the admin portal
   - Select `Applications`
   - Select `Add Application`
   - Choose `Web` and `OpenID Connect`. Then click `Create`.
   - Give it a name and enter the URL of your $productName$ load balancer in `Base URIs` and the callback URL `{AMBASSADOR_URL}/.ambassador/oauth2/redirection-endpoint` as the `Login redirect URIs`

2. Copy the `Client ID` and `Client Secret`. They will be needed later.

3. Get the `audience` configuration

   - Select `API` and `Authorization Servers`
   - You can use the default `Authorization Server` or create your own.
   - If you are using the default, the audience of your Okta OAuth `Filter` is `api://default`


## Configure an OAuth2 Filter and FilterPolicy

1. Create an [OAuth2 Filter][] with the credentials from above:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: okta-oauth2-filter
     namespace: default
   spec:
     type: "oauth2"
     oauth2:
       authorizationURL: https://{{OKTA_DOMAIN}}.okta.com/oauth2/default # `Issuer URI` of the `Authorization Server`
       grantType: "AuthorizationCode"
       authorizationCodeSettings:
         clientID: {{CLIENT_ID}}  # Client ID from above
         clientSecret: {{CLIENT_SECRET}} # Client secret created above
         protectedOrigins:
         # The origin is the scheme and Host of your $productName$ endpoint
         - origin: http(s)://{{AMBASSADOR_URL}}
           includeSubdomains: true
         clientAuthentication:
           jwtAssertion:
             audience: {{AUDIENCE}} # Your audience from Okta
   EOF
   ```

2. Create a [FilterPolicy resource][] to use the `Filter` created above

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: FilterPolicy
   metadata:
     name: okta-oauth2-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filterRefs:
       - name: okta-oauth2-filter # Filter name from above
         namespace: default # Filter namespace from above
         arguments:
           type: oauth2
           oauth2:
             sameSite: lax
             scope:
             - openid
             - profile
   EOF
   ```

<Alert severity="info">
Scope values <code>openid</code> and <code>profile</code> are required at a
minimum. Other scope values can be added to the <code>Authorization Server</code>.
</Alert>

<Alert severity="success">
  <b>Success!</b> Your Services are now protected by Okta single sign-on using OAuth2 Filters!
</Alert>

[OAuth2 Filter]: ../../../custom-resources/filter-oauth2
[FilterPolicy resource]: ../../../custom-resources/filterpolicy
[standard Okta account]: https://www.okta.com
[Developer accounts]: https://developer.okta.com
