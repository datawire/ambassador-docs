# Single Sign-On with Auth0

With Auth0 as your IdP, you will need to create an `Application` to handle authentication requests from $AESproductName$.

1. Navigate to Applications and Select "CREATE APPLICATION"

  ## <img src="../../images/create-application.png" alt="Create application" />

2. In the pop-up window, give the application a name and create a "Machine to Machine App"

  ## <img src="../../images/machine-machine.png" alt="Machine to Machine App" />

3. Select the Auth0 Management API. Grant any scope values you may
   require.  (You may grant none.)  The API is required so that an
   `audience` can be specified which will result in a JWT being
   returned rather than opaque token.  A custom API can also be used.

  ## <img src="../../images/scopes.png" alt="Select scopes" />

4. In your newly created application, click on the Settings tab, add the Domain and Callback URLs for your service and ensure the "Token Endpoint Authentication Method" is set to `Post`. The default YAML installation of $AESproductName$ uses `/.ambassador/oauth2/redirection-endpoint` for the URL, so the values should be the domain name that points to $AESproductName$, e.g., `example.com/.ambassador/oauth2/redirection-endpoint` and `example.com`.

  ## <img src="../../images/Auth0_none.png" alt="Application Settings" />

  Click Advanced Settings > Grant Types and check "Authorization Code"

## Configure Filter and FilterPolicy

Update the Auth0 `Filter` and `FilterPolicy`. You can get the `ClientID` and `secret` from your application settings:

  ## <img src="../../images/Auth0_secret.png" alt="Auth0 Managment API" />

   The `audience` is the API Audience of your Auth0 Management API:

  ## <img src="../../images/Auth0_audience.png" alt="Auth0 Managment API audience" />

   The `authorizationURL` is your Auth0 tenant URL.

   ```yaml
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Filter
   metadata:
     name: auth0-filter
     namespace: default
   spec:
     OAuth2:
       authorizationURL: https://datawire-ambassador.auth0.com
       extraAuthorizationParameters:
         audience: https://datawire-ambassador.auth0.com/api/v2/
       clientID: fCRAI7svzesD6p8Pv22wezyYXNg80Ho8
       secret: CLIENT_SECRET
       protectedOrigins:
       - origin: https://datawire-ambassador.com
   ```

   ```yaml
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: FilterPolicy
   metadata:
     name: httpbin-policy
     namespace: default
   spec:
     rules:
       - host: "*"
         path: /httpbin/ip
         filters:
           - name: auth0-filter ## Enter the Filter name from above
             arguments:
               scope:
               - "openid"
   ```

  **Note:** By default, Auth0 requires the `openid` scope.
