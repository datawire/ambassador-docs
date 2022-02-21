import Alert from '@material-ui/lab/Alert';

# The Ambassador Operator

The Ambassador Operator is a Kubernetes Operator that controls the
complete lifecycle of $productName$ in your cluster. It also
automates many of the repeatable tasks you have to perform for $productName$. Once installed, the Ambassador Operator will automatically complete rapid
installations and seamless upgrades to new versions of $productName$.  [Read
more](https://github.com/datawire/ambassador-operator/blob/master/README.md)
about the benefits of the Operator.

A Kubernetes operator is a software extension that makes it easier to manage and automate your
Kubernetes-based applications, in the spirit of a human operator. Operators complete actions such
as deploying, upgrading and maintaining applications, and many others. Read more about Kubernetes
Operators [here](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

This document covers installing the Operator:

* [Manually](#install-the-operator)
* via [Helm chart](#install-via-helm-chart)

And also shows how the Operator [automatically
updates](#updates-by-the-operator) versions.

<Alert severity="info">
In order to use the operator to install $productName$ 2.0+,
you will need to install an operator version 1.3.0 or higher.
</Alert>

## Install the Operator

Start by installing the operator:

1. Create the Operator Custom Resource schema with the following command:
    ```
    kubectl apply -f https://github.com/datawire/ambassador-operator/releases/latest/download/ambassador-operator-crds.yaml
    ```
2. Install the actual CRD for the Ambassador Operator in the `ambassador` namespace with the following command:
    ```
    kubectl apply -n ambassador -f https://github.com/datawire/ambassador-operator/releases/latest/download/ambassador-operator.yaml
    ```

3. Once the new Operator is working, create a new `AmbassadorInstallation` based on the following YAML:

    ```yaml
    cat <<EOF | kubectl apply -n ambassador -f -
    apiVersion: getambassador.io/v2
    kind: AmbassadorInstallation
    metadata:
      name: ambassador
    spec:
      version: 2.*-ea
    EOF
    ```

## Install via Helm Chart

<Alert severity="info">
In order to use the operator to install $productName$ 2.0+,
you will need to install the ambassador-operator helm chart
version 0.3.0 or greater.
</Alert>

You can also install the Ambassador Operator from a Helm Chart. The following Helm values are supported:

* `image.name`: Operator image name
* `image.pullPolicy`: Operator image pull policy
* `namespace`: namespace in which to install the Operator

**To do so:**

1. Create the Operator Custom Resource schema with the following command:
    ```
    kubectl apply -f https://github.com/datawire/ambassador-operator/releases/latest/download/ambassador-operator-crds.yaml
    ```

2. Add the Helm repository to your Helm client:
    ```
    helm repo add datawire https://getambassador.io
    helm repo update
    ```
3. Run the following command:
    ```
    helm install --create-namespace -n ambassador ambassador-operator datawire/ambassador-operator
    ```
4. Once the new Operator is working, create a new `AmbassadorInstallation` based on the following YAML:

    ```yaml
    cat <<EOF | kubectl apply -n ambassador -f -
    apiVersion: getambassador.io/v2
    kind: AmbassadorInstallation
    metadata:
      name: ambassador
    spec:
      version: 2.*-ea
    EOF
    ```

## Configuration for $productName$

After the initial installation of $productName$, the Ambassador Operator will check for updates every 24 hours and
delay the update until the `updateWindow`  allows the update to proceed. It will use the `version` syntax for
determining if any new release is acceptable. When a new release is available and acceptable, the Operator
will upgrade $productName$.

For more details on how to configure your `AmbassadorInstallation`, including configuring `version` and `updateWindow`,
[please see the custom resource documentation](https://github.com/datawire/ambassador-operator/blob/master/docs/api/index.md).

### Version syntax and update window

To specify version numbers, use SemVer for the version number for any level of
precision. This can include [wildcard characters](https://github.com/Masterminds/semver#wildcards-in-comparisons).

  * `1.0` = exactly version 1.0
  * `1.1` = exactly version 1.1
  * `1.1.*` = version 1.1 and any bug fix versions 1.1.1, 1.1.2, 1.1.3, etc.
  * `2.*` = version 2.0 and any incremental and bug fix versions 2.0, 2.0.1, 2.0.2, 2.1, 2.2, 2.2.1, etc.
  * `*` = all versions.
  * `3.0-ea` = version 3.0-ea1 and any subsequent EA releases on 3.0. Also selects the final 3.0 once the
    final GA version is released.
  * `4.*-ea` = version 4.0-ea1 and any subsequent EA release on 4.0. This also selects:
      * the final GA 4.0.
      * any incremental and bug fix versions 4.* and 4
      * the most recent 4.* EA release (i.e., if 4.0.5 is the last GA version and
        there is a 4.1-EA3, then this selects 4.1-EA3 over the 4.0.5 GA).

Read more about _SemVer_ [here](https://github.com/Masterminds/semver#basic-comparisons).

[`updateWindow`](https://github.com/datawire/ambassador-operator/blob/master/docs/api/index.md#ambassadorinstallationspec)
is an optional item that will control when the updates can take
place. This is used to force system updates to happen during specified times.

There can be any number of `updateWindow` entries (separated by commas).
`Never` turns off automatic updates even if there are other entries in the
comma-separated list. `Never` is used by sysadmins to disable all updates during
blackout periods by doing a `kubectl` apply.

Each `updateWindow` is in crontab format (see https://crontab.guru/) Some
examples of `updateWindow` are:

* `0-6 * * * SUN`: every Sunday, from 0am to 6am
* `5 1 * * *`: every first day of the month, at 5am

The Operator cannot guarantee minute time granularity, so specifying a minute in the crontab
expression can lead to some updates happening sooner/later than expected.

## Customizing the installation with some Helm values

`helmValues` is an optional map of configurable parameters of the $productName$ chart
with some overriden values. Take a look at the [current list of values](https://artifacthub.io/packages/helm/datawire/edge-stack/$aesChartVersion$#configuration)
and their default values.

Example:

```yaml
apiVersion: getambassador.io/v2
kind: AmbassadorInstallation
metadata:
  name: ambassador
spec:
  version: "2.*-ea"
  helmValues:
    image:
      pullPolicy: Always
    namespace:
      name: ambassador
    service:
      ports:
        - name: http
          port: 80
          targetPort: 8080
      type: NodePort
```


## Updates by the Operator

After the `AmbassadorInstallation` is created for the first time, the Operator
will then use the list of releases available for the $productName$ Helm Chart for
determining the most recent version that can be installed, using the optional
`version` syntax for filtering the releases that are acceptable.

It will then install $productName$, using any extra arguments provided in the `AmbassadorInstallation`,
like the `baseImage`, the `logLevel` or any of the `helmValues`.

For example:

```yaml
 cat <<EOF | kubectl apply -n ambassador -f -
apiVersion: getambassador.io/v2
kind: AmbassadorInstallation
metadata:
  name: ambassador
spec:
  version: 2.0.0-ea
EOF
```

After applying an `AmbassadorInstallation` customer resource like this in a new cluster, the Operator will install a new instance of $productName$ 2.0.0-ea in the `ambassador` namespace, immediately. Removing this `AmbassadorInstallation` will uninstall $productName$ from this namespace.
