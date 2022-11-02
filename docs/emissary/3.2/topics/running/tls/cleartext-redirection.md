---
  description: Cleartext support - While most modern web applications choose to encrypt all traffic, there are some cases where supporting cleartext communications is i…
---

import Alert from '@material-ui/lab/Alert';

# Cleartext support

While most modern web applications choose to encrypt all traffic, there remain
cases where supporting cleartext communications is important. $productName$ supports
both forcing [automatic redirection to HTTPS](#http-https-redirection) and
[serving cleartext](#cleartext-routing) traffic on a `Host`.

<Alert severity="info">
  The <a href="../../listener"><code>Listener</code></a> and
  <a href="../../host-crd"><code>Host</code></a> CRDs work together to manage HTTP and HTTPS routing.
  This document is meant as a quick reference to the <code>Host</code> resource: for a more complete
  treatment of handling cleartext and HTTPS, see <a href="../../../../howtos/configure-communications">Configuring $productName$ Communications</a>.
</Alert>

## Cleartext Routing

To allow cleartext to be routed, set the `requestPolicy.insecure.action` of a `Host` to `Route`:

```yaml
requestPolicy:
  insecure:
    action: Redirect
```

This allows routing for either HTTP and HTTPS, or _only_ HTTP, depending on `tlsSecret` configuration:

- If the `Host` does not specify a `tlsSecret`, it will only route HTTP, not terminating TLS at all.
- If the `Host` does specify a `tlsSecret`, it will route both HTTP and HTTPS.

<Alert severity="info">
  The <a href="../../listener"><code>Listener</code></a> and
  <a href="../../host-crd"><code>Host</code></a> CRDs work together to manage HTTP and HTTPS routing.
  This document is meant as a quick reference to the <code>Host</code> resource: for a more complete
  treatment of handling cleartext and HTTPS, see <a href="../../../../howtos/configure-communications">Configuring $productName$ Communications</a>.
</Alert>

## HTTP->HTTPS redirection

Most websites that force HTTPS will also automatically redirect any
requests that come into it over HTTP:

```
Client              $productName$
|                             |
| http://<hostname>/api       |
| --------------------------> |
|                             |
| 301: https://<hostname>/api |
| <-------------------------- |
|                             |
| https://<hostname>/api      |
| --------------------------> |
|                             |
```

In $productName$, this is configured by setting the `insecure.action` in a `Host` to `Redirect`.

```yaml
requestPolicy:
  insecure:
    action: Redirect
```

$productName$ determines which requests are secure and which are insecure using the
`securityModel` of the [`Listener`] that accepts the request.

[`Listener`]: ../../listener

<Alert severity="info">
  The <a href="../../listener"><code>Listener</code></a> and
  <a href="../../host-crd"><code>Host</code></a> CRDs work together to manage HTTP and HTTPS routing.
  This document is meant as a quick reference to the <code>Host</code> resource: for a more complete
  treatment of handling cleartext and HTTPS, see <a href="../../../../howtos/configure-communications">Configuring $productName$ Communications</a>.
</Alert>
