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

See the [instructions on updating $OSSproductName$](../../../../../emissary/$ossDocsVersion$/topics/install/migration-matrix).

## If you installed $productName$ using Helm

| If you're running.                      | You can upgrade to                                                               |
|-----------------------------------------|----------------------------------------------------------------------------------|
| $AESproductName$ $versionTwoX$          | [$AESproductName$ $version$](../upgrade/helm/edge-stack-2.5/edge-stack-3.3)      |
| $AESproductName$ 2.4.X                  | [$AESproductName$ $versionTwoX$](../upgrade/helm/edge-stack-2.4/edge-stack-2.X)  |
| $AESproductName$ 2.3.X                  | [$AESproductName$ $versionTwoX$](../upgrade/helm/edge-stack-2.3/edge-stack-2.X)  |
| $AESproductName$ 2.0.X                  | [$AESproductName$ $versionTwoX$](../upgrade/helm/edge-stack-2.0/edge-stack-2.X)  |
| $AESproductName$ $versionOneX$          | [$AESproductName$ $versionTwoX$](../upgrade/helm/edge-stack-1.14/edge-stack-2.X) |
| $AESproductName$ prior to $versionOneX$ | [$AESproductName$ $versionOneX$](../../../../1.14/topics/install/upgrading)      |
| $OSSproductName$ $ossVersion$           | [$AESproductName$ $version$](../upgrade/helm/emissary-3.3/edge-stack-3.3)        |

## If you installed $AESproductName$ manually by applying YAML

| If you're running.                      | You can upgrade to                                                               |
|-----------------------------------------|----------------------------------------------------------------------------------|
| $AESproductName$ $versionTwoX$          | [$AESproductName$ $version$](../upgrade/yaml/edge-stack-2.5/edge-stack-3.3)      |
| $AESproductName$ 2.4.X                  | [$AESproductName$ $versionTwoX$](../upgrade/helm/edge-stack-2.4/edge-stack-2.X)  |
| $AESproductName$ 2.3.X                  | [$AESproductName$ $versionTwoX$](../upgrade/yaml/edge-stack-2.3/edge-stack-2.X)  |
| $AESproductName$ 2.0.X                  | [$AESproductName$ $versionTwoX$](../upgrade/yaml/edge-stack-2.0/edge-stack-2.X)  |
| $AESproductName$ $versionOneX$          | [$AESproductName$ $versionTwoX$](../upgrade/yaml/edge-stack-1.14/edge-stack-2.X) |
| $AESproductName$ prior to $versionOneX$ | [$AESproductName$ $versionOneX$](../../../../1.14/topics/install/upgrading)      |
| $OSSproductName$ $ossVersion$           | [$AESproductName$ $version$](../upgrade/yaml/emissary-3.3/edge-stack-3.3)        |
