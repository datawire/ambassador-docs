import Alert from '@material-ui/lab/Alert';

# Custom error responses

Custom error responses set overrides for HTTP response statuses generated either
by $productName$ or upstream services.

They can be configured either on the $productName$
[`Module`](../ambassador)
or on an [`Mapping`](../../using/intro-mappings/), the schema is identical. See
below for more information on [rule precedence](#rule-precedence).

- `on_status_code`: HTTP status code to match for this rewrite
  rule. Only 4xx and 5xx classes are supported.
- `body`: Describes the response body contents and format.
  + `content_type`: A string that sets the content type of the
    response.
  + `text_format`: A string whose value will be used as the new
    response body. `Content-Type` will default to `text/plain` if
    unspecified.
  + `json_format`: A config object whose keys and values will be
    serialized as JSON and used as the new response body.
  + `text_format_source`: Describes a file to be used as the
    response. If used, `filename` must be set and the file must exist
    on the $productName$ pod.
    * `filename`: A file path on the $productName$ pod that will be used
      as the new response body.

Only one of `text_format`, `json_format`, or `text_format_source` may be provided.

Custom response bodies are subject to Envoy's AccessLog substitution syntax
and variables, see [Envoy's documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#config-access-log-format-strings) for more information. 

Note that the AccessLog substitutions use `%` as a delimiter (for example,
`%RESPONSE_CODE%`). To include a literal `%` in a custom response body, use `%%`.
For example,

```
%%RESPONSE_CODE%% %RESPONSE_CODE%
```

would render as

```
%RESPONSE_CODE% 401
```

for a request that resulted in a response code of 401.

<Alert severity="Warning">
  If the <code>%</code> symbol is not escaped as above (<code>%%</code>), it may
  only be as part of an <a href="https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#config-access-log-format-strings">
  AccessLog substitution</a>, for example <code>%RESPONSE_CODE%</code> or
  <code>%PROTOCOL%</code>. If a <code>%</code> is neither part of a valid
  substitution nor an escape, $productName$ will ignore the custom error response.
</Alert>

## Simple response bodies

Simple responses can be be added quickly for convenience. They are inserted into
the manifest as either text or JSON:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
  namespace: ambassador
spec:
  config:
    error_response_overrides:
      - on_status_code: 404
        body:
          text_format: "File not found"
      - on_status_code: 500
        body:
          json_format:
            error: "Application error"
            status: "%RESPONSE_CODE%"
            cluster: "%UPSTREAM_CLUSTER%"
```
## File response bodies

For more complex response bodies a file can be returned as the response.
This could be used for a customer friendly HTML document for example.  Use
`text_format_source` with a `filename` set as a path on the $productName$ pod.
`content_type` should be used set the specific file type, such as `text/html`.

First configure the $productName$ module:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
  namespace: ambassador
spec:
  config:
    error_response_overrides:
      - on_status_code: 404
        body:
          content_type: "text/html"
          text_format_source:
            filename: '/ambassador/ambassador-errorpages/404.html'
```

Then create the config map containing the HTML file:

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ambassador-errorpages
  namespace: ambassador
data:
  404.html: |
    <html>
      <h1>File not found</h1>
      <p>Uh oh, looks like you found a bad link.</p>
      <p>Click <a href="index.html">here</a> to go back home.</p>
    </html>
```

Finally, mount the configmap to the $productName$ pod:

> **NOTE:** The following YAML is in [patch format](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/)
and does not represent the entire deployment spec.

```yaml
spec:
  template:
    spec:
      containers:
        - name: aes
          volumeMounts:
            - name: ambassador-errorpages
              mountPath: /ambassador/ambassador-errorpages
      volumes:
        - name: ambassador-errorpages
          configMap:
            name: ambassador-errorpages
```

## Known limitations

- `text_format`and `text_format_source` perform no string
escaping on expanded variables. This may break the structural integrity of your
response body if, for example, the variable contains HTML data and the response
content type is `text/html`. Be careful when using variables in this way, and
consider whether the value may be coming from an untrusted source like request
or response headers.
- The `json_format` field does not support sourcing from a file. Instead
consider using `text_format_source` with a JSON file and `content_type` set to
`application/json`.

## Rule precedence

If rules are set on both the `Module` and on a `Mapping`, the rule set on
the `Mapping` will take precedence, ignoring any `Module` rules. This is true
even if the rules are for different status codes. For example, consider this
configuration:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
  namespace: ambassador
spec:
  config:
    error_response_overrides:
      - on_status_code: 404
        body:
          text_format: "Global 404"
---
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: ambassador
  namespace: ambassador
spec:
  hostname: "*"
  prefix: /api/
  service: quote
  error_response_overrides:
    - on_status_code: 429
      body:
         text_format: "Per-mapping 429"
```
The `Mapping` rule will prevent an override on the 404 rule defined on the
`Module` for this `Mapping`. The rule on the `Mapping` will cause all rules on
the `Module` to be ignored, regardless of the status codes specified. A seperate
`Mapping` with no override rules defined will follow the 404 rule on the `Module`.

## Disabling response overrides

If error response overrides are set on the `Module`, they can be disabled on
individual mappings by setting
`bypass_error_response_overrides: true` on those mappings:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: quote-backend
  namespace: ambassador
spec:
  hostname: "*"
  prefix: /api/
  service: quote
  bypass_error_response_overrides: true
```

This is useful if a portion of the domain serves an API whose errors should not
be rewritten, but all other APIs should contain custom errors.
