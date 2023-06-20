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

See the [instructions on updating $AESproductName$](/docs/edge-stack/$aesDocsVersion$/topics/install/migration-matrix/).

## If you installed $OSSproductName$ using Helm

| If you're running.                      | You can upgrade to                                                                                                          |
|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| $OSSproductName$ $version$              | [$AESproductName$ $aesVersion$](/docs/edge-stack/$aesDocsVersion$/topics/install/upgrade/helm/emissary-3.6/edge-stack-3.X/) |
| $OSSproductName$ 3.6.X                  | [$OSSproductName$ $version$](../upgrade/helm/emissary-3.6/emissary-3.X)                                                     |
| $OSSproductName$ $versionTwoX$          | [$OSSproductName$ $version$](../upgrade/helm/emissary-2.5/emissary-3.X)                                                     |
| $OSSproductName$ 2.4.X                  | [$OSSproductName$ $versionTwoX$](../upgrade/helm/emissary-2.4/emissary-2.X)                                                     |
| $OSSproductName$ 2.0.5                  | [$OSSproductName$ $versionTwoX$](../upgrade/helm/emissary-2.0/emissary-2.X)                                                 |
| $OSSproductName$ $versionOneX$          | [$OSSproductName$ $versionTwoX$](../upgrade/helm/emissary-1.14/emissary-2.X)                                                |
| $OSSproductName$ prior to $versionOneX$ | [$OSSproductName$ $versionOneX$](../../../../1.14/topics/install/upgrading)                                                 |

## If you installed $OSSproductName$ manually by applying YAML

| If you're running.                      | You can upgrade to                                                                                                          |
|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| $OSSproductName$ $version$              | [$AESproductName$ $aesVersion$](/docs/edge-stack/$aesDocsVersion$/topics/install/upgrade/yaml/emissary-3.6/edge-stack-3.X/) |
| $OSSproductName$ 3.6.X                  | [$OSSproductName$ $version$](../upgrade/yaml/emissary-3.6/emissary-3.X)                                                     |
| $OSSproductName$ $versionTwoX$          | [$OSSproductName$ $version$](../upgrade/yaml/emissary-2.5/emissary-3.X)                                                     |
| $OSSproductName$ 2.4.X                  | [$OSSproductName$ $versionTwoX$](../upgrade/yaml/emissary-2.4/emissary-2.X)                                                     |
| $OSSproductName$ 2.0.5                  | [$OSSproductName$ $versionTwoX$](../upgrade/yaml/emissary-2.0/emissary-2.X)                                                 |
| $OSSproductName$ $versionOneX$          | [$OSSproductName$ $versionTwoX$](../upgrade/yaml/emissary-1.14/emissary-2.X)                                                |
| $OSSproductName$ prior to $versionOneX$ | [$OSSproductName$ $versionOneX$](../../../../1.14/topics/install/upgrading)                                                 |
