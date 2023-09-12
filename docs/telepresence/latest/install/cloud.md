# Provider Prerequisites for Traffic Manager

## GKE

### Firewall Rules for private clusters

A GKE cluster with private networking will come preconfigured with firewall rules that prevent the Traffic Manager's
webhook injector from being invoked by the Kubernetes API server.
For Telepresence to work in such a cluster, you'll need to [add a firewall rule](https://cloud.google.com/kubernetes-engine/docs/how-to/private-clusters#add_firewall_rules) allowing the Kubernetes masters to access TCP port `8443` in your pods.
For example, for a cluster named `tele-webhook-gke` in region `us-central1-c1`:

```bash
$ gcloud container clusters describe tele-webhook-gke --region us-central1-c | grep masterIpv4CidrBlock
  masterIpv4CidrBlock: 172.16.0.0/28 # Take note of the IP range, 172.16.0.0/28

$ gcloud compute firewall-rules list \
    --filter 'name~^gke-tele-webhook-gke' \
    --format 'table(
        name,
        network,
        direction,
        sourceRanges.list():label=SRC_RANGES,
        allowed[].map().firewall_rule().list():label=ALLOW,
        targetTags.list():label=TARGET_TAGS
    )'

NAME                                  NETWORK           DIRECTION  SRC_RANGES     ALLOW                         TARGET_TAGS
gke-tele-webhook-gke-33fa1791-all     tele-webhook-net  INGRESS    10.40.0.0/14   esp,ah,sctp,tcp,udp,icmp      gke-tele-webhook-gke-33fa1791-node
gke-tele-webhook-gke-33fa1791-master  tele-webhook-net  INGRESS    172.16.0.0/28  tcp:10250,tcp:443             gke-tele-webhook-gke-33fa1791-node
gke-tele-webhook-gke-33fa1791-vms     tele-webhook-net  INGRESS    10.128.0.0/9   icmp,tcp:1-65535,udp:1-65535  gke-tele-webhook-gke-33fa1791-node
# Take note fo the TARGET_TAGS value, gke-tele-webhook-gke-33fa1791-node

$ gcloud compute firewall-rules create gke-tele-webhook-gke-webhook \
    --action ALLOW \
    --direction INGRESS \
    --source-ranges 172.16.0.0/28 \
    --rules tcp:8443 \
    --target-tags gke-tele-webhook-gke-33fa1791-node --network tele-webhook-net
Creating firewall...⠹Created [https://www.googleapis.com/compute/v1/projects/datawire-dev/global/firewalls/gke-tele-webhook-gke-webhook].
Creating firewall...done.
NAME                          NETWORK           DIRECTION  PRIORITY  ALLOW     DENY  DISABLED
gke-tele-webhook-gke-webhook  tele-webhook-net  INGRESS    1000      tcp:8443        False
```

### GKE Authentication Plugin

Starting with Kubernetes version 1.26 GKE will require the use of the [gke-gcloud-auth-plugin](https://cloud.google.com/blog/products/containers-kubernetes/kubectl-auth-changes-in-gke).
You will need to install this plugin to use Telepresence with Docker while using GKE. 

If you are using the [Telepresence Docker Extension](../../docker/extension) you will need to ensure that your `command` is set to an absolute path in your kubeconfig file. If you've installed not using homebrew you may see in your file `command: gke-gcloud-auth-plugin`. This would need to be replaced with the path to the binary.
You can check this by opening your kubeconfig file, and under the `users` section with your GKE cluster there is a `command` if you've installed with homebrew it would look like this 
`command: /opt/homebrew/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/bin/gcloud`.

## EKS

### EKS Authentication Plugin

If you are using AWS CLI version earlier than `1.16.156` you will need to install [aws-iam-authenticator](https://docs.aws.amazon.com/eks/latest/userguide/install-aws-iam-authenticator.html).
You will need to install this plugin to use Telepresence with Docker while using EKS.

If you are using the [Telepresence Docker Extension](../../docker/extension) you will need to ensure that your `command` is set to an absolute path in your kubeconfig file instead of a relative path.
You can check this by opening your kubeconfig file, and under the `users` section with your EKS cluster there is a `command` if you've installed with homebrew it would look like this 
`command: /opt/homebrew/Cellar/aws-iam-authenticator/0.6.2/bin/aws-iam-authenticator`.