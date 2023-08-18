import Alert from '@material-ui/lab/Alert';

# Single Sign-On with Salesforce

To use Salesforce as your IdP, you must first register an OAuth application with your Salesforce tenant. This guide will walk you through the most basic setup via the "Salesforce Classic Experience."

## Create an OAuth application in Salesforce

1. In the `Setup` page, under `Build` click the dropdown next to `Create` and select `Apps`.
2. Under `Connected Apps` at the bottom of the page, click on `New` at the top.
3. Fill in the following fields with whichever values you want:

    - Connected App Name
    - API Name
    - Contact Email

4. Under `API (Enable OAuth Settings)` check the box next to `Enable OAuth Settings`.
5. Fill in the `Callback URL` section with `https://{{AMBASSADOR_HOST}}/.ambassador/oauth2/redirection-endpoint`.
6. Under `Selected OAuth Scopes` you must select the `openid` scope
   value at the minimum.  Select any other scope values you want to
   include in the response as well.
7. Click `Save` and `Continue` to create the application.
8. Record the `Consumer Key` and `Consumer Secret` values from the `API (Enable OAuth Settings)` section in the newly created application's description page.

After waiting for Salesforce to register the application with their servers, you should be ready to configure $productName$ to Salesforce as an IdP.

## Configure an OAuth2 Filter and FilterPolicy

1. Create an [OAuth2 Filter][] with the credentials from above:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: salesforce-oauth2-filter
     namespace: default
   spec:
     type: "oauth2"
     oauth2:
       # Salesforce's generic OpenID configuration endpoint at https://login.salesforce.com/ will work but you can also use your custom Salesforce domain i.e.: http://datawire.my.salesforce.com
       authorizationURL: https://login.salesforce.com/
       grantType: "AuthorizationCode"
       authorizationCodeSettings:
         clientID: {{CLIENT_ID}}  # Consumer key from above
         clientSecret: {{CLIENT_SECRET}} # Consumer secret from above
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
     name: salesforce-oauth2-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filterRefs:
       - name: salesforce-oauth2-filter # Filter name from above
         namespace: default # Filter namespace from above
         # You can add the following section if you creates any additional scope values when configuring Salesforce
         # arguments:
         #   type: oauth2
         #   oauth2:
         #     sameSite: lax
         #     scope:
         #     - refresh_token
   EOF
   ```

<Alert severity="success">
  <b>Success!</b> Your Services are now protected by Salesforce single sign-on using OAuth2 Filters!
</Alert>

[OAuth2 Filter]: ../../../custom-resources/filter-oauth2
[FilterPolicy resource]: ../../../custom-resources/filterpolicy
