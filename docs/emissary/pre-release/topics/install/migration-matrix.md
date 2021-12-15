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

## If you are currently running $AESproductName$

See the [instructions on updating $AESproductName$](../../../../../edge-stack/$docsVersion$/topics/install/migration-matrix).

## If you installed $OSSproductName$ using Helm

| If you're running.         | You can upgrade to |
|----------------------------|--------------------|
| $OSSproductName$ $version$ | [$AESproductName$ $version$](../upgrade/helm/emissary-2.1/edge-stack-2.1) |
| $OSSproductName$ 2.0.5     | [$AESproductName$ $version$](../upgrade/helm/emissary-2.0/edge-stack-2.1) or<br/>[$OSSproductName$ $version$](../upgrade/helm/emissary-2.0/emissary-2.1)   |
| $OSSproductName$ 1.14.2    | [$AESproductName$ $version$](../upgrade/helm/emissary-1.14/edge-stack-2.1) or<br/>[$OSSproductName$ $version$](../upgrade/helm/emissary-1.14/emissary-2.1)   |
| $OSSproductName$ prior to 1.14.2 | [$OSSproductName$ 1.14.2](../../../../1.14/topics/install/upgrading) first |


## If you installed $OSSproductName$ manually by applying YAML

| If you're running.         | You can upgrade to |
|----------------------------|--------------------|
| $OSSproductName$ $version$ | [$AESproductName$ $version$](../upgrade/yaml/emissary-2.1/edge-stack-2.1) |
| $OSSproductName$ 2.0.5     | [$AESproductName$ $version$](../upgrade/yaml/emissary-2.0/edge-stack-2.1) or<br/>[$OSSproductName$ $version$](../upgrade/yaml/emissary-2.0/emissary-2.1)   |
| $OSSproductName$ 1.14.2    | [$AESproductName$ $version$](../upgrade/yaml/emissary-1.14/edge-stack-2.1) or<br/>[$OSSproductName$ $version$](../upgrade/yaml/emissary-1.14/emissary-2.1)   |
| $OSSproductName$ prior to 1.14.2 | [$OSSproductName$ 1.14.2](../../../../1.14/topics/install/upgrading) first |
