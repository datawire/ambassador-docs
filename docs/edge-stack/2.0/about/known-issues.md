import Alert from '@material-ui/lab/Alert';

Known Issues in $productName$ 2.0.0
===================================

- When using the ACME client provided with $productName$, a delayed ACME response can 
  prevent the `AmbassadorHost` using ACME from becoming active.

   - Workaround: Make sure you have a wildcard `AmbassadorHost` that does not use ACME. The insecure routing 
     action doesn't matter: it's fine for this `AmbassadorHost` to redirect or even reject insecure requests.
