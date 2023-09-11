import Alert from '@material-ui/lab/Alert';

# Single Sign-On with Keycloak

With Keycloak as your IdP, you must create a `Client` to handle authentication
requests from $productName$. The below instructions are known to work
for Keycloak 4.8.

## Create an OAuth client in Keycloak

1. Under `Realm Settings`, record the `Name` of the realm your client is in. This value will be needed later.
2. Create a new client: navigate to Clients and select `Create`. Use the following settings:
   - `Client ID`: Any value (e.g. `ambassador`); this value will also be needed later.
   - `Client Protocol`: `"openid-connect"`
   - `Root URL`: Leave Blank

3. Click `Save`.

4. On the next screen, configure the following options:
   - `Access Type`: `"confidential"`
   - `Valid Redirect URIs`: `*`

5. Click `Save`.
6. Navigate to the `Mappers` tab in your Client and click `Create`.
7. Configure the following options:
   - `Protocol`: `"openid-connect"`.
   - `Name`: Any string. This is just a name to help identify the Mapper
   - `Mapper Type`: `"Audience"`
   - `Included Client Audience`: select from the dropdown the name of your Client. This value will be used later.

8. Click `Save`.

9. Configure client scope as desired in `Client Scopes`.
   (e.g. `offline_access`).  It's possible to set up Keycloak to not
   use scope by removing all of them from `Assigned Default Client Scopes`.

   **Note:** All scopes in `Assigned Default Client Scopes` must be included in
   the `FilterPolicy`.

## Configure OAuth2 Filter and FilterPolicy

1. Create an [OAuth2 Filter][] with the credentials from above:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: keycloak-oauth2-filter
     namespace: default
   spec:
     type: "oauth2"
     oauth2:
       authorizationURL: https://{{KEYCLOAK_URL}}/auth/realms/{{KEYCLOAK_REALM}}
       grantType: "AuthorizationCode"
       authorizationCodeSettings:
         clientID: {{CLIENT_ID}}  # Client ID from above
         clientSecret: {{CLIENT_SECRET}} # Client secret from Keycloak
         protectedOrigins:
         # The origin is the scheme and Host of your $productName$ endpoint
         - origin: https://{{AMBASSADOR_URL}}
           includeSubdomains: true
         clientAuthentication:
           jwtAssertion:
             audience: {{AUDIENCE}} # Your audience from Keycloak
   EOF
   ```

2. Create a [FilterPolicy resource][] to use the `Filter` created above

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: FilterPolicy
   metadata:
     name: keycloak-oauth2-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filterRefs:
       - name: keycloak-oauth2-filter # Filter name from above
         namespace: default # Filter namespace from above
         arguments:
           type: oauth2
           oauth2:
             sameSite: lax
             scope:
             - offline_access
   EOF
   ```

<Alert severity="success">
  <b>Success!</b> Your Services are now protected by Keycloak single sign-on using OAuth2 Filters!
</Alert>

[OAuth2 Filter]: ../../../custom-resources/filter-oauth2
[FilterPolicy resource]: ../../../custom-resources/filterpolicy
