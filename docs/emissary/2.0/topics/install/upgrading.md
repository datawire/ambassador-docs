import Alert from '@material-ui/lab/Alert';

# Upgrading $productName$

<Alert severity="warning">
  To migrate from $productName$ 1.X to $productName$ 2.X, see the <a href="../migrate-to-version-2">$productName$ 2.X Migration Guide</a>.
  This guide <b>will not work</b> for that, due to changes to the configuration resources used for $productName$ 2.X.
</Alert>

<Alert severity="info">
  We're pleased to introduce $productName$ 2.0! The 2.X family introduces a number of
  changes to allow $productName$ to more gracefully handle larger installations
  (including multitenant or multiorganizational installations), reduce memory footprint,
  and improve performance. For more information on 2.X, please check the&nbsp;
  <a href="../../../release-notes">release notes</a>.
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
