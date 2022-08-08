---
title: "$productName$ - HTTP/3 support for Azure Kubernetes Service (AKS)"
description: "How to configure HTTP/3 support for Azure Kubernetes Service (AKS). This guide shows how to setup the LoadBalancer service for AKS to support both TCP and UDP communications."
---

# Azure Kubernetes Service Engine HTTP/3 configuration

This guide shows how to setup HTTP/3 support for Azure Kubernetes Service (AKS). The instructions provided in this page are a continuation of the [HTTP/3 in $productName$](../../../../topics/running/http3) documentation.

## Configuring an external load balancer for AKS

To configure an external load balancer for AKS, you need to:

1. Reserve a public static IP address.
2. Create two `LoadBalancer` services, one for TCP and one for UDP.
3. Assign the public static IP address to the `loadBalancerIP` field.

An example of the two load balancer services described above looks as follows:

```yaml
# selectors and labels removed for clarity
apiVersion: v1
kind: Service
metadata:
  name: $productDeploymentName$
  namespace: $productNamespace$
spec:
  type: LoadBalancer
  loadBalancerIP: xx.xx.xx.xx # Enter your public static IP address here.
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
    - name: https
      port: 443
      targetPort: 8443
      protocol: TCP
  ---
  apiVersion: v1
kind: Service
metadata:
  name: $productDeploymentName$-udp
  namespace: $productNamespace$
spec:
  type: LoadBalancer
  loadBalancerIP: xx.xx.xx.xx # Enter your public static IP address here.
  ports:
    - name: http3
      port: 443  # Default support for HTTP/3 requires you to use 443 for the external client-facing port.
      targetPort: 8443
      protocol: UDP

```

In the above example, AKS generates two `LoadBalancer` services, one for UDP and the other for TCP.

<Alert severity="info">
You should verify that the Managed Identity or Serivce Principal has permissions to assign the IP address to the newly created <code>LoadBalancer</code> services. Refer to the <a href="https://docs.microsoft.com/en-us/azure/aks/use-managed-identity" target="_blank">Azure Docs - Managed Identity</a> for more information.
</Alert>
