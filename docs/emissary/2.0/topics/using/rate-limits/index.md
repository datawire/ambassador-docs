import Alert from '@material-ui/lab/Alert';

# Basic rate limiting

Rate limiting in $productName$ is composed of two parts:

* The [`RateLimitService`](../../running/services/rate-limit-service) resource tells $productName$ what external service
  to use for rate limiting.

    <Alert severity="info">If $productName$ cannot contact the rate limit service, it will allow the request to be processed as if there were no rate limit service configuration.</Alert>

* _Labels_ that get attached to requests. A label is basic metadata that
  is used by the `RateLimitService` to decide which limits to apply to
  the request.

    <Alert severity="info">
      These <code>labels</code> require <code>Mapping</code> resources with <code>apiVersion</code>
      <code>getambassador.io/v2</code> or newer &mdash; if you're updating an old installation, check the
      <code>apiVersion</code>!
    </Alert>

Labels are grouped according to _domain_ and _group_:

```yaml
labels:
  "domain1":
  - "group1":
    - "my_label_specifier_1"
    - "my_label_specifier_2"
  - "group2":
    - "my_label_specifier_3"
    - "my_label_specifier_4"
  "domain2":
  - ...
```

The names of domains and groups are not interpreted by $productName$ in any way:
they are solely there to help configuration authors remember the different groupings.
Note that **at present, rate limiting supports just one domain**: the name of the
domain must be configured in the [`RateLimitService`](../../running/services/rate-limit-service).



## Attaching labels to requests

There are two ways of setting labels on a request:

1. You can set labels on an individual [`Mapping`](../mappings
   will only apply to requests that use that `Mapping`.

   ```yaml
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: foo-mapping
   spec:
     hostname: "*"
     prefix: /foo/
     service: foo
     labels:
       "domain1":
       - "group1":
         - "my_label_specifier_1"
         - "my_label_specifier_2"
       - "group2":
         - "my_label_specifier_3"
         - "my_label_specifier_4"
       "domain2":
       - ...
   ```

2. You can set global labels in the [`ambassador` `Module`](../../running/ambassador).
   These labels will apply to _every_ request that goes through $productName$.

   ```yaml
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Module
   metadata:
     name: ambassador
   spec:
     config:
       default_labels:
         "domain1":
           defaults:
           - "my_label_specifier_a"
           - "my_label_specifier_b"
         "domain2":
           defaults:
           - "my_label_specifier_c"
           - "my_label_specifier_d"
   ```

   If a `Mapping` and the defaults both give label groups for the same domain, the
   default labels are prepended to each label group from the `Mapping`. If the `Mapping`
   does not give any labels for that domain, the global labels are placed into a new
   label group named "default" for that domain.

Each label group is a list of labels; each label is a key/value pair. Since the label
group is a list rather than a map:
- it is possible to have multiple labels with the same key, and
- the order of labels matters.

> Note: The terminology used by the Envoy documentation differs from
> the terminology used by $productName$:
>
> | $productName$   | Envoy             |
> |-----------------|-------------------|
> | label group     | descriptor        |
> | label           | descriptor entry  |
> | label specifier | rate limit action |

The `Mapping`s' listing of the groups of specifiers have names for the
groups; the group names are useful for humans dealing with the YAML,
but are ignored by $productName$, all $productName$ cares about are the
*contents* of the groupings of label specifiers.

There are 5 types of label specifiers in $productName$:

<!-- This table is ordered the same way as the protobuf fields in
  `route_components.proto`.  There's also a 6th action:
  "header_value_match" (since Envoy 1.2), but $productName$ doesn't
  support it?  -->

1. `source_cluster`

    ```yaml
    source_cluster:
      key: source_cluster
    ```

    Sets the label `source_cluster=«Envoy source cluster name»"`. The Envoy
    source cluster name is the name of the Envoy cluster that the request came
    in on.

    The syntax of this label currently _requires_ `source_cluster: {}`.

2. `destination_cluster`

    ```yaml
    destination_cluster:
      key: destination_cluster
    ```

    Sets the label `destination_cluster=«Envoy destination cluster name»"`. The Envoy
    destination cluster name is the name of the Envoy cluster to which the `Mapping`
    routes the request. You can get the name for a cluster from the
    [diagnostics service](../../running/diagnostics).

    The syntax of this label currently _requires_ `destination_cluster: {}`.

3. `remote_address`

    ```yaml
    remote_address:
      key: remote_address
    ```

    Sets the label `remote_address=«IP address of the client»"`. The IP address of
    the client will be taken from the `X-Forwarded-For` header, to correctly manage
    situations with L7 proxies. This requires that $productName$ be correctly
    [configured to communicate](../../../howtos/configure-communications).

    The syntax of this label currently _requires_ `remote_address: {}`.

4. `request_headers`

    ```yaml
    request_headers:
      header_name: "header-name"
      key: mykey
    ```

    If a header named `header-name` is present, set the label `mykey=«value of the header»`.
    If no header named `header-name` is present, **the entire label group is dropped**.

5. `generic_key`

    ```yaml
    generic_key:
      key: mykey
      value: myvalue
    ```

    Sets the label `«mykey»=«myval»`. Note that supplying a `key` is supported only
    with the Envoy V3 API: if you are using Envoy V2, the `key` will always be the
    constant `generic_key`.

## Rate limiting requests based on their labels

This is determined by your `RateLimitService` implementation. See the
[Basic Rate Limiting tutorial](../../../howtos/rate-limiting-tutorial) for an
example `RateLimitService` implementation for $productName$.

If you'd rather not write your own `RateLimitService` implementation,
$AESproductName$ provides a `RateLimitService` implementation that is
configured by a `RateLimit` custom resource. See the
[$AESproductName$ RateLimit Reference](/docs/edge-stack/latest/topics/using/rate-limits/rate-limits/)
for more information.
