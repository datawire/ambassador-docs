import Alert from '@material-ui/lab/Alert';
import './index.less'

# Installing $productName$

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

<div class="docs-article-toc">
<h3>Contents</h3>

* [Install via Helm](#img-classos-logo-srcimageshelm-navypng-install-via-helm)
* [Install via Kubernetes YAML](#img-classos-logo-srcimageskubernetespng-install-via-kubernetes-yaml)
* [Install via the Ambassador Operator](#install-via-the-ambassador-operator)
* [Install Locally on Docker](#img-classos-logo-srcimagesdockerpng-install-locally-on-docker)
* [Upgrade Options](#upgrade-options)
* [Container Images](#container-images)
* [What's Next?](#whats-next)

</div>

## <img class="os-logo" src="../../images/helm-navy.png"/> Install via Helm
Helm, the package manager for Kubernetes, is the recommended way to install
$productName$. Full details are in the [Helm instructions.](helm/)

## <img class="os-logo" src="../../images/kubernetes.png"/> Install via Kubernetes YAML
Another way to install $productName$ if you are unable to use Helm is to
directly apply Kubernetes YAML. See details in the
[manual YAML installation instructions.](yaml-install).

## Install via the Ambassador Operator

The Ambassador Operator automates installs and updates, among other actions.
To use the Ambassador Edge Stack Operator, follow [the Ambassador Operator instructions](operator/).

## <img class="os-logo" src="../../images/docker.png"/> Install Locally on Docker
The Docker install will let you try the $productName$ locally in seconds,
but is not supported for production workloads. [Try $productName$ on Docker.](docker/)

## Upgrade Options
If you already have an existing installation of $AESproductName$ or
$OSSproductName$, you can upgrade your instance:

1. [Upgrade to $AESproductName$ from $OSSproductName$](upgrade-to-edge-stack/).
2. [Upgrade your $productName$ instance](upgrading/) to the latest version.

## Container Images
Although our installation guides will favor using the `docker.io` container registry,
we publish $AESproductName$ and $OSSproductName$ releases to multiple registries.

Starting with version 1.0.0, you can pull the $productDockerImage$ image from any of the following registries:
- `docker.io/datawire/`
- `quay.io/datawire/`
- `gcr.io/datawire/`

We want to give you flexibility and independence from a hosting platform's uptime to support
your production needs for $AESproductName$ or $OSSproductName$. Read more about
[Running $productName$ in Production](../running).

# What’s Next?
$productName$ has a comprehensive range of [features](/features/) to
support the requirements of any edge microservice. To learn more about how $productName$ works, along with use cases, best practices, and more,
check out the [Welcome page](../../) or read the [$productName$
Story](../../about/why-ambassador).
