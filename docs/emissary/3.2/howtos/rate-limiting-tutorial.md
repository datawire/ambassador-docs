import Alert from '@material-ui/lab/Alert';

# Basic rate limiting

<Alert severity="info">This guide applies to $OSSproductName$. It will not work correctly
on $AESproductName$.</Alert>

$productName$ can validate incoming requests before routing them to a backing service. In this tutorial, we'll configure $productName$ to use a simple third party rate limit service. (If you don't want to implement your own rate limiting service, $AESproductName$ integrates a [powerful, flexible rate limiting service](/docs/edge-stack/latest/topics/using/rate-limits/rate-limits/).)

## Before you get started

This tutorial assumes you have already followed the $productName$ [Installation](../../topics/install/) and [Quickstart Tutorial](../../tutorials/quickstart-demo) guides. If you haven't done that already, you should do so now.

Once completed, you'll have a Kubernetes cluster running $productName$ and the Quote service. Let's walk through adding rate limiting to this setup.

## 1. Deploy the rate limit service

$productName$ delegates the actual rate limit logic to a third party service. We've written a [simple rate limit service](https://github.com/emissary-ingress/ratelimit-example) that:

- listens for requests on port 5000;
- handles gRPC `shouldRateLimit` requests;
- allows requests with the `x-emissary-test-allow: "true"` header; and
- marks all other requests as `OVER_LIMIT`;

Here's the YAML we'll start with:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: RateLimitService
metadata:
  name: ratelimit
  namespace: default
spec:
  service: "ratelimit-example.default:5000"
  protocol_version: v3
  domain: emissary
  failure_mode_deny: true
---
apiVersion: v1
kind: Service
metadata:
  name: ratelimit-example
spec:
  selector:
    app: ratelimit-example
  ports:
    - name: http
      port: 5000
      targetPort: http
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ratelimit-example
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ratelimit-example
  template:
    metadata:
      labels:
        app: ratelimit-example
    spec:
      containers:
      - name: ratelimit-example
        image: docker.io/emissaryingress/ratelimit-example:v3
        imagePullPolicy: Always
        ports:
          - name: http
            containerPort: 5000
        resources:
          limits:
            memory: "64Mi"
            cpu: "100m"
```

Once this configuration is applied Kubernetes will startup the example ratelimit service and $productName$ will be configured to use the rate limit service. The `RateLimitService` configuration tells $productName$ to:

- Send `ShouldRateLimit` check request to `ratelimit-example.default:5000`
- Configure Envoy to talk with the example ratelimit service using  transport protocol `v3` (*only supported version*)
- Set the labels `domain` to `emissary` (*labels discussed below*)

<Alert severity="info">If $productName$ cannot contact the rate limit service, it can either fail open or closed. The default is to fail open but in the example `RateLimitService` above we toggled it via the `failure_mode_deny: true` setting.</Alert>

## 2. Configure $productName$ Mappings

$productName$ only validates requests on `Mapping`s which set labels to use for rate limiting, so you'll need to apply `labels` to your `Mapping`s to enable rate limiting. For more information
on the labelling process, see the [Rate Limits configuration documentation](../../topics/using/rate-limits/).

<Alert severity="info">
  These <code>labels</code> require <code>Mapping</code> resources with <code>apiVersion</code> <code>getambassador.io/v2</code> or newer &mdash; if you're updating an old installation, check the
  <code>apiVersion</code>!
</Alert>

Labels are added to a `Mapping` using the `labels` field and `domain` configured in the `RateLimitService`. For example:

```yaml
labels:
  emissary:
    - request_label_group:
      - x-emissary-test-allow:
          request_headers:
            key: "x-emissary-test-allow"
            header_name: "x-emissary-test-allow"
```

If we were to apply it the `Mapping` definition for the `quote-backend` service outlined in the quick-start then it would look like this:

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
    emissary:
      - request_label_group:
        - x-emissary-test-allow:
          request_headers:
              key: "x-emissary-test-allow"
              header_name: "x-emissary-test-allow"
```

Note that the `key` could be anything you like, but our example rate limiting service expects it to match the name of the header. Also note that since our `RateLimitService` expects to use labels in the
`emissary` domain, our `Mapping` must match.

## 2. Test rate limiting

If we `curl` to a rate-limited URL:

```shell
curl -i -H "x-emissary-test-allow: probably"  http://$LB_ENDPOINT/backend/
```

We get a `429` status code, since we are being rate limited.

```shell
HTTP/1.1 429 Too Many Requests
content-type: text/html; charset=utf-8
content-length: 0
```

If we set the correct header value to the service request, we will get a quote successfully:

```shell
$ curl -i -H "x-emissary-test-allow: true"  http://$LB_ENDPOINT/backend/

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
