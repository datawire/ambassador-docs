import Alert from '@material-ui/lab/Alert';

# ExternalDNS with $productName$

[ExternalDNS](https://github.com/kubernetes-sigs/external-dns) configures your existing DNS provider to make Kubernetes resources discoverable via public DNS servers by getting resources from the Kubernetes API to create a list of DNS records.


## Getting started

### Prerequisites

With certain DNS providers, additional configuation may be needed. Start by checking the [ExternalDNS repo's deployment instructions](https://github.com/kubernetes-sigs/external-dns#deploying-to-a-cluster) for information about the supported DNS providers and steps to setup ExternalDNS for your provider.


### Installation

Configuration for a `ServiceAccount`, `ClusterRole`, and `ClusterRoleBinding` are necessary for the ExternalDNS deployment to support compatability with $productName$.

1. Create a YAML file named `externaldns-config.yaml`, and copy the following configuration into it.


   <Alert severity="info">
     Ensure that the <code>apiGroups</code> include <code>"getambassador.io"</code> following <code>"networking.k8s.io"</code> and the <code>resources</code> include <code>"hosts"</code> after <code>"ingresses"</code>.
   </Alert>


  ```yaml
  ---
  apiVersion: v1
  kind: ServiceAccount
  metadata:
	  name: external-dns
	  annotations: eks.amazonaws.com/role-arn: {Role ARN}
  ---
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRole
  metadata:
	  name: external-dns
  rules:
	  - apiGroups: [""]
		  resources: ["services","endpoints","pods"]
		  verbs: ["get","watch","list"]
	  - apiGroups: ["extensions","networking.k8s.io", ***"getambassador.io"***]
		  resources: ["ingresses", ***"hosts"***]
		  verbs: ["get","watch","list"]
	  - apiGroups: [""]
		  resources: ["nodes"]
		  verbs: ["list","watch"]
  ---
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRoleBinding
  metadata:
	  name: external-dns-viewer
  roleRef:
	  apiGroup: rbac.authorization.k8s.io
	  kind: ClusterRole
	  name: external-dns
  subjects:
	  - kind: ServiceAccount
		  name: external-dns
		  namespace: default
  ---
  apiVersion: apps/v1
  kind: Deployment
  metadata:
	  name: external-dns
  spec:
  strategy:
	  type: Recreate
  selector:
	  matchLabels:
	  app: external-dns
  template:
	  metadata:
	  labels:
			  app: external-dns
  spec:
	  serviceAccountName: external-dns
	  containers:
	  - name: external-dns
			  image: registry.opensource.zalan.do/teapot/external-dns:latest
			  args:
			  - --source=ambassador-host
  ```



2. Review the arguments section from the ExternalDNS deployment and configure or remove them to fit your needs. Additional arguments required for your DNS provider can be found by checking the [ExternalDNS repo's deployment instructions](https://github.com/kubernetes-sigs/external-dns#deploying-to-a-cluster).


   - `- --source=ambassador-host` Required to tell ExternalDNS to look for hostnames in the $productName$ `Host` configurations.


3. Apply the above config with the following command to deploy ExternalDNS to your cluster and configure support for $productName$

   ```shell
   kubectl apply -f externaldns-ambassador.yaml
   ```


4. After applying the above configuration, ExternalDNS is ready to use. Configure a `Host` with the following annotation to allow ExternalDNS to get the IP address of your $productName$'s LoadBalancer and register it with your DNS provider. 

```yaml
  apiVersion: getambassador.io/v3alpha1
  kind: Host
  metadata:
	  name: your-hostname
  annotations:
	  external-dns.ambassador-service: emissary-ingress.emissary
  spec:
	  acmeProvider:
	  authority: none
	  hostname: your-hostname.example.com
```


<Alert severity="success"><b>Victory!</b> ExternalDNS is now running and configured to report $productName$'s IP and hostname with your DNS provider.</Alert>