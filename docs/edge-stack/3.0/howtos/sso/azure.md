# Single Sign-On with Azure Active Directory (AD)

## Set up Azure AD

To use Azure as your IdP, you will first need to register an OAuth application with your Azure tenant.

1. Follow the steps in the Azure documentation [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal) to register your application. Make sure to select "web application" (not native application) when creating your OAuth application.

2. After you have registered your application, click on `App Registrations` in the navigation panel on the left and select the application you just created.

3. Make a note of both the client and tenant IDs as these will be used later when configuring $AESproductName$.

4. Click on `Authentication` in the left sidebar.

      - Under the `Platform configurations` section, click on `+ Add a platform`, then select `Web` and add this URL `https://{{AMBASSADOR_URL}}/.ambassador/oauth2/redirection-endpoint` into the `Redirect URIs` input field

        **Note:** Azure AD requires the redirect endpoint to handle TLS
      - Make sure your application is issuing `access tokens` by clicking on the `Access tokens (used for implicit flows)` checkbox under the `Implicit grant and hybrid flows` section
      - Finally, click on `Configure` to save your changes

5. Click on `Certificates & secrets` in the left sidebar. Click `+ New client secret` and set the expiration date you wish. Copy the value of this secret somewhere. You will need it when configuring $AESproductName$.

## Set Up $AESproductName$

After configuring an OAuth application in Azure AD, configuring $AESproductName$ to make use of it for authentication is simple.

1. Create an [OAuth Filter](../../../topics/using/filters/oauth2) with the credentials from above:

    ```yaml
    apiVersion: getambassador.io/v3alpha1
    kind: Filter
    metadata:
      name: azure-ad
    spec:
      OAuth2:
        # Azure AD openid-configuration endpoint can be found at https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
        authorizationURL: https://login.microsoftonline.com/{{TENANT_ID}}/v2.0
        # Client ID from step 3 above
        clientID: CLIENT_ID
        # Secret created in step 5 above
        secret: CLIENT_SECRET
        # The protectedOrigin is the scheme and Host of your $AESproductName$ endpoint
        protectedOrigins:
        - origin: https://{{AMBASSADOR_URL}}
    ```

2. Create a [FilterPolicy](../../../topics/using/filters/) to use the `Filter` created above

    ```yaml
    apiVersion: getambassador.io/v3alpha1
    kind: FilterPolicy
    metadata:
      name: azure-policy
    spec:
      rules:
          # Requires authentication on requests from any hostname
        - host: "*"
          # Tells $AESproductName$ to apply the Filter only on request to the quote /backend/get-quote/ endpoint
          path: /backend/get-quote/
          # Identifies which Filter to use for the path and host above
          filters:
            - name: azure-ad
    ```

3. Apply both the `Filter` and `FilterPolicy` above with `kubectl`

    ```
    kubectl apply -f azure-ad-filter.yaml
    kubectl apply -f azure-policy.yaml
    ```

Now any requests to `https://{{AMBASSADOR_URL}}/backend/get-quote/` will require authentication from Azure AD.
