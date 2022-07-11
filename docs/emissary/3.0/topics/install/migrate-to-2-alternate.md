---
    Title: Migrate to $productName$ $versionTwoX$
    description: "Instructions for how to upgrade Ambassador Labs' $productName$ to $versionTwoX$. Transfer your current configuration of $AESproductName$ or $OSSproductName$ to $versionTwoX$."
---
import Alert from '@material-ui/lab/Alert';

# Upgrading $productName$ with a separate cluster

You can upgrade from any version of $AESproductName$ or $OSSproductName$ to
any version of either by installing the new version in a new Kubernetes cluster,
then copying over configuration as needed. This is the way to be absolutely
certain that each installation cannot affect the other: it is extremely safe,
but is also significantly more effort.

For example, to upgrade from some other version of $AESproductName$ or
$OSSproductName$ to $productName$ $versionTwoX$:

1. Install $productName$ $versionTwoX$ in a completely new cluster.

2. **Create `Listener`s for $productName$ $versionTwoX$.**

   When $productName$ $versionTwoX$ starts, it will not have any `Listener`s, and it will not
   create any. You must create `Listener` resources by hand, or $productName$ $versionTwoX$
   will not listen on any ports.

3. Copy the entire configuration from the $productName$ 1.X cluster to the $productName$
   $versionTwoX$ cluster. This is most simply done with `kubectl get -o yaml | kubectl apply -f -`.

   This will create `getambassador.io/v2` resources in the $productName$ $versionTwoX$ cluster.
   $productName$ $versionTwoX$ will translate them internally to `getambassador.io/v3alpha1`
   resources.

4. Each $productName$ instance has its own cluster, so you can test the new
   instance without disrupting traffic to the existing instance.

5. If you need to make changes, you can change the `getambassador.io/v2` resource, or convert the
   resource you're changing to `getambassador.io/v3alpha1` by using `kubectl edit`.

6. Once everything is working with both versions, transfer incoming traffic to the $productName$
   $versionTwoX$ cluster.
