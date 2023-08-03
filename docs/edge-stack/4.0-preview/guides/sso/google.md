import Alert from '@material-ui/lab/Alert';

# Single Sign-On with Google

## Create an OAuth client in the Google API Console

To use Google as an IdP for Single Sign-On, you will first need to create
an OAuth web application in the Google API Console.

1. Open the [Credentials page][] in the API Console
2. Click `Create credentials > OAuth client ID`.
3. Select `Web application` and give it a name
4. Under **Restrictions**, fill in the **Authorized redirect URIs** with

   ```bash
   http(s)://{{AMBASSADOR_URL}}/.ambassador/oauth2/redirection-endpoint
   ```

5. Click `Create`
6. Record the `client ID` and `client secret` in the pop-up window. You will need these when configuring $productName$

## Configure an OAuth2 Filter and FilterPolicy

After creating an OAuth client in Google, configuring $productName$ to make use of
it for authentication is simple.

1. Create an [OAuth2 Filter][] with the credentials from above:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: google-oauth2-filter
     namespace: default
   spec:
     type: "oauth2"
     oauth2:
       authorizationURL: https://accounts.google.com
       grantType: "AuthorizationCode"
       authorizationCodeSettings:
         clientID: {{CLIENT_ID}}  # Client ID from step 6 above
         clientSecret: {{CLIENT_SECRET}} # Client secret created in step 6 above
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
     name: google-oauth2-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filterRefs:
       - name: google-oauth2-filter # Filter name from above
         namespace: default # Filter namespace from above
         arguments:
           type: oauth2
           oauth2:
             sameSite: lax
             scope:
             - openid
   EOF
   ```

<Alert severity="success">
  <b>Success!</b> Your Services are now protected by Google single sign-on using OAuth2 Filters!
</Alert>

[OAuth2 Filter]: ../../../custom-resources/filter-oauth2
[FilterPolicy resource]: ../../../custom-resources/filterpolicy
[Credentials page]: https://console.developers.google.com/apis/credentials
