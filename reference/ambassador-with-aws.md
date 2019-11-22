# Ambassador on AWS

For the most part, Ambassador is platform agnostic and will run in the same way regardless of the your Kubernetes installation.

This is mostly true of AWS as well. The various methods of deploying Ambassador outlined in the [installation guide](/user-guide/install) will all work on AWS the same way they do on any Kubernetes installation. 

However, Kubernetes exposes various annotations for controlling the configuration of the AWS load balancer deployed via a Kubernetes `type: LoadBalancer` service. 

This guide goes over considerations that must be made when using these annotations with Ambassador. You can 

**Note:** By default `type: LoadBalancer` will deploy an Elastic Load Balancer (ELB) running in L4 mode. This is typically enough for most users and the configuration options laid out below are not required.

## AWS load balancer notes

AWS provides three types of load balancers:

* "Classic" Load Balancer (abbreviated ELB or CLB, sometimes referred to as ELBv1 or Elastic Load Balancer)
  * Supports L4 (TCP, TCP+SSL) and L7 load balancing (HTTP 1.1, HTTPS 1.1)
  * Does not support WebSockets unless running in L4 mode
  * Does not support HTTP 2 (which is required for GRPC) unless running in L4 mode
  * Can perform SSL/TLS offload
* Application Load Balancer (abbreviated ALB, sometimes referred to as ELBv2)
  * Supports L7 only
  * Supports WebSockets
  * Supports a broken implementation of HTTP2 (trailers are not supported and these are needed for GRPC)
  * Can perform SSL/TLS offload
* Network Load Balancer (abbreviated NLB)
  * Supports L4 only
  * Cannot perform SSL/TLS offload

In Kubernetes, when using the AWS integration and a service of type `LoadBalancer`, the only types of load balancers that can be created are ELBs and NLBs (in Kubernetes 1.9 and later). When `aws-load-balancer-backend-protocol` is set to `tcp`, AWS will create a L4 ELB. When `aws-load-balancer-backend-protocol` is set to `http`, AWS will create a L7 ELB.

## Load Balancer Annotations

