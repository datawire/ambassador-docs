# Cluster-side configuration

For the most part, Telepresence doesn't require any special
configuration in the cluster, and can be used right away in any
cluster, as long as the user has adequate [permission](../rbac).

However, some advanced features do require some configuration in the
cluster.

# TLS

If other applications in the cluster expect to speak TLS to your
intercepted application (perhaps you're using a service-mesh that does
mTLS), in order to use `--mechanism=http` (or any features that imply
`--mechanism=http`) you need to tell Telepresence about the TLS
certificates in use.

Tell Telepresence about the certificates in use by adjusting your
workload's (eg. Deployment's) Pod template to set a couple of
annotations on the intercepted Pods:

```diff
 spec:
   template:
     metadata:
       labels:
         service: your-service
+      annotations:
+        "getambassador.io/inject-terminating-tls-secret": "your-terminating-secret"  # optional
+        "getambassador.io/inject-originating-tls-secret": "your-originating-secret"  # optional
     spec:
+      serviceAccountName: "your-account-that-has-rbac-to-read-those-secrets"
       containers:
```

- The `getambassador.io/inject-terminating-tls-secret` annotation
  (optional) names the Kubernetes Secret that contains the TLS server
  certificate to use for decrypting and responding to incoming
  requests.

  When Telepresence modifies the Service's and workload's port
  definitions to point at the Telepresence Agent sidecar's port
  instead of your application's actual port, the sidecar will use this
  certificate to terminate TLS.

- The `getambassador.io/inject-originating-tls-secret` annotation
  (optional) and names the Kubernetes Secret that contains the TLS
  client certificate to use for communicating with your application.

  If your application expects incoming requests to speak TLS (eg. your
  code expects to handle mTLS itself instead of letting a service-mesh
  sidecar handle mTLS for it; or the port definition that Telepresence
  modified pointed at the service-mesh sidecar instead of at your
  application), then you will need to set this.

  If you do set this, it is usually the correct thing to set it to the
  same client certificate Secret that you configure the Ambassador
  Edge Stack to use for mTLS.

It is only possible to refer to a Secret that is in the same Namespace
as the Pod.

The Pod will need to have permission to `get` and `watch` each of
those Secrets.

Telepresence understands `type: kubernetes.io/tls` Secrets and
`type: istio.io/key-and-cert` Secrets; as well as `type: Opaque`
Secrets that it detects to be formatted as one of those types.
