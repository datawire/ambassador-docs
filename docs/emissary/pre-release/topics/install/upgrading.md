import Alert from '@material-ui/lab/Alert';

# Upgrading $productName$

<Alert severity="warning">
  To migrate from $productName$ 1.X to $productName$ 2.X, see the <a href="../migrate-to-version-2">$productName$ 2.X Migration Guide</a>.
  This guide <b>will not work</b> for that, due to changes to the configuration resources used for $productName$ 2.X. 
</Alert>

Since $productName$'s configuration is entirely stored in Kubernetes resources, no special process
is necessary to upgrade $productName$.

The steps to upgrade depend on the method that was used to install $productName$, as indicated below.

## Installed via Helm?

If you installed using the Helm chart, then you should
[upgrade with the help of Helm](../helm/#upgrading-an-existing-installation).
To verify this, run the following command to see if it returns resources:
```
$ kubectl get deployment -n ambassador -l 'app.kubernetes.io/name=ambassador'
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
ambassador         1/1     1            1           ...
```

## Installed via YAML manifests?

Finally, if you installed using YAML manifests, simply run the commands in the following section. To verify whether manifests were used to install $productName$, run the following command to see if it returns resources:
```
$ kubectl get deployment -n ambassador -l 'product=aes'
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
ambassador         1/1     1            1           ...
```

If none of the commands above return resources, you probably have an old installation and you should follow
the instructions for [upgrading to $productName$](../upgrade-to-edge-stack/).

### Upgrading an installation with YAML manifests

If you previously installed $productName$ using YAML manifests, you can upgrade with
these commands:

```
kubectl apply -f https://www.getambassador.io/yaml/emissary/$version$/emissary-crds.yaml
kubectl apply -f https://www.getambassador.io/yaml/emissary/$version$/emissary-ingress.yaml
```

This will trigger a rolling upgrade of $productName$.

If you're using your own YAML, check our YAML to be sure of other changes.  At a minimum
you'll need to change the pulled `image` for the $productName$ container and redeploy.

### Set Up Service Catalog

Upgrading to version 1.12 or higher adds support for Service Catalog. [Set up Service Catalog](../../../tutorials/getting-started/#3-connect-your-cluster-to-ambassador-cloud) to view all of your service metadata in Ambassador Cloud.