There are a number of `aws-load-balancer` annotations that can be configured in the Ambassador service to control the AWS load balancer it deploys. You can view all of them in the [Kubernetes documentation](https://kubernetes.io/docs/concepts/cluster-administration/cloud-providers/#load-balancers). This document will go over the subset that is most relevant when deploying Ambassador.

- `service.beta.kubernetes.io/aws-load-balancer-ssl-cert`: 
    Configures the load balancer to use a valid certificate ARN to terminate TLS at the Load Balancer.
    
    Traffic from the client into the load balancer is encrypted but, since TLS is being terminated at the load balancer, traffic from the load balancer to Ambassador will be cleartext and Ambassador will be listening on the cleartext port 8080.

- `service.beta.kubernetes.io/aws-load-balancer-ssl-ports`:
    Configures which port the load balancer will be listening for SSL traffic on. Defaults to `"*"`.

    If you want to enabled cleartext redirection, make sure to set this to `"443"` so traffic on port 80 will come in over cleartext.

- `service.beta.kubernetes.io/aws-load-balancer-backend-protocol`:
    Configures the ELB to operate in L4 or L7 mode. Can be set to `"tcp"`/`"ssl"` for an L4 listener or `"http"`/`"https"` for an L7 listener. Defaults to `"http"` and uses `"https"` if `aws-load-balancer-ssl-cert` is set.

- `service.beta.kubernetes.io/aws-load-balancer-type: "nlb"`:
    When this annotation is set it will launch a Network Load Balancer (NLB) instead of a classic ELB.
    
- `service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled`:
    Configures the ELB to load balance across zones. For high availability, it is typical to deploy nodes across availability zones so this should be set to `"true"`.
    
- `service.beta.kubernetes.io/aws-load-balancer-proxy-protocol`:
    Configures the ELB to enable the proxy protocol. `"*"`, which enables the proxy protocol on all ELB backends, is the only acceptable value.

    If setting this value, you need to make sure Envoy is configured to use the proxy protocol. This can be configured by setting `use_proxy_proto: true` and `use_remote_address: false` in the [ambassador `Module`](/reference/core/ambassador). **Note:** a restart of Ambassador is required for this configuration to take effect.
    

## Yaml Configuration

The following is a sample configuration for deploying Ambassador in AWS using Kubernetes YAML manifests:

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: ambassador
  namespace: {{ ambassador namespace }}
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "{{ tls certificate ARN }}"
    service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "443"
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: "tcp"
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
    service.beta.kubernetes.io/aws-load-balancer-proxy-protocol: "*"
    getambassador.io/config: |
      ---
      apiVersion: ambassador/v1
      kind:  Module
      name:  ambassador
      config:
        use_proxy_proto: true
        use_remote_address: false
spec:
  externalTrafficPolicy: Local
  type: LoadBalancer
  ports:
  - name: ambassador
    port: 443
    targetPort: 8080
  selector:
    service: ambassador
```

In this configuration, an ELB is deployed with a multi-domain AWS Certificate Manager certificate and configured to terminate TLS on requests over port 443 and forward to Ambassador listening for cleartext on 8080. The ELB is configured to route TCP to support both WebSockets and HTTP. It also enables the proxy protocol so Ambassador needs to be configured to handle that by configuring an Ambassador `Module`.

## Helm Values Configuration

The following in a sample configuration for deploying Ambassador in AWS with some load balancer annotations using the Ambassador Helm chart.

Create a values file with the following content:

`values.aws.yaml`
```yaml
service:
  http:
    enabled: true
    port: 80
    targetPort: 8080

  https:
    enabled: true
    port: 443
    targetPort: 8443

  annotations:
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "{{ tls certificate arn }}"
    service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "443"
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: "http"
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
    getambassador.io/config: |
      --- 
      apiVersion: ambassador/v1
      kind:  Module
      name:  ambassador
      config:
        use_proxy_proto: false
        use_remote_address: false
        x_forwarded_proto_redirect: true
```

Install with: 
```
helm install --name ambassador stable/ambassador
```

In this configuration, an ELB is deployed with a multi-domain AWS Certificate Manager certificate. The ELB is configured to route in L7 mode, which means only HTTP(S) traffic is supported, and not web sockets. TLS termination occurs at the ELB. Automatic redirection of HTTP to HTTPS is enabled. Downstream services can extract the client IP from the `X-FORWARDED-FOR` header

## TLS Termination

As with any Kubernetes environment, Ambassador can be configured to perform SSL offload by configuring a tls [`Module`](/reference/core/tls) or [`TLSContext`](/user-guide/sni). Refer to the [TLS Termination](/user-guide/tls-termination) documentation for more information. 

In AWS, you can also perform SSL offload with an ELB or ALB. If you choose to terminate TLS at the LB, Ambassador should be configured to listen for cleartext traffic on the default port 80. An example of this using an L4 ELB is shown at the top of this document. 

Enabling HTTP -> HTTPS redirection will depend on if your load balancer is running in L4 or L7 mode.

### L4 Load Balancer

When running an ELB in L4 mode, you will need to listen on two ports to redirect all incoming HTTP requests to HTTPS. The first port will listen for HTTP traffic to redirect to HTTPS, while the second port will listen for HTTPS traffic.

Let's say,
- port 80 on the load balancer forwards requests to port 8080 on Ambassador
- port 443 on the load balancer forwards requests to port 8443 on Ambassador



First off, configure this forwarding in your load balancer.

```yaml
spec:
  externalTrafficPolicy: Local
  type: LoadBalancer
  ports:
  - name: https
    port: 443
    targetPort: 8443
  - name: http
    port: 80
    targetPort: 8080
```

Now, we want every request on port 80 to be redirected to port 443.

To achieve this, you need to use `redirect_cleartext_from` as follows -

```yaml
apiVersion: ambassador/v1
kind:  Module
name:  tls
config:
  server:
    enabled: True
    redirect_cleartext_from: 8080
```

**Note:** Ensure there is no `ambassador-certs` secret in Ambassador's Namespace. If present, the tls `Module` will configure Ambassador to expect HTTPS traffic.

Editing the example service configuration above will give us:

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: ambassador
  namespace: {{ ambassador namespace }}
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "{{ tls certificate ARN }}"
    service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "443"
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: "tcp"
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
    service.beta.kubernetes.io/aws-load-balancer-proxy-protocol: "*"
    getambassador.io/config: |
      ---
      apiVersion: ambassador/v1
      kind:  Module
      name:  ambassador
      config:
        use_remote_address: false
        use_proxy_proto: true
      ---
      apiVersion: ambassador/v1
      kind: Module
      name: tls
      config:
        server:
          enabled: true
          redirect_cleartext_from: 8080
spec:
  externalTrafficPolicy: Local
  type: LoadBalancer
  ports:
  - name: https
    port: 443
    targetPort: 8443
  - name: http
    port: 80
    targetPort: 8080
  selector:
    service: ambassador
```

This configuration makes Ambassador start a new listener on 8080 which redirects all cleartext HTTP traffic to HTTPS.

**Note:** Ambassador only supports standard ports (80 and 443) on the load balancer for L4 redirection, [yet](https://github.com/datawire/ambassador/issues/702)! For instance, if you configure port 8888 for HTTP and 9999 for HTTPS on the load balancer, then an incoming request to `http://<host>:8888` will be redirected to `https://<host>:8888`. This will fail because HTTPS listener is on port 9999.

### L7 Load Balancer

If you are running the load balancer in L7 mode, then you will want to redirect all the incoming HTTP requests without the `X-FORWARDED-PROTO: https` header to HTTPS. Here is an example Ambassador configuration for this scenario:

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: ambassador
  namespace: {{ ambassador namespace }}
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "{{ tls certificate ARN }}"
    service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "443"
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: "http"
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
    service.beta.kubernetes.io/aws-load-balancer-proxy-protocol: "*"
    getambassador.io/config: |
      ---
      apiVersion: ambassador/v1
      kind:  Module
      name:  ambassador
      config:
        use_proxy_proto: true
        use_remote_address: false
        x_forwarded_proto_redirect: true
spec:
  externalTrafficPolicy: Local
  type: LoadBalancer
  ports:
  - name: ambassador
    port: 443
    targetPort: 8080
  selector:
    service: ambassador
```
