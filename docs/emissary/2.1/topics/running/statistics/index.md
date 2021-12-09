# Statistics and monitoring

$productName$ collects many statistics internally, and makes it easy to
direct this information to a statistics and monitoring tool of your
choice.  As an example, for a given service `usersvc`, here are some
interesting statistics to investigate:

- `envoy.cluster.usersvc.upstream_rq_total` is the total
  number of requests that `usersvc` has received via $productName$.  The rate of change of this value is one basic measure of
  service utilization, i.e. requests per second.
- `envoy.cluster.usersvc.upstream_rq_2xx` is the total number
  of requests to which `usersvc` responded with an HTTP response
  indicating success.  This value divided by the prior one, taken on
  an rolling window basis, represents the recent success rate of the
  service.  There are corresponding `4xx` and `5xx` counters that can
  help clarify the nature of unsuccessful requests.
- `envoy.cluster.usersvc.upstream_rq_time` is a StatsD timer
  that tracks the latency in milliseconds of `usersvc` from $productName$'s perspective.  StatsD timers include information about
  means, standard deviations, and decile values.

## Overriding Statistics Names

The optional `stats_name` element of every CRD that references a service (`Mapping`, `TCPMapping`,
`AuthService`, `LogService`, `RateLimitService`, and `TracingService`) can override the name under which cluster statistics
are logged (`usersvc` above). If not set, the default is the `service` value, with non-alphanumeric characters replaced by
underscores:

- `service: foo` will just use `foo`
- `service: foo:8080` will use `foo_8080`
- `service: http://foo:8080` will use `http___foo_8080`
- `service: foo.othernamespace` will use `foo_othernamespace`

The last example is worth special mention: a resource in a different namespace than the one in which $productName$ is running will automatically be qualified with the namespace of the resource itself. So, for example, if $productName$ is running in the `ambassador` namespace, and this `Mapping` is present in the `default` namespace:

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: default-mapping
  namespace: default
spec:
  prefix: /default/
  service: default-service
```

then the `service` will be qualified to `default-service.default`, so the `stats_name` will be `default_service_default` rather than simply `default_service`. To change this behavior, set `stats_name` explicitly.

## Monitoring Statistics

There are several ways to get different statistics out of $productName$:

- [The `:8877/metrics` endpoint](./8877-metrics) can be polled for
  aggregated statistics (in a Prometheus-compatible format).  This is
  our recommended method.
- $productName$ can push [Envoy statistics](./envoy-statsd) over the
  StatsD or DogStatsD protocol.
- $productName$ can push [RateLimiting
  statistics](../environment) over the StatsD protocol.

## The Four Golden Signals

The [Four Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/) are four generally-accepted metrics
that are important to monitor for good information about service health:

### Latency

The time it takes to service a request. `cluster.$name.upstream_rq_time` is a histogram of time taken by individual requests, which can be an effective latency metric.

### Traffic

The amount of demand being placed on your system. `cluster.$name.upstream_rq_active` is a gauge that shows the number of active outstanding requests, which can be a good proxy for traffic.

### Errors

The number of failing requests. Some errors (e.g. a request succeeds, but gives the wrong answer) can only be detected by application-specific monitoring; however, many errors can be spotted simply by looking at the HTTP status code of requests. `cluster.$name.upstream_rq_5xx` is a counter of HTTP `5xx` responses, so monitoring it over time can show error rates. (Likewise, `cluster.$name.upstream_rq_4xx` exists.)

### Saturation

The hardest metric to measure, saturation describes how much of the total capability of the system to respond to requests is being used. Fully measuring saturation often requires application-specific monitoring, but looking at the 99th percentile of latency over a short window - perhaps a a minute - can often give an early indication of saturation problems.
