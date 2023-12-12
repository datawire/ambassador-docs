import Alert from '@material-ui/lab/Alert';

Known Issues in $productName$ 2.0.0
===================================

- When using the ACME client provided with $productName$, a delayed ACME response can
  prevent the `Host` using ACME from becoming active.

   - Workaround: Make sure you have a wildcard `Host` that does not use ACME. The insecure routing
     action doesn't matter: it's fine for this `Host` to redirect or even reject insecure requests.

- Canary releases using Argo Rollouts do not work properly when `AMBASSADOR_FAST_RECONFIGURE` is set.

    - This is already fixed in version 2.1.0.
