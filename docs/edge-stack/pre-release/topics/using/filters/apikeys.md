import Alert from '@material-ui/lab/Alert';

# Using The API Keys Filter

The `APIKey Filter` validates API Keys present in HTTP headers. The list of authorized API Keys is defined directly in a Secret.
If an incoming request does not have the header specified by the `APIKey Filter` or it does not contain one of the key values
configured by the `Filter` then the request is denied.

<br />

See the [API Key Filter API reference][] for an overview of all the supported fields.

## APIKey Filter Quickstart

1. Come up with an API Key value to use. For this example, we're going to use the string `example-apikey-value`

2. Convert the API Key value to [base64][].

   You can do this however you prefer, such as with an online tool like [base64encode.org][] or with the terminal:

   ```console
   $ echo -n example-api-key-value  | base64
     ZXhhbXBsZS1hcGkta2V5LXZhbHVl
   ```

3. Create an [APIKey Filter][] with the encoded API Key from above:

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: v1
   kind: Secret
   metadata:
     name: apikey-filter-keys
   type: Opaque
   data:
     key-1: ZXhhbXBsZS1hcGkta2V5LXZhbHVl
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Filter
   metadata:
     name: apikey-filter
     namespace: default
   spec:
     APIKey:
       httpHeader: "example-key-header"
       keys:
       - secretName: apikey-filter-keys
   EOF
   ```

   <Alert severity="info">
   If you want to create more APIKeys, you can continue to add them to your secret. The keys (<code>key-1</code> in the example) used in the Secret do not matter, so you can name them whatever helps you keep track of the associated API Keys.
   </Alert>

4. Create a [FilterPolicy resource][] to use the `Filter` created above

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: FilterPolicy
   metadata:
     name: apikey-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filters:
       - name: apikey-filter # Filter name from above
         namespace: default # Filter namespace from above
   EOF
   ```

5. Send a request with the APIKey header

   ```console
   $ curl -ki http://$GATEWAY_HOST/backend/

     *   Trying 34.123.30.63:80...
     * Connected to 34.123.30.63 (34.123.30.63) port 80 (#0)
     > GET /backend/ HTTP/1.1
     > Accept: */*
     >
     < HTTP/1.1 403 Forbidden
     < content-type: application/json
     < server: envoy
     <
     {"message":"API key not found","requestId":"","statusCode":403}
   ```

   <Alert severity="info">
   The request was denied because the header was not found, but it will also be denied if you send the correct header with an invalid API Key.
   </Alert>

6. Send a request with the APIKey header and value.

   ```console
   $ curl -ki http://$GATEWAY_HOST/backend/ -H "example-key-header: example-api-key-value"

     > GET /backend/ HTTP/1.1
     > Accept: */*
     > example-key-header: example-api-key-value
     >
     < HTTP/1.1 200 OK
     < content-type: application/json
     < server: envoy
     <
     {
         "server": "buoyant-raspberry-ju848o1i",
         "quote": "A principal idea is omnipresent, much like candy.",
         "time": "2023-08-04T03:40:45.594594388Z"
     }
   ```

   <Alert severity="success">
     <b>Success!</b> Your requests are now validated against an APIKey Filter and will be denied if they do not supply a valid API key!
   </Alert>

[API Key Filter API reference]: ../../../../custom-resources/getambassador.io/v3alpha1/filter-apikey
[APIKey Filter]: ../../../../custom-resources/getambassador.io/v3alpha1/filter-apikey
[FilterPolicy resource]: ../../../../custom-resources/getambassador.io/v3alpha1/filterpolicy
[base64encode.org]: https://www.base64encode.org/
[base64]: https://en.wikipedia.org/wiki/Base64
