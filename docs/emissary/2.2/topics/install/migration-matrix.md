import Alert from '@material-ui/lab/Alert';

# Upgrading $productName$

<Alert severity="warning">
  <b>Read the instructions below</b> before making any changes to your cluster!
</Alert>

There are currently multiple paths for upgrading [$productName$](/products/api-gateway/), depending on what version you're currently
running, what you want to be running, and whether you installed $productName$ using [Helm](../helm) or
YAML.

(To check out if you installed [$productName$](../../../tutorials/quickstart-demo/) using Helm, run `helm list --all` and see if
$productName$ is listed. If so, you installed using Helm.)

<Alert severity="warning">
  <b>Read the instructions below</b> before making any changes to your cluster!
</Alert>

## If you are currently running $AESproductName$

See the [instructions on updating $AESproductName$](../../../../../edge-stack/$aesDocsVersion$/topics/install/migration-matrix).

## If you installed $OSSproductName$ using Helm

| If you're running.               | You can upgrade to                                                                                                         |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| $OSSproductName$ $version$       | [$AESproductName$ $aesVersion$](/docs/edge-stack/$aesDocsVersion$/topics/install/upgrade/helm/emissary-2.2/edge-stack-2.2) |
| $OSSproductName$ 2.1.X           | [$OSSproductName$ $version$](../upgrade/helm/emissary-2.1/emissary-2.2)                                                    |
| $OSSproductName$ 2.0.5           | [$OSSproductName$ $version$](../upgrade/helm/emissary-2.0/emissary-2.2)                                                    |
| $OSSproductName$ 1.14.X          | [$OSSproductName$ $version$](../upgrade/helm/emissary-1.14/emissary-2.2)                                                   |
| $OSSproductName$ prior to 1.14.X | [$OSSproductName$ 1.14.X](../../../../1.14/topics/install/upgrading)                                                       |

## If you installed $OSSproductName$ manually by applying YAML

| If you're running.               | You can upgrade to                                                                                                         |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| $OSSproductName$ $version$       | [$AESproductName$ $aesVersion$](/docs/edge-stack/$aesDocsVersion$/topics/install/upgrade/yaml/emissary-2.2/edge-stack-2.2) |
| $OSSproductName$ 2.1.X           | [$OSSproductName$ $version$](../upgrade/yaml/emissary-2.1/emissary-2.2)                                                    |
| $OSSproductName$ 2.0.5           | [$OSSproductName$ $version$](../upgrade/yaml/emissary-2.0/emissary-2.2)                                                    |
| $OSSproductName$ 1.14.X          | [$OSSproductName$ $version$](../upgrade/yaml/emissary-1.14/emissary-2.2)                                                   |
| $OSSproductName$ prior to 1.14.X | [$OSSproductName$ 1.14.X](../../../../1.14/topics/install/upgrading)                                                       |
