# Circuit breakers

Circuit breakers are a powerful technique to improve resilience. By preventing additional connections or requests to an overloaded service, circuit breakers limit the ["blast radius"](https://www.ibm.com/garage/method/practices/manage/practice_limited_blast_radius/) of an overloaded service. By design, $productName$ circuit breakers are distributed, i.e., different $productName$ instances do not coordinate circuit breaker information.

## Circuit breaker configuration

A default circuit breaking configuration can be set for all
$productName$ resources in the [`ambassador
Module`](../../running/ambassador), or set to a different value on a
per-resource basis for [`Mappings`](../mappings),
[`TCPMappings`](../tcpmappings/), and
[`AuthServices`](../../running/services/auth-service/).

The `circuit_breakers` attribute configures circuit breaking. The following fields are supported:

```yaml
circuit_breakers:
- priority: <string>
  max_connections: <integer>
  max_pending_requests: <integer>
  max_requests: <integer>
  max_retries: <integer>
```

|Key|Default value|Description|
|---|---|---|
|`priority`|`default`|Specifies the priority to which the circuit breaker settings apply to; it can be set to either `default` or `high`.|
|`max_connections`|`1024`|Specifies the maximum number of connections that $productName$ will make to the services. In practice, this is more applicable to HTTP/1.1 than HTTP/2.|
|`max_pending_requests`|`1024`|Specifies the maximum number of requests that will be queued while waiting for a connection. In practice, this is more applicable to HTTP/1.1 than HTTP/2.|
|`max_requests`|`1024`|Specifies the maximum number of parallel outstanding requests to an upstream service. In practice, this is more applicable to HTTP/2 than HTTP/1.1.|
|`max_retries`|`3`|Specifies the maximum number of parallel retries allowed to an upstream service.|

The `max_*` fields can be reduced to shrink the "blast radius," or
increased to enable $productName$ to handle a larger number of
concurrent requests.

## Examples

Circuit breakers defined on a single `Mapping`:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
  service: quote
  circuit_breakers:
  - max_connections: 2048
    max_pending_requests: 2048
```

Circuit breakers defined on a single `AuthService`:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: AuthService
metadata:
  name: dancing-walrus
spec:
  auth_service: http://dancing-walrus:8500
  proto: grpc
  circuit_breakers:
  - max_requests: 4096
```

A global circuit breaker:

```yaml
apiVersion: getambassador.io/v3alpha1
kind:  Module
metadata:
  name:  ambassador
spec:
  config:
    circuit_breakers:
    - max_connections: 2048
      max_pending_requests: 2048
---
apiVersion: getambassador.io/v3alpha1
kind:  Mapping
metadata:
  name:  quote-backend
spec:
  prefix: /backend/
  service: quote
```

## Circuit breakers and automatic retries

Circuit breakers are best used in conjunction with [automatic retries](../retries). Here are some examples:

* You've configured automatic retries for failed requests to a service. Your service is under heavy load, and starting to time out on servicing requests. In this case, automatic retries can exacerbate your problem, increasing the total request volume by 2x or more. By aggressively circuit breaking, you can mitigate failure in this scenario.
* To circuit break when services are slow, you can combine circuit breakers with retries. Reduce the time out for retries, and then set a circuit breaker that detects many retries. In this setup, if your service doesn't respond quickly, a flood of retries will occur, which can then trip the circuit breaker.

Note that setting circuit breaker thresholds requires careful monitoring and experimentation. We recommend you start with conservative values for circuit breakers and adjust them over time.

## More about circuit breakers

Responses from a broken circuit contain the `x-envoy-overloaded` header.

The following are the default values for circuit breaking if nothing is specified:

```yaml
circuit_breakers:
- priority: default
  max_connections: 1024
  max_pending_requests: 1024
  max_requests: 1024
  max_retries: 3
```

Circuit breaker metrics are exposed in StatsD. For more information about the specific statistics, see the [Envoy documentation](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking.html).
