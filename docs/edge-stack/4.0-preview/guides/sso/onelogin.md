import Alert from '@material-ui/lab/Alert';

# Single Sign-On with OneLogin

OneLogin is an application that manages authentication for your users
on your network and can provide backend access to $productName$.

## Create an App Connector in OneLogin

First, you need to create an OIDC custom connector and create an application from that connector.

1. In your OneLogin portal, select `Administration` from the top right.
2. From the top left menu, select `Applications` > `Custom Connectors` > `New Connector`.
3. Give your connector a name.
4. Select the `OpenID Connect` option as your `Sign on method`.
5. Use `http(s)://{{AMBASSADOR_URL/.ambassador/oauth2/redirection-endpoint` as the value for `Redirect URI`.
6. Optionally provide a login URL.
7. Click the `Save` button to create the connector. You will see a confirmation message.
8. In the `More Actions` tab, select `Add App to Connector`.
9. Select the connector you just created.
10. Click the `Save` button.

You will see a success banner, which also brings you back to the main portal page.
OneLogin is now configured to function as an OIDC backend for authentication with $productName$.

## Gather OneLogin Credentials

Next, configure $productName$ to require authentication with OneLogin, so you must
collect the client information credentials from the application you just created.

1. In your OneLogin portal, go to `Administration` > `Applications` > `Applications`
2. Select the application you previously created.
3. On the left, select the `SSO` tab to see the client information.
4. Copy the value of `Client ID` for later use.
5. Click the `Show Client Secret` link and copy the value for later use.

## Configure an OAuth2 Filter and FilterPolicy

1. Create an [OAuth2 Filter][] with the credentials from above:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: onelogin-oauth2-filter
     namespace: default
   spec:
     type: "oauth2"
     oauth2:
       # onelogin openid-configuration endpoint can be found at https://{{subdomain}}.onelogin.com/oidc/.well-known/openid-configuration
       authorizationURL: https://{{subdomain}}.onelogin.com/oidc
       grantType: "AuthorizationCode"
       authorizationCodeSettings:
         clientID: {{CLIENT_ID}}  # Client ID from above
         clientSecret: {{CLIENT_SECRET}} # Client secret created above
         protectedOrigins:
         # The origin is the scheme and Host of your $productName$ endpoint
         - origin: http(s)://{{AMBASSADOR_URL}}
           includeSubdomains: true
   EOF
   ```

2. Create a [FilterPolicy resource][] to use the `Filter` created above

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: FilterPolicy
   metadata:
     name: onelogin-oauth2-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filterRefs:
       - name: onelogin-oauth2-filter # Filter name from above
         namespace: default # Filter namespace from above
   EOF
   ```

<Alert severity="success">
  <b>Success!</b> Your Services are now protected by OneLogin single sign-on using OAuth2 Filters!
</Alert>

[OAuth2 Filter]: ../../../custom-resources/filter-oauth2
[FilterPolicy resource]: ../../../custom-resources/filterpolicy
