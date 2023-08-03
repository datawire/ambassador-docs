import Alert from '@material-ui/lab/Alert';

# Single Sign-On with Azure Active Directory (AD)

To use Azure as your IdP, you must first register an OAuth application with your Azure tenant.

## Create an Application in Azure AD

1. Follow the steps in the [Azure documentation][] to register your application. Select `Web Application` (not `Native Application`) when creating your OAuth application.

2. After you have registered your application, click on `App Registrations` in the navigation panel on the left and select the application you just created.

3. Make a note of both the client and tenant IDs, as these will be used later when configuring $productName$.

4. Click on `Authentication` in the left sidebar.

   - Under the `Platform configurations` section, click on `+ Add a platform`, then select `Web` and add this URL `https://{{AMBASSADOR_URL}}/.ambassador/oauth2/redirection-endpoint` into the `Redirect URIs` input field

    **Note:** Azure AD requires the redirect endpoint to handle TLS
   - Make sure your application is issuing `access tokens` by clicking on the `Access tokens (used for implicit flows)` checkbox under the `Implicit grant and hybrid flows` section
   - Finally, click on `Configure` to save your changes

5. Click on `Certificates & Secrets` in the left sidebar. Click `+ New client secret` and set the expiration date you wish. Copy the value of this secret somewhere. You will need it when configuring $productName$.

## Configure an OAuth2 Filter and FilterPolicy

1. Create an [OAuth2 Filter][] with the credentials from above:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: azure-oauth2-filter
     namespace: default
   spec:
     type: "oauth2"
     oauth2:
       # Azure AD openid-configuration endpoint can be found at https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
       authorizationURL: https://login.microsoftonline.com/{{TENANT_ID}}/v2.0
       grantType: "AuthorizationCode"
       authorizationCodeSettings:
         clientID: {{CLIENT_ID}}  # Client ID from step 3 above
         clientSecret: {{CLIENT_SECRET}} # Client secret from step 5 above
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
     name: azure-oauth2-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filterRefs:
       - name: azure-oauth2-filter # Filter name from above
         namespace: default # Filter namespace from above
   EOF
   ```

<Alert severity="success">
  <b>Success!</b> Your Services are now protected by Azure AD single sign-on using OAuth2 Filters!
</Alert>

[OAuth2 Filter]: ../../../custom-resources/filter-oauth2
[FilterPolicy resource]: ../../../custom-resources/filterpolicy
[Azure documentation]: https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal
