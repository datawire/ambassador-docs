import Alert from '@material-ui/lab/Alert';

# Cleartext support

While most modern web applications will choose to encrypt all traffic, there
are reasons why you will want to support clients who access your website
without encryption in cleartext.

$productName$ supports both forcing
[automatic redirection to HTTPS](#http-https-redirection) and
[serving cleartext](#cleartext-routing) traffic on a `Host`.

## Cleartext routing

$productName$ has full support for routing cleartext traffic to upstream services
for a `Host`.

### Only cleartext

The default for the Open-Source $OSSproductName$ is to serve cleartext on
port 8080 in the container. See [TLS documentation](../) for information on
how to configure TLS termination.

For $AESproductName$, TLS termination is enabled by default with a
self-signed certificate or an ACME `Host`. To disable TLS termination in $AESproductName$, delete any existing `Host`s and set the
`requestPolicy.insecure.action` to `Route` in a `Host`:

```yaml
apiVersion: getambassador.io/v2
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  acmeProvider:
    authority: none
  requestPolicy:
    insecure:
      action: Route
```

> **WARNING - Host Configuration:** The `requestPolicy` property of the `Host` `CRD` is applied globally within an $productName$ instance, even if it is applied to only one `Host` when multiple `Host`s are configured. Different `requestPolicy` behaviors cannot be applied to different `Host`s. It is recommended to apply an identical `requestPolicy` to all `Host`s instead of assuming the behavior, to create a more human readable config.
>
> If a requestPolicy is not defined for a `Host`, it's assumed to be `Redirect`, so even if a `Host` does not specify it, the default `requestPolicy` of `Redirect` will be applied to all `Host`s in that $productName$ instance. If the behavior expected out of $productName$ is anything other than `Redirect`, it must be explicitly enumerated in all Host resources.
>
> Unexpected behavior can occur when multiple `Host` resources are not using the same value for `requestPolicy`.
>
> For more information, please refer to the [`Host` documentation](../../host-crd#secure-and-insecure-requests).
>
>The `insecure-action` can be one of:
>
>* `Redirect` (the default): redirect to HTTPS
>* `Route`: go ahead and route as normal; this will allow handling HTTP requests normally
>* `Reject`: reject the request with a 400 response


### HTTPS and cleartext

$productName$ can also support serving both HTTPS and cleartext traffic from a
single $productName$.

This configuration is the same whether you are running the Open-Source $OSSproductName$ or the $AESproductName$. The configuration is very similar to the
`Host` above but with the `Host` configured to terminate TLS.

```yaml
apiVersion: getambassador.io/v2
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  acmeProvider:
    authority: none
  tlsSecret:
    name: example-cert
  requestPolicy:
    insecure:
      action: Route
      additionalPort: 8080
```

With the above configuration, we are tell $productName$ to terminate TLS with the
certificate in the `example-cert` `Secret` and route cleartext traffic that
comes in over port `8080`.

<Alert severity="info">
  The <code>additionalPort</code> element tells $productName$ to listen on the specified <code>insecure-port</code> and treat any request arriving on that port as insecure. <strong>By default, <code>additionalPort</code> will be set to 8080 for any Host using TLS.</strong> To disable this redirection entirely, set <code>additionalPort</code> explicitly to <code>-1</code>.
</Alert>


## HTTP->HTTPS redirection

Most modern websites that force HTTPS will also automatically redirect any
requests that come into it over HTTP. In $AESproductName$, this is
enabled by default but can easily be enabled in any version of $productName$.

```
Client              $productName$
|                             |
| http://<hostname>/api       |
| --------------------------> |
| 301: https://<hostname>/api |
| <-------------------------- |
| https://<hostname>/api      |
| --------------------------> |
|                             |
```

In $productName$, this is configured by setting the
`insecure.action` in a `Host` to `Redirect`.

```yaml
requestPolicy:
  insecure:
    action: Redirect
    additionalPort: 8080
```

$productName$ will then enable cleartext redrection in two ways.

First, $productName$ will listen on the `insecure.additionalPort` and consider any
traffic on this port as `insecure` and redirect it to HTTPS.

```yaml
requestPolicy:
  insecure:
    action: Redirect
    additionalPort: 8080
```

Additionally, $productName$ will also check the `X-Forwarded-Proto` header of
the incoming request on the `secure` port (`8443`)and issue a 301 redirect if
it is set to `HTTP`.

The value of `X-Forwarded-Proto` is dependent on whatever is forwarding traffic
to $productName$. A couple of options are

- Layer 4 Load Balancer, Proxy, or direct from the client:

   `X-Forwarded-Proto`  is not set or is untrusted. Envoy will set it based
   off the protocol of the incoming request.

   If Envoy determines the request is encrypted, it will be set to `HTTPS`. If
   not, it will be set to `HTTP`.

- Layer 7 Load Balancer or Proxy:

   `X-Forwarded-Proto` is set by the load balancer or proxy and trusted by
   Envoy. Envoy will trust the value of `X-Forwarded-For` even if the request
   comes in over cleartext.

  <Alert severity="info">
    <strong>If you are using a layer 7 load balancer, it is critical that the system be configured correctly.</strong>  The <code>xff_num_trusted_hops</code> element, although its name reflects <code>X-Forwarded-For</code>, is also used when determining trust for <code>X-Forwarded-For</code>, and it is therefore important to set it correctly. Its default of 0 should always be correct when $productName$ is behind only layer 4 load balancers. Note that in rare cases the load balancer may remove or impact these headers so checking that the defaults are in place is recommended.
  </Alert>

## Summary

$AESproductName$ will enable cleartext redirection by default.

To enable cleartext redirection in any version of $productName$, simply configure
a `Host` to redirect cleartext to HTTPS like below:

```yaml
apiVersion: getambassador.io/v2
kind: Host
metadata:
  name: example-host
spec:
  hostname: host.example.com
  requestPolicy:
    insecure:
      action: Redirect     # Configures $productName$ to redirect cleartext
      additionalPort: 8080 # Optional: The redirect port. Defaults to 8080
```
