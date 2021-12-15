import Alert from '@material-ui/lab/Alert';

# Upgrading $productName$

<Alert severity="warning">
  <b>Read the instructions below</b> before making any changes to your cluster!
</Alert>

There are currently multiple paths for upgrading $productName$, depending on what version you're currently
running, what you want to be running, and whether you installed $productName$ using [Helm](../helm) or
YAML.

(To check out if you installed $productName$ using Helm, run `helm list --all` and see if
$productName$ is listed. If so, you installed using Helm.)

<Alert severity="warning">
  <b>Read the instructions below</b> before making any changes to your cluster!
</Alert>

## If you are currently running $OSSproductName$

See the [instructions on updating $OSSproductName$](../../../../../emissary/$docsVersion$/topics/install/migration-matrix).

## If you installed $productName$ using Helm

| If you're running.            | You can upgrade to                                                        |
|-------------------------------|---------------------------------------------------------------------------|
| $productName$ 2.0.0 or later  | [$productName$ $version$](../upgrade/helm/edge-stack-2.0/edge-stack-2.1)  |
| $productName$ 1.14.2          | [$productName$ $version$](../upgrade/helm/edge-stack-1.14/edge-stack-2.1) |
| $productName$ prior to 1.14.2 | [$productName$ 1.14.2](../../../../1.14/topics/install/upgrading)         |

## If you installed $productName$ manually by applying YAML

| If you're running.            | You can upgrade to                                                        |
|-------------------------------|---------------------------------------------------------------------------|
| $productName$ 2.0.0 or later  | [$productName$ $version$](../upgrade/yaml/edge-stack-2.0/edge-stack-2.1)  |
| $productName$ 1.14.2          | [$productName$ $version$](../upgrade/yaml/edge-stack-1.14/edge-stack-2.1) |
| $productName$ prior to 1.14.2 | [$productName$ 1.14.2](../../../../1.14/topics/install/upgrading)         |
