import Alert from '@material-ui/lab/Alert';

# Upgrading $productName$

<Alert severity="warning">
  To migrate from $productName$ 1.X to $productName$ 2.X, see the <a href="../migrate-to-version-2">$productName$ 2.X Migration Guide</a>.
  This guide <b>will not work</b> for that, due to changes to the configuration resources used for $productName$ 2.X.
</Alert>

<Alert severity="info">
  We're pleased to introduce $productName$ 2.0 as a <b>developer preview</b>; our latest
  general-availability release is <a href="../../../1.13">1.13</a>.<br/>
  <br/>
  The 2.X family introduces a number of changes to allow $productName$ to more gracefully
  handle larger installations (including multitenant or multiorganizational installations),
  reduce memory footprint, and improve performance. However, <b>some configuration has
  changed</b> between 1.X and 2.X: if you're currently running 1.X, <b>please</b> read the&nbsp;
  <a href="migrate-to-version-2">migration guide</a> before trying to install 2.0.
</Alert>

Since $productName$'s configuration is entirely stored in Kubernetes resources, no special process
is necessary to upgrade $productName$.

The steps to upgrade depend on the method that was used to install $productName$, as indicated below.

## Which upgrade method should I use?

To check if you installed $productName$ with Helm, run the following command to see if it returns resources:
```
$ helm list -n emissary
NAME            	NAMESPACE	REVISION	UPDATED     ...
$productDeploymentName$	$productNamespace$ 	1           ...
```

If Helm reports a release of $productName$ in your cluster, you should
[upgrade with the help of Helm](../helm/#upgrading-an-existing-installation).

Otherwise, you should follow [the YAML upgrade guide](../yaml-install/#install-or-upgrade-with-yaml)
