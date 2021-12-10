import Alert from '@material-ui/lab/Alert';

# $productName$ 2.X Migration Guide

## Run $productName$ $version$ in a separate cluster

When you run your $productName$ 1.X configuration in a separate cluster, it is not affected by changes meant for $productName$ $version$. However, this can result in extra effort and is not time-efficient.

1. Install $productName$ $version$ in a completely new cluster.

2. **Create `Listener`s for $productName$ $version$.**
   
   When $productName$ $version$ starts, it will not have any `Listener`s, and it will not
   create any. You must create `Listener` resources by hand, or $productName$ $version$
   will not listen on any ports.

3. Copy the entire configuration from the $productName$ 1.X cluster to the $productName$
   $version$ cluster. This is most simply done with `kubectl get -o yaml | kubectl apply -f -`.
   
   This will create `getambassador.io/v2` resources in the $productName$ $version$ cluster.
   $productName$ $version$ will translate them internally to `getambassador.io/v3alpha1`
   resources.

4. Each $productName$ instance has its own cluster, so you can test the new
   instance without disrupting traffic to the existing instance.

5. If you need to make changes, you can change the `getambassador.io/v2` resource, or convert the
   resource you're changing to `getambassador.io/v3alpha1` by using `kubectl edit`.

6. Once everything is working with both versions, transfer incoming traffic to the $productName$
   $version$ cluster.
