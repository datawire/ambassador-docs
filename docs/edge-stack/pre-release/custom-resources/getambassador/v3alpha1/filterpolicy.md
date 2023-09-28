import Alert from '@material-ui/lab/Alert';

# The **FilterPolicy** Resource (v3alpha1)

The `FilterPolicy` custom resource works in conjunction with the [Filter custom resource][] to define how and when $productName$ will
modify or intercept incoming requests before sending to your upstream Service. `Filters` define what actions to take on a request,
while `FilterPolicies` define the matching criteria for requests such as the headers, hostname, and path, and supply references to
one or more `Filters` to execute on those requests.

<br />

This doc is an overview of all the fields on the `FilterPolicy` Custom Resource with descriptions of the purpose, type, and default values of those fields.
This page is specific to the `getambassador.io/v3alpha1` version of the `FilterPolicy` resource. For the newer `gateway.getambassador.io/v1alpha1` resource,
please see [the v1alpha1 FilterPolicy api reference][].

<Alert severity="info">
    <code>v3alpha1</code> <code>FilterPolicies</code> can only be reference <code>v3alpha1</code> <code>Filters</code>.
</Alert>

<Alert severity="info">
    Filtering actions of all types in $productName$ are only ever executed on incoming requests and not on responses from your upstream Services.
</Alert>

## FilterPolicy API Reference

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: FilterPolicy
metadata:
  name: "example-filter-policy"
  namespace: "example-namespace"
spec: FilterPolicy
  ambassador_id: []string                # optional
  rules: []FilterPolicyRule              # required, minItems: 1
  - host: string                         # required
    path: string                         # required
    precedence: int                      # optional
    filters: []FilterReference           # required, minItems: 1
    - name: string                       # required
      namespace: string                  # optional, default is the same namespace as the FilterPolicy
      onDeny: Enum                       # optional, default="break"
      onAllow: Enum                      # optional, default="continue"
      ifRequestHeader: HTTPHeaderMatch   # optional
        name: string                     # required
        value: string                    # optional, default is any non-empty string
        valueRegex: string               # optional, default is any non-empty string
        negate: bool                     # optional, default=false
      arguments: FilterArguments         # optional
