import './index.less'

# Installing the Ambassador Edge Stack

<div class="docs-article-toc">
<h3>Contents</h3>

* [Install for macOS](#img-classos-logo-srcimagesapplepng-install-for-macos)
* [Install for Linux](#img-classos-logo-srcimageslinuxpng-install-for-linux)
* [Install for Windows](#img-classos-logo-srcimageswindowspng-install-for-windows)
* [Install via Kubernetes YAML](#img-classos-logo-srcimageskubernetespng-install-via-kubernetes-yaml)
* [Install via Helm](#img-classos-logo-srcimageskubernetespng-install-via-kubernetes-yaml)
* [Install Locally on Docker](#img-classos-logo-srcimageskubernetespng-install-via-kubernetes-yaml)
* [Install via the Ambassador Operator](#install-via-the-ambassador-operator)
* [Install on Bare Metal](#install-on-bare-metal)
* [Upgrade Options](#upgrade-options)
* [Container Images](#container-images)
* [What's Next?](#whats-next)

</div>

## <img class="os-logo" src="../../images/apple.png"/> Install for macOS 	
1. (1a) [Download the `edgectl` installer](https://metriton.datawire.io/downloads/darwin/edgectl) 	
 or (1b) download it with a curl command:	

    ```	
    sudo curl -fL https://metriton.datawire.io/downloads/darwin/edgectl -o /usr/local/bin/edgectl && sudo chmod a+x /usr/local/bin/edgectl	
    ```	

    If you decide to download the file with (1b), you may encounter a security block. To continue, use this procedure:	
    * Go to **System Preferences > Security & Privacy > General**.	
    * Click the **Open Anyway** button.	
    * On the new dialog, click the **Open** button.	

2. Run the installer with `edgectl install`	

3. The installer will provision a load balancer, configure TLS, 	
and provide you with an `edgestack.me` subdomain. The `edgestack.me` subdomain 	
allows the Ambassador Edge Stack to automatically provision TLS and HTTPS	
for a domain name, so you can get started right away.	

4. [Set up Service Catalog](../../tutorials/getting-started/#3-connect-your-cluster-to-ambassador-cloud) to view all of your service metadata in Ambassador Cloud.

## <img class="os-logo" src="../../images/linux.png"/> Install for Linux 	

1. (1a) [Download the `edgectl` installer](https://metriton.datawire.io/downloads/linux/edgectl) or	
 (1b) download it with a curl	
   command:	

    ```	
    sudo curl -fL https://metriton.datawire.io/downloads/linux/edgectl -o /usr/local/bin/edgectl && sudo chmod a+x /usr/local/bin/edgectl	
    ```	
2. Run the installer with `edgectl install`	

3. The installer will provision a load balancer, configure TLS, 	
and provide you with an `edgestack.me` subdomain. The `edgestack.me` subdomain 	
allows the Ambassador Edge Stack to automatically provision TLS and HTTPS	
for a domain name, so you can get started right away.	

4. [Set up Service Catalog](../../tutorials/getting-started/#3-connect-your-cluster-to-ambassador-cloud) to view all of your service metadata in Ambassador Cloud.

## <img class="os-logo" src="../../images/windows.png"/> Install for Windows 	

1. [Download the `edgectl.exe` installer](https://metriton.datawire.io/downloads/windows/edgectl.exe).	
2. Run the installer with `edgectl install`	
3. The installer will provision a load balancer, configure TLS, 	
and provide you with an `edgestack.me` subdomain. The `edgestack.me` subdomain 	
allows the Ambassador Edge Stack to automatically provision TLS and HTTPS	
for a domain name, so you can get started right away.	

4. [Set up Service Catalog](../../tutorials/getting-started/#3-connect-your-cluster-to-ambassador-cloud) to view all of your service metadata in Ambassador Cloud.

## <img class="os-logo" src="../../images/kubernetes.png"/> Install via Kubernetes YAML 
Kubernetes via YAML is the most common approach to install Ambassador Edge Stack,
especially in production environments, with our default, customizable manifest.
So if you want complete configuration control over specific parameters of your
installation, use the [manual YAML installation method](yaml-install).

## <img class="os-logo" src="../../images/helm-navy.png"/> Install via Helm 
Helm, the package manager for Kubernetes, is another popular way to install
Ambassador Edge Stack through the pre-packaged Helm chart. Full details, including
the differences for Helm 2 and Helm3, are in the [Helm instructions.](helm/)

## <img class="os-logo" src="../../images/docker.png"/> Install Locally on Docker 
The Docker install will let you try the Ambassador Edge Stack locally in seconds, 
but is not supported for production workloads. [Try Ambassador on Docker.](docker/)

## Install via the Ambassador Operator
The Ambassador Edge Stack Operator automates installs (day 1 operations) and
updates (day 2 operations), among other actions. To use the powerful Ambassador
Operator, [follow the Ambassador Edge Stack Operator instructions](aes-operator).

## Install on Bare Metal
If you don't have a load balancer in front of your Kubernetes, the Bare Metal 
installation mechanism can still be used to expose the Ambassador Edge Stack. 
We've got [instructions for bare metal installations](bare-metal) including exposing 
the Ambassador Edge Stack via a NodePort or the host network.

## Upgrade Options
If you already have an existing installation of the Ambassador Edge Stack or
Ambassador API Gateway, you can upgrade your instance:

1. [Upgrade to the Ambassador Edge Stack from the API Gateway](upgrade-to-edge-stack/).
2. [Upgrade your Ambassador Edge Stack instance](upgrading/) to the latest version.

## Container Images
Although our installation guides will favor using the `docker.io` container registry,
we publish the Ambassador Edge Stack and Ambassador API Gateway releases to multiple registries.

Starting with version 1.0.0, you can pull the `ambassador` and `aes` images from any of the following registries:
- `docker.io/datawire/`
- `quay.io/datawire/`
- `gcr.io/datawire/`

We want to give you flexibility and independence from a hosting platform's uptime to support
your production needs for Ambassador Edge Stack or Ambassador API Gateway. Read more about 
[Running Ambassador in Production](../running).

# What’s Next?
The Ambassador Edge Stack has a comprehensive range of [features](/features/) to
support the requirements of any edge microservice. To learn more about how the
Ambassador Edge Stack works, along with use cases, best practices, and more,
check out the [Welcome page](../../) or read the [Ambassador
Story](../../about/why-ambassador).
