# Use a key

To use the key, you or your end user will need to add a header to their requests with
the given header for each filter. 

For example, with a endpoint running at `https://${EDGE_STACK_IP}/api/my-service`, and the default filter of `x-api-key`
the following request will respond with HTTP status code `200`: 

```bash
curl -H "X-API-Key: ${MY_API_KEY}" https://staging-app.datawire.io/cloud/api/service-groups
```
