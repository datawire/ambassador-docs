import Alert from '@material-ui/lab/Alert';

# SSO with User Account and Authentication Service (UAA)

<Alert severity="warning">
  <b>IMPORTANT!</b> $productName$ requires the IdP to return a JWT signed by the <code>RS256</code> algorithm (asymmetric key). Cloud Foundry's UAA defaults to symmetric key encryption, which $productName$ cannot read.
</Alert>

## Create an OIDC Client in UAA

1. When configuring UAA, you must provide your own asymmetric key in a file called `uaa.yml`. For example:

   ```yaml
   jwt:
      token:
         signing-key: |
            -----BEGIN RSA PRIVATE KEY-----
            MIIEpAIBAAKCAQEA7Z1HBM6QFqnIJ1UA3NWnYMuubt4XlfbP1/GopTWUmchKataM
            ...
            ...
            QSbJdIbUBwL8BcrfNw4ebp1DgTI9F45Re+evky0A82aL0/BvBHu8og==
            -----END RSA PRIVATE KEY-----
   ```

2. Create an OIDC Client:

   ```bash
   uaac client add ambassador --name ambassador-client --scope openid --authorized_grant_types authorization_code,refresh_token --redirect_uri {AMBASSADOR_URL}/.ambassador/oauth2/redirection-endpoint --secret CLIENT_SECRET
   ```

   **Note:** Change the value of `{AMBASSADOR_URL}` with the IP or DNS of your $productName$ load balancer.

## Configure an OAuth2 Filter and FilterPolicy

1. Create an [OAuth2 Filter][] with the credentials from above:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: uaa-oauth2-filter
     namespace: default
   spec:
     type: "oauth2"
     oauth2:
       authorizationURL: {UAA_DOMAIN} # Your domain from UAA
       grantType: "AuthorizationCode"
       authorizationCodeSettings:
         clientID: ambassador
         clientSecret: {{CLIENT_SECRET}} # Client secret from above
         protectedOrigins:
         # The origin is the scheme and Host of your $productName$ endpoint
         - origin: http(s)://{{AMBASSADOR_URL}}
           includeSubdomains: true
         clientAuthentication:
           jwtAssertion:
             audience: {{AUDIENCE}} # Your audience from UAA
   EOF
   ```

   <Alert severity="info">
     The <code>authorizationURL</code> and <code>audience</code> are the same for UAA configuration.
   </Alert>

2. Create a [FilterPolicy resource][] to use the `Filter` created above

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: FilterPolicy
   metadata:
     name: uaa-oauth2-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filterRefs:
       - name: uaa-oauth2-filter # Filter name from above
         namespace: default # Filter namespace from above
         arguments:
           type: oauth2
           oauth2:
             sameSite: lax
             # The scope was set when creating the client above
             # You can add any other scope values at that time and include them here
             scope:
             - openid
   EOF
   ```

<Alert severity="success">
  <b>Success!</b> Your Services are now protected by UAA single sign-on using OAuth2 Filters!
</Alert>

[OAuth2 Filter]: ../../../custom-resources/filter-oauth2
[FilterPolicy resource]: ../../../custom-resources/filterpolicy
