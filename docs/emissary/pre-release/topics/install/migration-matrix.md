import Alert from '@material-ui/lab/Alert';

# Upgrading $productName$

<Alert severity="info">
  The 2.X family introduces a number of changes to allow $productName$ to more gracefully handle
  larger installations (including multitenant or multiorganizational installations), reduce 
  memory footprint, and improve performance. In keeping with <a href="https://semver.org">SemVer</a>,
  $productName$ 2.X introduces some changes that aren't backward-compatible with 1.X, so <b>some
  configuration has changed</b> between 1.X and 2.X: if you're currently running 1.X, <b>please</b>&nbsp;
  read the <a href="/docs/emissary/latest/topics/install/migrate-to-version-2/">migration guide</a>&nbsp;
  before trying to install any 2.X version.<br/>
</Alert>

There are currently multiple paths for upgrading $productName$, depending on what version you're currently
running, what you want to be running, and whether you installed $OSSproductName$ using [Helm](../helm) or
YAML.

(To check out if you installed $OSSproductName$ using Helm, run `helm list --all` and see if your
$OSSproductName$ is listed. If so, you installed using Helm.)

## If you installed $OSSproductName$ using Helm

| If you're running.         | You can upgrade to |
|----------------------------|--------------------|
| $OSSproductName$ $version$ | [$AESproductName$ $version$](../upgrade/helm/emissary-2.1/edge-stack-2.1) |
| $OSSproductName$ 2.0.5     | [$AESproductName$ $version$](../upgrade/helm/emissary-2.0/edge-stack-2.1) or<br/>[$OSSproductName$ $version$](../upgrade/helm/emissary-2.0/emissary-2.1)   |
| $OSSproductName$ 1.14.2    | [$AESproductName$ $version$](../upgrade/helm/emissary-1.x/edge-stack-2.1) or<br/>[$OSSproductName$ $version$](../upgrade/helm/emissary-1.x/emissary-2.1)   |
| $OSSproductName$ prior to 1.14.2 | [$OSSproductName$ 1.14.2](../../../../1.14/topics/install/upgrading) first |


## If you installed $OSSproductName$ manually by applying YAML

| If you're running.         | You can upgrade to |
|----------------------------|--------------------|
| $OSSproductName$ $version$ | [$AESproductName$ $version$](../upgrade/yaml/emissary-2.1/edge-stack-2.1) |
| $OSSproductName$ 2.0.5     | [$AESproductName$ $version$](../upgrade/yaml/emissary-2.0/edge-stack-2.1) or<br/>[$OSSproductName$ $version$](../upgrade/yaml/emissary-2.0/emissary-2.1)   |
| $OSSproductName$ 1.14.2    | [$AESproductName$ $version$](../upgrade/yaml/emissary-1.x/edge-stack-2.1) or<br/>[$OSSproductName$ $version$](../upgrade/yaml/emissary-1.x/emissary-2.1)   |
| $OSSproductName$ prior to 1.14.2 | [$OSSproductName$ 1.14.2](../../../../1.14/topics/install/upgrading) first |
