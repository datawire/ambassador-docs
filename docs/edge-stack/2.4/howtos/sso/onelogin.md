# Single Sign-On with OneLogin

OneLogin is an application that manages authentication for your users on your network, and can provide backend access to $AESproductName$.

To use OneLogin with $AESproductName$:

1. Create an App Connector
2. Gather OneLogin Credentials
3. Configure $AESproductName$

## Create an App Connector

To use OneLogin as your IdP, you will first need to create an OIDC custom connector and create an application from that connector.

**To do so**:

1. In your OneLogin portal, select **Administration** from the top right.
2. From the top left menu, select **Applications > Custom Connectors** and click the **New Connector** button.
3. Give your connector a name.
4. Select the `OpenID Connect` option as your "Sign on method."
5. Use `http(s)://{{AMBASSADOR_URL/.ambassador/oauth2/redirection-endpoint` as the value for "Redirect URI."
6. Optionally provide a login URL.
7. Click the **Save** button to create the connector. You will see a confirmation message.
8. In the "More Actions" tab, select **Add App to Connector**.
9. Select the connector you just created.
10. Click the **Save** button.

You will see a success banner, which also brings you back to the main portal page. OneLogin is now configured to function as an OIDC backend for authentication with $AESproductName$.

## Gather OneLogin Credentials

Next, configure $AESproductName$ to require authentication with OneLogin, so you must collect the client information credentials from the application you just created.

**To do so:**

1. In your OneLogin portal, go to **Administration > Applications > Applications.**
2. Select the application you previously created.
3. On the left, select the **SSO** tab to see the client information.
4. Copy the value of Client ID for later use.
5. Click the **Show Client Secret** link and copy the value for later use.

## Configure $AESproductName$

Now you must configure your $AESproductName$ instance to use OneLogin.

1. First, create an [OAuth Filter](../../../topics/using/filters/oauth2) with the credentials you copied earlier.

Here is an example YAML:

```yaml
    apiVersion: getambassador.io/v3alpha1
    kind: Filter
    metadata:
    name: onelogin
    spec:
    OAuth2:
        # onelogin openid-configuration endpoint can be found at https://{{subdomain}}.onelogin.com/oidc/.well-known/openid-configuration
        authorizationURL: https://{{subdomain}}.onelogin.com/oidc
        clientID: {{Client ID}}
        secret: {{Client Secret}}
        # The protectedOrigin is the scheme and Host of your $AESproductName$ endpoint
        protectedOrigins:
        - origin: httpi(s)://{{AMBASSADOR_URL}}
```

2. Next, create a [FilterPolicy](../../../topics/using/filters/) to use the `Filter` you just created.

Some example YAML:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: FilterPolicy
metadata:
  name: oauth-policy
spec:
  rules:
      # Requires authentication on requests from any hostname
    - host: "*"
    # Tells $AESproductName$ to apply the Filter only on request to the /backend/get-quote/ endpoint from the quote application
    path: /backend/get-quote/
    # Identifies which Filter to use for the path and host above
    filters:
      - name: onelogin
```

3. Lastly, apply both the `Filter` and `FilterPolicy` you created with a `kubectl` command in your terminal:

```
kubectl apply -f onelogin-filter.yaml
kubectl apply -f oauth-policy.yaml
```

Now any requests to `https://{{AMBASSADOR_URL}}/backend/get-quote/` will require authentication from OneLogin.
