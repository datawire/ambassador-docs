import Alert from '@material-ui/lab/Alert';

# Rate Limiting on Token Claims

<Alert severity="info">This guide applies to Ambassador Edge Stack, use of this guide on the Ambassador API Gateway is not recommended.</Alert>

Ambassador Edge Stack is able to perform Rate Limiting based on JWT Token claims from either a JWT or OAuth2 Filter implementation.  This is because Edge Stack deliberately calls the `ext_authz` filter in Envoy as the first step when processing incoming requests.  In Edge Stack, the `ext_authz` filter is implemented as a [Filter resource](../../topics/using/filters/).  This explicitly means that Ambassador Filters are ALWAYS processed prior to RateLimit implementations.  As a result, you can use the `injectRequestHeader` field in either a JWT Filter or an OAuth Filter and pass that header along to be used for RateLimiting purposes.

## Prerequisites

- Ambassador Edge Stack
- A working Keycloak instance and Keycloak Filter
- A service exposed with a Mapping and protected by a FilterPolicy

<Alert severity="info">We'll uses Keycloak to generate tokens with unique claims.  It will work in a similar manner for any claims present on a JWT token issued by any other provider.  See <a href="../sso/keycloak/">our guide here</a> on using Keycloak with Edge Stack.</Alert>

Here is a YAML example that describes the setup:

```yaml
---
# Mapping to expose the Quote of the Moment service
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: quote-backend
spec:
  prefix: /backend/
  service: quote
---
# Basic OAuth filter for Keycloak
apiVersion: getambassador.io/v2
kind: Filter
metadata:
  name: keycloak-filter-ambassador
spec:
  OAuth2:
    authorizationURL: https://<my-keycloak-domain>/auth/realms/<realm>
    audience: <client>
    clientID: <client>
    secret: <client-secret>
    protectedOrigins:
    - origin: https://host.example.com
---
# Basic FilterPolicy that covers everything
apiVersion: getambassador.io/v2
kind: FilterPolicy
metadata:
  name: ambassador-policy
spec:
  rules:
    - host: "*"
      path: "*"
      filters:
      - name: keycloak-filter-ambassador
```

## 1. Configure the Filter to extract the claim

In order to extract the claim, we need to have the Filter use the `injectRequestHeader` config and use a golang template to pull out the exact value of the `name` claim in our access token JWT and put it in a Header for our RateLimit to catch.  Configuration is similar for both [OAuth2](../../topics/using/filters/oauth2/#oauth-resource-server-settings) and [JWT](../../topics/using/filters/jwt/).

```yaml
apiVersion: getambassador.io/v2
kind: Filter
metadata:
  name: keycloak-filter-ambassador
spec:
  OAuth2:
    authorizationURL: https://<my-keycloak-domain>/auth/realms/<realm>
    audience: <client>
    clientID: <client>
    secret: <client-secret>
    protectedOrigins:
    - origin: https://host.example.com
    injectRequestHeaders:
    - name: "x-token-name"
      value: "{{ .token.Claims.name }}" # This extracts the "name" claim and puts it in the "x-token-name" header.
```

## 2. Add Labels to our Mapping

Now that the header is properly added, we need to add a label to the Mapping of the service that we want to rate limit.  This will determine if the route established by the Mapping will use a label when Ambassador is processing where to send the request.  If so, it will add the labels as metadata to be attached when sent to the `RateLimitService` to determine whether or not the request should be rate-limited.

<Alert severity="info">Use `ambassador` as the label domain, unless you have already set up Ambassador Edge Stack to use something else.</Alert>

```yaml
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: quote-backend
spec:
  prefix: /backend/
  service: quote
  labels:
    ambassador:
    - header_request_label:
      - headerkey: [{header: "x-token-name"}] # In pattern matching, they key queried will be "headerkey" and the value queried will be the value of "x-token-name" header
```

## 3. Create our RateLimit

We now have appropriate labels added to the request when we send it to the rate limit service, but how do we know what rate limit to apply and how many requests should we allow before returning an error?  This is where the RateLimit comes in.  The RateLimit allows us to create specific rules based on the labels associated with a particular request.  If a value is not specified, then each unique value of the `x-token-name` header that comes in will be associated with its own counter.  So, someone with a `name` JWT claim of "Julian" will be tracked separately from "Jane".

```yaml
---
apiVersion: getambassador.io/v2
kind: RateLimit
metadata:
  name: token-name-rate-limit
spec:
  domain: ambassador
  - name: token-name-per-minute
    action: Enforce
    pattern:
    - headerkey: "" # Each unique header value of "x-token-name" will be tracked individually
    rate: 10
    unit: "minute" # Per-minute tracking is useful for debugging
```

## 4. Test

Now we can navigate to our backend in a browser at `https://host.example.com/backend/`.  After logging in, if we keep refreshing, we will find that our 11th attempt will respond with a blank page.  Success!

## 5. Enforce a different rate limit for a specific user

We've noticed that the user "Julian" uses bad code that abuses the API and consumes way too much bandwidth with his retries.  As such, we want a user with the exact `name` claim of "Julian" to only get 2 requests per minute before getting an error.

```yaml
---
apiVersion: getambassador.io/v2
kind: RateLimit
metadata:
  name: token-name-rate-limit
spec:
  domain: ambassador
  limits:
  - name: julians-rule-enforcement
    action: Enforce
    pattern:
    - headerkey: "Julian" # Only matches for x-token-name = "Julian"
    rate: 2
    unit: "minute"
  - name: token-name-per-minute
    action: Enforce
    pattern:
    - headerkey: "" # Each unique header value of "x-token-name" will be tracked individually
    rate: 10
    unit: "minute" # Per-minute tracking is useful for debugging
```

This tutorial only scratches the surface of the rate limiting capabilities of Edge Stack.  Please see our documentation [here](../../topics/using/rate-limits/) and [here](../../topics/using/rate-limits/rate-limits/) to learn more about how you can use rate limiting.
