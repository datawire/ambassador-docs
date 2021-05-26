## The power of Kubernetes annotations 

Have you ever been asked to troubleshoot a failing Kubernetes service and struggled to find basic information about the service such as the source repository and owner? Troubleshooting always begins with information gathering. 

Kubernetes annotations are designed to solve exactly this problem. They are designed to add metadata to Kubernetes objects. 

Using `kubectl`, let's create a basic service named `ghost-service` with the `a8r.io/description` annotation set to "An annotated ghost service that points to nowhere in particular".

Copy and paste this into your terminal:

```
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: Service
metadata:
  name: ghost-service
  annotations:
    a8r.io/description: "An annotated ghost service that points to nowhere in particular"
spec:
  ports:
    - protocol: TCP
      port: 80
EOF
```

You can easily view all of the annotations on your new service using `kubectl`:

```
$ kubectl describe svc ghost-service
  
  Name:              ghost-service
  Namespace:         default
  Labels:            <none>
  Annotations:       a8r.io/description: An annotated ghost service that points to nowhere in particular
  ...
```

<Alert severity="success"><b>Success!</b> You can easily add important metadata using Kubernetes annotations to your services. This information is invaluable when trying to resolve issues and understand your system.</Alert>

You can also add annotations using the `kubectl annotate` command:

```
$ kubectl annotate svc ghost-service a8r.io/owner=Casper
  
  service/ghost-service annotated
  
$ kubectl describe svc ghost-service 
  
  Name:              ghost-service
  Namespace:         default
  Labels:            <none>
  Annotations:       a8r.io/owner: Casper
                     a8r.io/description: An annotated ghost service that points to nowhere in particular
  ...
```

<Alert severity="success">
  <b>Congratulations!</b> You can easily add Kubernetes annotations to service via <code>kubectl annotate</code> and view the information via <code>kubectl describe</code>.
</Alert>

As your number of services grows it can be challenging to view all of the annotation information via `kubectl describe`. 

Ambassador Cloud Service Catalog provides a centralized view with an easily navigable web-based UI of your services running in all of your clusters. Let’s configure this now!

<Alert severity="info">
  Before proceeding, you can remove the <code>ghost-service</code> with <code>kubectl delete svc ghost-service</code>.
</Alert>

### What's next?

[Set up Service Catalog](../quick-start/) for a single source of truth for your team to see all your service annotations.