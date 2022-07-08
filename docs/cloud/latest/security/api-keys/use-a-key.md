# Use a key

Once the key has been provided, the end user can use it to request your service, 
by adding it as a header to all its requests.

For example, with a service serving on `https://${EDGE_STACK_IP}/api/my-service`,
the following request should respond with a `200`: 

```bash
curl -H "X-API-Key: ${MY_API_KEY}" https://staging-app.datawire.io/cloud/api/service-groups
```
