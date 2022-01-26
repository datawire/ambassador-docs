# Advanced rate limiting

$productName$ features a built-in [Rate Limit Service (RLS)](../../topics/running/services/rate-limit-service/#external-rate-limit-service). The $productName$ RLS uses a decentralized configuration model that enables individual teams the ability to independently manage [rate limits](https://www.getambassador.io/learn/kubernetes-glossary/rate-limiting) independently.

All of the examples on this page use the backend service of the quote sample application to illustrate how to perform the rate limiting functions.

## Rate Limiting in $productName$

In $productName$, the `RateLimit` resource defines the policy for rate limiting. The rate limit policy is applied to individual requests according to the labels you add to the `Mapping` resource. This allows you to assign labels based on the particular needs of you rate limiting policies and apply the `RateLimit` policies to only the domains in the related `Mapping` resource.

You can apply the `RateLimit` policy globally to all requests with matching labels from the `Module` resource. This can be used in conjunction with the `Mapping` resource to have a global rate limit with more granular rate limiting for specific requests that go through that specific `Mapping` resource.

 In order for you to enact rate limiting policies:

* Each domain you target needs to have labels.
* For individual request, the service's `Mapping` resource needs to contain the labels related to the domains you want to apply the rate limiting policy to.
* For global requests, the service's `Module` resource needs to contain the labels related to the policy you want to apply.
* The `RateLimit` resource needs to set the rate limit policy for the labels the `Mapping` resource.


## Rate limiting for availability

Global rate limiting applies to the entire Kubernetes service mesh. This example shows how to limit the `quote` service to 3 requests per minute.

1. First, add a request label to the `request_label_group` of the `quote` service's `Mapping` resource. This example uses `backend` for the label:

  ```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: Mapping
  metadata:
    name: quote-backend
  spec:
    hostname: "*"
    prefix: /backend/
    service: quote
    labels:
      ambassador:
        - request_label_group:
          - generic_key:
              value: backend
  ```

  Apply the mapping configuration changes with `kubectl apply -f quote-backend.yaml`.

  <Alert severity="info">
  You need to use <code>v2</code> or later for the <code>apiVersion</code> in the <code>Mapping</code> resource. Previous versions do not support <code>labels</code>.
  </Alert>

2. Next, configure the `RateLimit` resource for the service. Create a new YAML file named `backend-ratelimit.yaml` and apply the rate limit details as follows:

  ```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: RateLimit
  metadata:
    name: backend-rate-limit
  spec:
    domain: ambassador
    limits:
     - pattern: [{generic_key: backend}]
       rate: 3
       unit: minute
  ```

  In the code above, the `generic_key` is a hard-coded value that is used when you add a single string label to a request.

3. Deploy the rate limit with `kubectl apply -f backend-ratelimit.yaml`.

## Per user rate limiting

Per user rate limiting enables you to apply the defined rate limit to specific IP addresses. To allow per user rate limits, you need to make sure you've properly configured $productName$ to [propagate your original client IP address](../../topics/running/ambassador/#trust-downstream-client-ip).

This example shows how to use the `remote_address` special value in the mapping to target specific IP addresses:

1. Add a request label to the `request_label_group` of the `quote` service's `Mapping` resource. This example uses `remote_address` for the label:

  ```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: Mapping
  metadata:
    name: quote-backend
  spec:
    hostname: "*"
    prefix: /backend/
    service: quote
    labels:
      ambassador:
        - request_label_group:
          - remote_address:
              key: remote_address
  ```

2. Update the rate limit amounts for the `RateLimit` service and enter the `remote_address` to the following pattern:

  ```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: RateLimit
  metadata:
    name: backend-rate-limit
  spec:
    domain: ambassador
    limits:
     - pattern: [{remote_address: "*"}]
       rate: 3
       unit: minute
  ```

## Load shedding

Another technique for rate limiting involves load shedding. With load shedding, you can define which HTTP request method to allow or deny.

This example shows how to implement load per user rate limiting along with load shedding on `GET` requests.
To allow per user rate limits, you need to make sure you've properly configured $productName$ to [propagate your original client IP address](../../topics/running/ambassador#trust-downstream-client-ip).

1. Add a request labels to the `request_label_group` of the `quote` service's `Mapping` resource. This example uses `remote_address` for the per user limit, and `backend_http_method`for load shedding. The load shedding uses `":method"` to identify that the `RateLimit` will use a HTTP request method in its pattern.

  ```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: Mapping
  metadata:
    name: quote-backend
  spec:
    hostname: "*"
    prefix: /backend/
    service: quote
    labels:
      ambassador:
        - request_label_group:
          - remote_address:
              key: remote_address
          - request_headers:
              key: backend_http_method
              header_name: ":method"
  ```

2. Update the rate limit amounts for the `RateLimit` service.
For the rate limit `pattern`, include the `remote_address` IP address and the `backend_http_mthod`.

  ```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: RateLimit
  metadata:
    name: backend-rate-limit
  spec:
    domain: ambassador
    limits:
     - pattern: [{remote_address: "*"}, {backend_http_method: GET}]
       rate: 3
       unit: minute
  ```

  When a pattern has multiple criteria, the rate limit runs when when any of the rules of the pattern match. For the example above, this means either a `remote_address` or `backend_http_method` pattern triggers the rate limiting.

## Global rate limiting

Similar to the per user rate limiting, you can use [global rate limiting](../../topics/using/rate-limits) to assign a rate limit to any unique IP addresses call to your service. Unlike the previous examples, you need to add your labels to the `Module` resource rather than the `Mapping` resource. This is because the `Module` resource applies the labels to all the requests in $productName$, whereas  the labels in `Mapping` only apply to the requests that use that `Mapping` resource.

1. Add a request label to the `request_label_group` of the `quote` service's `Module` resource. This example uses the `remote_address` special value.

  ```yaml
  ---
  apiVersion: getambassador.io/v3alpha1
  kind: Module
  metadata:
    name: ambassador
  spec:
    config:
      use_remote_address: true
      default_label_domain: ambassador
      default_labels:
        ambassador:
          defaults:
          - remote_address:
              key: remote_address
  ```
2. Update the rate limit amounts for the `RateLimit` service and enter the `remote_address` to the following pattern:

  ```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: RateLimit
  metadata:
    name: global-rate-limit
  spec:
    domain: ambassador
    limits:
     - pattern: [{remote_address: "*"}]
       rate: 10
       unit: minute
  ```

### Bypassing a global rate limit

Sometimes, you may have an API that cannot handle as much load as others in your cluster. In this case, a global rate limit may not be enough to ensure this API is not overloaded with requests from a user. To protect this API, you can create a label that tells $productName$ to apply a stricter limit on requests.
In the example above, the global rate limit is defined in the `Module` resource. This applies the limit to all requests. In conjunction with the global limit defined in the `Module` resource, you can add more granular rate limiting to a `Mapping` resource, which will only apply to requests that use that 'Mapping'.

1. In addition to the configurations applied in the global rate limit example above, add an additional label to the `request_label_group` of the `Mapping` resource. This example uses `backend` for the label:

  ```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: Mapping
  metadata:
    name: quote-backend
  spec:
    hostname: "*"
    prefix: /backend/
    service: quote
    labels:
      ambassador:
        - request_label_group:
          - generic_key:
              value: backend
  ```

2. Now, the `request_label_group` contains both the `generic_key: backend` and the `remote_address` key applied from the global rate limit. This creates a separate `RateLimit` object for this route:

  ```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: RateLimit
  metadata:
    name: backend-rate-limit
  spec:
    domain: ambassador
    limits:
     - pattern: [{remote_address: "*"}, {generic_key: backend}]
       rate: 3
       unit: minute
  ```

  Requests to `/backend/` now are now limited after 3 requests. All other requests use the global rate limit policy.

## Rate limit matching rules

The following rules apply to the rate limit patterns:

* Patterns are order-sensitive and must be entered in the same order in which a request is labeled.
* Every label in a label group must exist in the pattern in order for matching to occur.
* By default, any type of failure lets the request pass through (fail open).
* $productName$ sets a hard timeout of 20ms on the rate limiting service. If the rate limit service does not respond within the timeout period, the request passes through.
* If a pattern does not match, the request passes through.

## Troubleshooting rate limiting

The most common source of failure of the rate limiting service occurs when the labels generated by $productName$ do not match the rate limiting pattern. By default, the rate limiting service logs all incoming labels from $productName$. Use a tool such as [Stern](https://github.com/wercker/stern) to watch the rate limiting logs from $productName$ and ensure the labels match your descriptor.

## More

For more on rate limiting, see the [rate limit guide](../../topics/using/rate-limits/).
