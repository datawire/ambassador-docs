import Alert from '@material-ui/lab/Alert';
import './index.less'

# Installing $productName$

## <img class="os-logo" src="../../images/helm-navy.png" alt="Helm logo" /> Install with Helm

Helm, the package manager for Kubernetes, is the recommended way to install
[$productName$](../../tutorials/getting-started/). Full details are in the [Helm instructions.](helm/)

## <img class="os-logo" src="../../images/kubernetes.png" alt="Kebernetes logo" /> Install with Kubernetes YAML

Another way to install $productName$ if you are unable to use Helm is to
directly apply Kubernetes YAML. See details in the
[manual YAML installation instructions.](yaml-install).

## <img class="os-logo" src="../../images/docker.png" alt="Docker logo" /> Try the demo with Docker

The Docker install will let you try the $productName$ locally in seconds,
but is not supported for production workloads. [Try $productName$ on Docker.](docker/)

## Upgrade or migrate to a newer version

If you already have an existing installation of $AESproductName$ or
$OSSproductName$, you can upgrade your instance. The [migration matrix](migration-matrix/)
shows you how.

## Container Images

Although our installation guides will favor using the `docker.io` container registry,
we publish $AESproductName$ and $OSSproductName$ releases to multiple registries.

Starting with version 1.0.0, you can pull the emissary image from any of the following registries:

- `docker.io/emissaryingress/`
- `gcr.io/datawire/`

We want to give you flexibility and independence from a hosting platform's uptime to support
your production needs for $AESproductName$ or $OSSproductName$. Read more about
[Running $productName$ in Production](../running).

# What’s Next?

[$productName$](../../about/alternatives/) has a comprehensive range of [features](/features/) to
support the requirements of any edge microservice. To learn more about how $productName$ works, along with use cases, best practices, and more,
check out the [Welcome page](../../tutorials/getting-started) or read the [$productName$
Story](../../about/why-ambassador).
