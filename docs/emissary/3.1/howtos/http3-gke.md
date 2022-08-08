---
title: "$productName$ - HTTP/3 support for Google Kubernetes Engine (GKE)"
description: "How to configure HTTP/3 support for Google Kubernetes Engine (GKE). This guide shows how to setup the LoadBalancer service for GKE to support both TCP and UDP communications."
---

# Google Kubernetes Service Engine HTTP/3 configuration

This guide shows how to setup HTTP/3 support for Google Kubernetes Engine (GKE). The instructions provided in this page are a continuation of the [HTTP/3 in $productName$](../../../../topics/running/http3) documentation.

## Configuring an external load balancer for GKE

Currently, GKE only supports adding feature flags to `alpha` clusters, and doesn't support the creation of mixed protocol services of type `LoadBalancer`. To configure an external load balancer for GKE, you need to:

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

In the above example, GKE generates two `LoadBalancer` services, one for UDP and the other for TCP.
