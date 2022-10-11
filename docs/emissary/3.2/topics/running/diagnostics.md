# Diagnostics

With $productName$ Diagnostics and Ambassador Cloud, you get a summary of the current status and Mappings of your cluster and it's services, which gets displayed
in [Diagnostics Overview](https://www.getambassador.io/docs/cloud/latest/diagnostics-ui/view-diagnostics/).

## Troubleshooting

### Can't access $productName$ Diagnostics Overview?

Create an Ambassador `Module` if one does not already exist, and add the following config to enable diagnostics data.

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
spec:
  config:
    diagnostics:
      enabled: true
```
Next, In the deployment for Edge Stack / Emissary-ingress set the <code>AES_REPORT_DIAGNOSTICS_TO_CLOUD</code> environment variable to `"true"` to allow diagnostics information to be reported to the cloud.

  ```bash
  # Namespace and deployment name depend on your current install

  kubectl set env deployment/edge-stack-agent -n ambassador AES_REPORT_DIAGNOSTICS_TO_CLOUD="true"
  ```

Finally, set the `AES_DIAGNOSTICS_URL` environment variable to `"http://emissary-ingress-admin:8877/ambassador/v0/diag/?json=true"`

  ```bash
  # Namespace, deployment name, and pod url/port depend on your current install

  kubectl set env deployment/edge-stack-agent -n ambassador AES_DIAGNOSTICS_URL="http://emissary-ingress-admin:8877/ambassador/v0/diag/?json=true"
  ```

After setting up `AES_DIAGNOSTICS_URL`, you can access diagnostics information by using the same URL value. 

### Still can't see $productName$ Diagnostics?

Do a port forward on your $productName$ pod

  ```bash
  # Namespace, deployment name, and pod url/port depend on your current install

  kubectl port-forward edge-stack-76f785767-n2l2v -n ambassador 8877
  ```

You will be able to access the diagnostics overview page by going to `http://localhost:8877/ambassador/v0/diag/`

### $productName$ not routing your services as expected?

You will need to examine the logs and $productName$ pod status. See [Debugging](../debugging) for more information.
