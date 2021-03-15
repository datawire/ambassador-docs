# Rate Limiting in Ambassador

Rate limiting in Ambassador is composed of two parts:

* `RateLimitService` that tells Ambassador what service to use for rate 
  limiting. (The Ambassador Edge Stack provides a `RateLimitService` 
  implementation for you).
* Labels that get attached to requests; a label is basic metadata that
  is used by the `RateLimitService` to decide which limits to apply to
  the request.

## Attaching labels to requests

There are two ways of setting labels on a request:

1. Per [`Mapping`](../mappings#configuring-mappings).  Labels set
   here will only apply to requests that use that Mapping

   ```yaml
   ---
   apiVersion: getambassador.io/v2
   kind: Mapping
   metadata:
     name: foo-app
   spec:
     prefix: /foo/
     service: foo
     labels:
       "my_first_label_domain":
       - "my_first_label_group":
         - "my_label_specifier_1"
         - "my_label_specifier_2"
       - "my_second_label_group":
         - "my_label_specifier_3"
         - "my_label_specifier_4"
       "my_second_label_domain":
       - ...
   ```

2. Globally, in the [`ambassador`
   `Module`](../../../running/ambassador).  Labels set here are
   applied to every single request that goes through Ambassador.  This
   includes requests go through a `Mapping` that sets more labels; for
   those requests, the global labels are prepended to each of the
   Mapping's label groups for the matching domain; otherwise the
   global labels are put in to a new label group named "default" for
   that domain.

   ```yaml
   ---
   apiVersion: getambassador.io/v2
   kind: Module
   metadata:
     name: ambassador
   spec:
     config:
       default_labels:
         "my_first_label_domain":
           defaults:
           - "my_label_specifier_a"
           - "my_label_specifier_b"
         "my_second_label_domain":
           defaults:
           - "my_label_specifier_c"
           - "my_label_specifier_d"
   ```

*Labels* on a request are lists of key/value pairs, organized in to
*label groups*.  Because a label group is a *list* of key/value pairs
(rather than a map),
- it is possible to have multiple labels with the same key
- the order of labels matters

Your Module and Mappings contain *label specifiers* that tell
Ambassador what labels to set on the request.

> Note: The terminology used by the Envoy documentation differs from
> the terminology used by Ambassador:
>
> | Ambassador      | Envoy             |
> |-----------------|-------------------|
> | label group     | descriptor        |
> | label           | descriptor entry  |
> | label specifier | rate limit action |

The Mappings' listing of the groups of specifiers have names for the
groups; the group names are useful for humans dealing with the YAML,
but are ignored by Ambassador, all Ambassador cares about are the
*contents* of the groupings of label specifiers.

There are 5 types of label specifiers in Ambassador:

<!-- This table is ordered the same way as the protobuf fields in
  `route_components.proto`.  There's also a 6th action:
  "header_value_match" (since Envoy 1.2), but Ambassador doesn't
  support it?  -->

| #             | Label Specifier                        | Action, in human terms                                                                                                                  | Action, in [Envoy gRPC terms][`envoy.api.v2.route.RateLimit.Action`]           |
|---------------|----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| 1             | `"source_cluster"`                     | Sets the label "`source_cluster`=«Envoy source cluster name»"                                                                           | `{ "source_cluster": {} }`                                                     |
| 2             | `"destination_cluster"`                | Sets the label "`destination_cluster`=«Envoy destination cluster name»"                                                                 | `{ "destination_cluster": {} }`                                                |
| 3             | `{ "my_key": { "header": "my_hdr" } }` | If the `my_hdr` header is set, then set the label "«`my_key`»=«Value of the `my_hdr` header»"; otherwise skip applying this label group | `{ "request_headers": { "header_name": "my_hdr", descriptor_key: "my_key" } }` |
| 4             | `"remote_address"`                     | Sets the label "`remote_address`=«IP address of the client»"                                                                            | `{ "remote_address": {} }`                                                     |
| 5             | `{ "generic_key": "my_val" }`          | Sets the label "`generic_key`=«`my_val`»"                                                                                               | `{ "generic_key": { "descriptor_value": "my_val" } }`                          |
| 5 (shorthand) | `"my_val"`                             | Shorthand for `{ "generic_key": "my_val" }`                                                                                             |                                                                                |

[`envoy.api.v2.route.RateLimit.Action`]: https://github.com/datawire/ambassador/blob/$branch$/api/envoy/api/v2/route/route_components.proto#L1328-L1439

1. The Envoy source cluster name is the name of the Envoy listener
   cluster that the request name in on.
2. The Envoy destination cluster is the name of the Envoy cluster that
   the Mapping routes the request to.  Typically, there is a 1:1
   correspondence between upstream services (pointed to by Mappings)
   and clusters.  You can get the name for a cluster from the
   diagnostics service or Edge Policy Console.
3. When setting a label from an HTTP request header, be aware that if
   that header is not set in the request, then the entire label group
   is skipped.
4. The IP address of the HTTP client could be the actual IP of the
   client talking directly to Ambassador, or it could be the IP
   address from `X-Forwarded-For` if Ambassador is configured to trust
   the `X-Fowarded-For` header.
5. `generic_key` allows you to apply a simple string label to requests
   flowing through that Mapping.

## Rate limiting requests based on their labels

This is determined by your `RateLimitService` implementation. 

The Ambassador Edge Stack provides a `RateLimitService` implementation that is 
configured by a `RateLimit` custom resource.

See the [AES RateLimit Reference](./rate-limits) for information on how 
to configure `RateLimit`s in Ambassador Edge Stack.

See the [Basic Rate Limiting](../../../howtos/rate-limiting-tutorial) for an 
example `RateLimitService` implementation for Ambassador OSS.