```

### FilterPolicy

| **Field**        | **Type**                   | **Description**                                                                   |
|------------------|----------------------------|-----------------------------------------------------------------------------------|
| `ambassador_id`  | \[\]`string`                 | Ambassador id accepts a list of strings that allow you to restrict which instances of $productName$ can use/view this resource. If `ambassador_id` is configured, then only Deployments of $productName$ with a matching `AMBASSADOR_ID` environment variable will be able to use this resource. |
| `rules`          | \[\][FilterPolicyRule][]   | Set of matching rules that are checked against incoming request to determine which set of Filter's to apply. If no matches are found then the request is allowed through to the upstream service without executing any Filters. |

### FilterPolicyRule

Configures matching rules that are checked against incoming request to determine which `Filter` to apply (if any).

| **Field**    | **Type**                 | **Description**                                                                   |
|--------------|--------------------------|-----------------------------------------------------------------------------------|
| `host`       | `string`                 | "glob-string" that matches on the `:authority` header of the incoming request. If not set it will match on all incoming requests. |
| `path`       | `string`                 | "glob-string" that matches on the request path. If not provided then it will match on all incoming requests. |
| `precedence` | `int`                    | Allows forcing a precedence ordering on the rules. By default the rules are evaluated in the order they are in the `FilterPolicy.spec.rules` field. However, multiple FilterPolicy's can be applied to a cluster. To ensure that a specific ordering is enforced then using a precedence is an option. |
| `filters`    | \[\][FilterReference][]  | List of references to `Filters` that will be applied to the incoming request. Filters will be applied to the request in the order they are listed. If no filters are provided then the request will be allowed through to the upstream service without any additional processing. This allows for having one Rule that is overly permissive and then using a single rule to opt-out on certain paths. |

**Note:** The wildcard `*` is supported for both `path` and `host`.

When multiple Filters are specified in a rule:

- The filters are gone through in order
- Each filter may either:
  - return a direct HTTP *response*, intended to be sent back to the requesting HTTP client (normally *denying* the request from being forwarded to the upstream service) OR
  - return a modification to make to the HTTP *request* before sending it to other filters or the upstream service (normally *allowing* the request to be forwarded to the upstream service with modifications).
- If a filter has an `ifRequestHeader` setting, the filter is skipped
   unless the request (including any modifications made by earlier
   filters) has the HTTP header field `name`
   set to (or not set to if `negate: true`):
  - a non-empty string if neither `value` nor `valueRegex` are set
  - the exact string `value` (case-sensitive) (if `value` is set)
  - a string that matches the regular expression `valueRegex` (if
      `valueRegex` is set).  This uses [RE2][] syntax (always, not
      obeying [`regex_type`][] in the Ambassador module) but does not
      support the `\C` escape sequence.
- Modifications to the request are cumulative; later filters have access to _all_ headers inserted by earlier filters.

### FilterReference

A refernce to a filter to be executed when an incoming request matches the `FilterPolicy` Rule

| **Field**         | **Type**                          | **Description**                                                                   |
|-------------------|-----------------------------------|-----------------------------------------------------------------------------------|
| `name`            | `string`                          | Name that identifies the Filter |
| `namespace`       | `string`                          | Kubernetes namespace that the Filter resides. It must be a RFC 1123 label. Valid values include: `"example"`, Invalid values include: `"example.com"` (`.` is an invalid character). This validation is based off of the [corresponding Kubernetes validation]. |
| `onDeny`          | `Enum` (`"break"`,`"continue"`)   | Determines the behavior when a Filter denies the request. |
| `onAllow`         | `Enum` (`"break"`,`"continue"`)   | Determines the behavior when a Filter allows the request. |
| `ifRequestHeader` | [HTTPHeaderMatch][]               | Checks if exact or regular expression matches a value in a request Header to determine if an individual Filter is executed or not. |
| `arguments`       | [FilterArguments][]               | Untyped map that allows for additional configuration specific to each filter to be provided |

**onDeny Options**:

- `"break"`: End processing, and return the response directly to
   the requesting HTTP client.  Later filters are not called.  The request is not forwarded to the upstream service.
- `"continue"`: Continue processing.  The request is passed to the
   next filter listed; or if at the end of the list, it is forwarded to the upstream service.  The HTTP response returned from the filter is discarded.

**onAllow Options**:

- `"break"`: Apply the modification to the request, then end filter processing, and forward the modified request to the upstream service.  Later filters are not called.
- `"continue"`: Continue processing.  Apply the request modification, then pass the modified request to the next filter
     listed; or if at the end of the list, forward it to the upstream service.

### HTTPHeaderMatch

Checks if exact or regular expression matches a value in a request Header to determine if an individual Filter is executed or not.

| **Field**    | **Type**                                | **Description**                                                                   |
|--------------|-----------------------------------------|-----------------------------------------------------------------------------------|
| `name`       | `string`                                | Name of the header to match. Matching MUST be case insensitive. (See [https://tools.ietf.org/html/rfc7230][]). Valid examples: `"Authorization"`/`"Set-Cookie"`. Invalid examples: `":method"` - `:` is an invalid character. This means that HTTP/2 pseudo headers are not currently supported by this type. `"/invalid"` - `/` is an invalid character. |
| `value`      | `string`                                | Value of the HTTP Header to be matched. Only one of `value` or `valueRegex` can be configured |
| `valueRegex` | `string`                                | Regex expression for matching the value of the HTTP Header. Only one of `value` or `valueRegex` can be configured |
| `negate`     | `bool`                                  | Allows the match criteria to be negated or flipped. For example, you can have a regex that checks for any non-empty string which would indicate would translate to if header exists on request then match on it. With negate turned on this would translate to match on any request that doesn't have a header. |

### FilterArguments

The Filter arguments fiels is an untyped map that allows for additional configuration specific to each filter to be provided.
Refer to the usage guides for each filter type to see if it has any arguments that can be supplied.

[FilterPolicyRule]: #filterpolicyrule
[FilterReference]: #filterreference
[FilterArguments]: #filterarguments
[HTTPHeaderMatch]: #httpheadermatch
[Filter custom resource]: ../filter
[the v1alpha1 FilterPolicy api reference]: ../../../gateway-getambassador/v1alpha1/filterpolicy
[corresponding Kubernetes validation]: https://github.com/kubernetes/apimachinery/blob/02cfb53916346d085a6c6c7c66f882e3c6b0eca6/pkg/util/validation/validation.go
[https://tools.ietf.org/html/rfc7230]: https://tools.ietf.org/html/rfc7230
