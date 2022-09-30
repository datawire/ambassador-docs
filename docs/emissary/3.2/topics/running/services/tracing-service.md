import Alert from '@material-ui/lab/Alert';

# Tracing service

Applications that consist of multiple services can be difficult to debug, as a single request can span multiple services. Distributed tracing tells the story of your request as it is processed through your system. Distributed tracing is a powerful tool to debug and analyze your system in addition to request logging and metrics.

When enabled, the `TracingService` will instruct $productName$ to initiate a trace on requests by generating and populating an `x-request-id` HTTP header. Services can make use of this `x-request-id` header in logging and forward it in downstream requests for tracing. $productName$ also integrates with external trace visualization services, including [LightStep](https://lightstep.com/) and Zipkin-compatible APIs such as [Zipkin](https://zipkin.io/) and [Jaeger](https://github.com/jaegertracing/) to allow you to store and visualize traces. You can read further on [Envoy's Tracing capabilities](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing).

A `TracingService` manifest configures $productName$ to use an external trace visualization service:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  TracingService
metadata:
  name:  tracing
spec:
  service: "example-zipkin:9411"
  driver: zipkin
  config: {}
  custom_tags:  # optional
  - tag: host
    request_header: 
      name: ":authority"
      default_value: "unknown"
  - tag: path
    request_header: 
      name: ":path"
      default_value: "unknown"
  sampling:
    overall: 100
```

| Field     | Description | values |
| --------- | ----------- | ------------- |
| `service` | gives the URL of the external HTTP trace service. | ex. `example-zipkin:9411` |
| `driver`  | provides the driver information that handles communicating with the service | enum:<br/>`lightstep`<br/>`zipkin`<br/>`datadog` |
| `config` | provides additional configuration options for the selected `driver`. Supported configuration for each driver is found below. | |
| `tag_headers` | **Deprecated** - it is recommend that you switch to using `custom_tags`| |
| `custom_tags` | configure tags to attach to traces. See section below for more details. | |
| `propagation_modes` | (optional) if present, specifies a list of the propogation modes to be used | enum: <br/>`ENVOY`<br/>`LIGHTSTEP`<br/>`B3`<br/>`TRACE_CONTEXT` |
| `sampling` | (optional) if present, specifies some target percentages of requests that will be traced. | |

Please note that you must use the HTTP/2 pseudo-header names. For example:

- the `host` header should be specified as the `:authority` header; and
- the `method` header should be specified as the `:method` header.

## Sampling

Configuring `sampling` will specify some target percentages of requests that will be traced. This is beneficial for high-volume services to control the amount of tracing data collected. Sampling can be configured with the following fields:

- `client`: percentage of requests that will be force traced if the `x-client-trace-id` header is set. Defaults to 100.
- `random`: percentage of requests that will be randomly traced. Defaults to 100.
- `overall`: percentage of requests that will be traced after all other checks have been applied (force tracing, sampling, etc.).
This field functions as an upper limit on the total configured sampling rate. For instance, setting `client`
to `100%` but `overall` to `1%` will result in only `1%` of client requests with the appropriate headers to be force
traced. Defaults to 100.

## Custom Tags and Tag Headers

When collecting traces, $productName$ will attach tags to the `span`'s that are generated which are useful for observability. See the [Envoy Tracing Docs](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing#what-data-each-trace-contains) for the default list of data collected.

Previous versions of $productName$ only supported adding additional tags through the use of the `tag_headers` field. This field is now **deprecated** and it is recommended to use `custom_tags` which supports a more powerful set of features for adding additional tags to a span.

<Alert severity="info">
If both <code>tag_headers</code> and <code>custom_tags</code> are set then <code>tag_headers</code> will be ignored.
</Alert>

`custom_tags` provides support for configuring additional tags based on [Envoy Custom Tags](https://www.envoyproxy.io/docs/envoy/latest/api-v3/type/tracing/v3/custom_tag.proto%23custom-tag). The following custom tag kinds supported are:

- `request_header` - set tag from header in the request
- `environment` - set tag from an environment variable
- `literal` -  set tag based on a configured literal value

Each custom_tag supports setting oneOf `request_header`, `literal` or `environment`. Each tag should have its own entry in `custom_tags`.

For example:

```yaml
custom_tags:
  - tag: host
    request_header: 
      name: ":authority"
      default_value: "unknown host"  # optional
  - tag: path
    request_header: ":path"
      name: ":authority"
      default_value: "unknown path"  # optional
  - tag: cluster
    literal:
      value: "us-east-cluster"
  - tag: nodeID
    environment:
      name: SERVER_ID
      default_value: "unknown"  # optional
```

### Lightstep driver configurations

- `access_token_file` provides the location of the file containing the access token to the LightStep API.

### Zipkin driver configurations

- `collector_endpoint` gives the API endpoint of the Zipkin service where the spans will be sent. The default value is `/api/v2/spans`
- `collector_endpoint_version` gives the transport version used when sending data to your Zipkin collector. The default value is `HTTP_JSON` and it must be one of `HTTP_JSON` or `HTTP_PROTO`.
- `collector_endpoint_hostname` sets the hostname Envoy will use when sending data to your Zipkin collector. The default value is the name of the underlying Envoy cluster.
- `trace_id_128bit` whether a 128-bit `trace id` will be used when creating a new trace instance. Defaults to `true`. Setting to `false` will result in a 64-bit trace id being used.
- `shared_span_context` whether client and server spans will share the same `span id`. The default value is `true`.

### Datadog Driver Configurations

- `service_name` the name of the service which is attached to the traces. The default value is `ambassador`.

You may only use a single `TracingService` manifest per $productName$ deployment. Ensure [ambassador_id](../../running#ambassador_id) is set correctly in the `TracingService` manifest.

## Example

Check out the [DataDog](../../../../howtos/tracing-datadog) and [Zipkin](../../../../howtos/tracing-zipkin) HOWTOs.
