import Alert from '@material-ui/lab/Alert';

# Basic rate limiting

<Alert severity="info">This guide applies to $OSSproductName$. It will not work correctly
on $AESproductName$.</Alert>

$productName$ can validate incoming requests before routing them to a backing service. In this tutorial, we'll configure $productName$ to use a simple third party rate limit service. (If you don't want to implement your own rate limiting service, $AESproductName$ integrates a [powerful, flexible rate limiting service](/docs/edge-stack/latest/topics/using/rate-limits/rate-limits/).)

## Before you get started

This tutorial assumes you have already followed the $productName$ [Installation](../../topics/install/) and [Quickstart Tutorial](../../tutorials/quickstart-demo) guides. If you haven't done that already, you should do so now.

Once completed, you'll have a Kubernetes cluster running $productName$ and the Quote of the Moment service. Let's walk through adding rate limiting to this setup.

## 1. Deploy the rate limit service

$productName$ delegates the actual rate limit logic to a third party service. We've written a [simple rate limit service](https://github.com/emissary-ingress/emissary/tree/v2.1.0/docker/test-ratelimit) that:

- listens for requests on port 5000;
- handles gRPC `shouldRateLimit` requests;
- allows requests with the `x-ambassador-test-allow: "true"` header; and
- marks all other requests as `OVER_LIMIT`;

Here's the YAML we'll start with:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: RateLimitService
metadata:
  name: ratelimit
spec:
  service: "example-rate-limit:5000"
---
apiVersion: v1
kind: Service
metadata:
  name: example-rate-limit
spec:
  type: ClusterIP
  selector:
    app: example-rate-limit
  ports:
  - port: 5000
    name: http-example-rate-limit
    targetPort: http-api
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example-rate-limit
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app: example-rate-limit
  template:
    metadata:
      labels:
        app: example-rate-limit
    spec:
      containers:
      - name: example-rate-limit
        image: datawire/test_services:test-ratelimit:0.0.4
        imagePullPolicy: Always
        ports:
        - name: http-api
          containerPort: 5000
        resources:
          limits:
            cpu: "0.1"
            memory: 100Mi
```

This configuration tells $productName$ about the rate limit service, notably that it is serving requests at `example-rate-limit:5000`. $productName$ will see the `RateLimitService` and reconfigure itself within a few
seconds, allowing incoming requests to be rate-limited.

Note that you can configure the `RateLimitService` to use a specific label `domain`.
If `domain` is not specified (which is the situation here), the default is `ambassador`.

<Alert severity="info">If $productName$ cannot contact the rate limit service, it will allow the request to be processed as if there were no rate limit service configuration.</Alert>

## 2. Configure $productName$ Mappings

$productName$ only validates requests on `Mapping`s which set labels to use for rate limiting,
so you'll need to apply `labels` to your `Mapping`s to enable rate limiting. For more information
on the labelling process, see the [Rate Limits configuration documentation](../../topics/using/rate-limits/).

<Alert severity="info">
  These <code>labels</code> require <code>Mapping</code> resources with <code>apiVersion</code>
  <code>getambassador.io/v2</code> or newer &mdash; if you're updating an old installation, check the
  <code>apiVersion</code>!
</Alert>

<Alert severity="info">If $productName$ cannot contact the rate limit service, it will allow the request to be processed as if there were no rate limit service configuration.</Alert>

Replace the label that is applied to the `service-backend` with:

```yaml
labels:
  ambassador:
    - request_label_group:
      - x-ambassador-test-allow:
          request_headers:
            key: "x-ambassador-test-allow"
            header_name: "x-ambassador-test-allow"
```

so the `Mapping` definition will now look like this:

```yaml
---
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
        - x-ambassador-test-allow:
            request_headers:
              key: "x-ambassador-test-allow"
              header_name: "x-ambassador-test-allow"
```

<!-- If multiple `labels` are supplied for a single `Mapping`, $productName$ would also perform multiple requests to `example-rate-limit:5000` if we had defined multiple `rate_limits` rules on the mapping. -->

Note that the `key` could be anything you like, but our example rate limiting service expects it to
match the name of the header. Also note that since our `RateLimitService` expects to use labels in the
`ambassador` domain, our `Mapping` must match.

## 2. Test rate limiting

If we `curl` to a rate-limited URL:

```
$ curl -Lv -H "x-ambassador-test-allow: probably" $AMBASSADORURL/backend/
```

We get a 429, since we are limited.

```
HTTP/1.1 429 Too Many Requests
content-type: text/html; charset=utf-8
content-length: 0
```

If we set the correct header value to the service request, we will get a quote successfully:

```
$ curl -Lv -H "x-ambassador-test-allow: true" $AMBASSADORURL/backend/

TCP_NODELAY set
* Connected to 35.196.173.175 (35.196.173.175) port 80 (#0)
> GET /backed HTTP/1.1
> Host: 35.196.173.175
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 200 OK
< content-type: application/json
< date: Thu, 23 May 2019 15:25:06 GMT
< content-length: 172
< x-envoy-upstream-service-time: 0
< server: envoy
<
{
    "server": "humble-blueberry-o2v493st",
    "quote": "Nihilism gambles with lives, happiness, and even destiny itself!",
    "time": "2019-05-23T15:25:06.544417902Z"
* Connection #0 to host 54.165.128.189 left intact
}
```

## More

For more details about configuring the external rate limit service, read the [rate limit documentation](../../topics/using/rate-limits/).
