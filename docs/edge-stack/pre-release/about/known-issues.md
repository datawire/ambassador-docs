import Alert from '@material-ui/lab/Alert';

Known Issues in $productName$
=============================

## 2.2.1

- TLS certificates using elliptic curves were incorrectly flagged as invalid. This issue is
  corrected in $productName$ 2.2.2.

## 2.2.0

- If $productName$'s Pods start before Redis is responding, it may be necessary to restart
  $productName$ for rate limiting to function correctly.

- When using the ACME client provided with $productName$, a delayed ACME response can
  prevent the `Host` using ACME from becoming active.

   - Workaround: Make sure you have a wildcard `Host` that does not use ACME. The insecure routing
     action doesn't matter: it's fine for this `Host` to redirect or even reject insecure requests.
