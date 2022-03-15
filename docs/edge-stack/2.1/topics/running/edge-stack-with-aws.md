---
    title: Edge Stack with AWS
    description: How to configure Edge Stack for AWS.
---

# Edge Stack with AWS

Edge Stack is a platform-agnostic Kubernetes API gateway. It runs in any distribution of Kubernetes, whether it is managed by a cloud provider or on homegrown bare-metal servers.

This document provides a reference for different configuration options available to run with Kubernetes in AWS. See [Installing Edge Stack](../../install) for the available installation methods.

## Recommended configuration

There are many configuration options available for you to run Edge Stack in AWS. While you should familiarize yourself with all the options on this page to understand what is best for you, the recommended configuration to run Edge Stack in AWS is as follows:

For most use cases, Ambassador Labs recommends you terminate TLS at Edge Stack so you can take advantage of all the TLS configuration options available in Edge Stack. This includes configuration of the allowed TLS versions,  `alpn_protocol` options, HTTP -> HTTPS redirection enforcement, and [automatic certificate management](../host-crd) in Edge Stack.

When you terminate TLS at Edge Stack, you should deploy an L4 [Network Load Balancer (NLB)](#network-load-balancer-nlb) with the proxy protocol enabled to get the best performance out of your load balancer while still preserving the client IP address.

The following `Service` should be configured to deploy an NLB with cross zone load balancing enabled (see [NLB notes](#network-load-balancer-nlb) for caveats on the cross-zone-load-balancing annotation). You need to configure the proxy protocol in the NLB manually in the AWS Console.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ambassador
  namespace: ambassador
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
spec:
  type: LoadBalancer
  ports:
  - name: HTTP
    port: 80
    targetPort: 8080
  - name: HTTPS
    port: 443
    targetPort: 8443
  selector:
    service: ambassador
```

After you deploy the `Service` above and manually enable the proxy protocol, you need to deploy a `Listener` resource to tell Edge Stack to use the proxy protocol. See the [`Listener` resource documentation](../listener) for `Listener` setup details.

Once you deploy the `Listener`, restart Edge Stack for the configurations to take effect. Edge Stack now expects traffic from the load balancer to be wrapped with the proxy protocol so it can read the client IP address.

## AWS load balancer notes

AWS provides three types of load balancers:

### "Classic" Elastic Load Balancer (ELB)

The ELB is the first generation AWS Elastic Load Balancer. It is the default type of load balancer ensured by a `type: LoadBalancer` `Service`, and routes directly to individual EC2 instances. It can be configured to run at layer 4 or layer 7 of the OSI model. See [What is a Classic Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/introduction.html) for more details.

* Ensured by default for a `type: LoadBalancer` `Service`
* Layer 4: TCP, TCP/SSL
   * Protocol support
      * HTTP(S)
      * Websockets
      * HTTP/2
   * Connection based load balancing
   * Cannot modify the request
* Layer 7: HTTP, HTTPS
   * Protocol support
      * HTTP(S)
   * Request based load balancing
   * Can modify the request (append to `X-Forwarded-*` headers)
* Can perform TLS termination

**Notes:**
- While the ELB is superseded by the `Network Load Balancer` and `Application Load Balancer`, it offers the simplest way of provisioning an L4 or L7 load balancer in Kubernetes.
- All of the [load balancer annotations](#load-balancer-annotations) are respected by the ELB.
- If you use the ELB for TLS termination, Ambassador Labs recommends that you run in L7 mode so it can modify `X-Forwarded-Proto` correctly.

### Network Load Balancer (NLB)

The NLB is a second generation layer 4 AWS Elastic Load Balancer. Running at L4, it load-balances based on TCP connection, which allows it to handle millions of requests per second. See [What is a Network Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html) for more details.

* Can be ensured by a `type: LoadBalancer` `Service`
* Layer 4: TCP, TCP/SSL
   * Protocol support
      * HTTP(S)
      * Websockets
      * HTTP/2
   * Connection based load balacing
   * Cannot modify the request
* Can perform TLS termination

**Notes:**
- The NLB is the most efficient load balancer, capable of handling millions of requests per second. Ambassador Labs recommends this for streaming connections since it maintains the connection stream between the client and Edge Stack
- Most of the [load balancer annotations](#load-balancer-annotations) are respected by the NLB. You need to manually configure the proxy protocol and take an extra step to enable cross-zone load balancing.
- Because it operates at L4 and cannot modify the request, you need to tell Edge Stack whether or not to terminate TLS (see [TLS termination](#tls-termination) notes below for more details).

### Application Load Balancer (ALB)

The ALB is a second generation AWS Elastic Load Balancer. It cannot be ensured by a `type: LoadBalancer` `Service` and must be deployed and configured manually. It can only run at layer 7 of the OSI model and load balances based on request information which allows it to perform fine-grained routing to applications. See [What is a Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) for more details.

* Cannot be configured by a `type: LoadBalancer` `Service`
* Layer 7: HTTP, HTTPS
   * Protocol support
      * HTTP(S)
   * Request based load balancing
   * Can modify the request (append to `X-Forwarded-*` headers)
* Can perform TLS termination

**Notes:**

- The ALB performs routing based on the path, headers, and host. Because Edge Stack performs this kind of routing in your cluster, the overhead of provisioning an ALB is often not worth the benefits unless you are using the same load balancer to route to services outside of Kubernetes, 
- If you choose to use an ALB, you need to expose Edge Stackwith a `type: NodePort` service and manually configure the ALB to forward to the correct ports.
- None of the [load balancer annotations](#load-balancer-annotations) are respected by the ALB. You need to manually configure all options.
- The ALB sets the `X-Forward-Proto` header if terminating TLS. See (see [TLS termination](#tls-termination) notes below).

## Load balancer annotations

Kubernetes on AWS exposes a mechanism to request certain load balancer configurations by annotating the `type: LoadBalancer` `Service`. The most complete set and explanations of these annotations can be found in [this Kubernetes concepts document](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer). The following is the most relevant information for Edge Stack deployment.

- `service.beta.kubernetes.io/aws-load-balancer-ssl-cert`:

    This configures the load balancer to use a valid certificate ARN to terminate TLS at the Load Balancer.

    Traffic from the client into the load balancer is encrypted but, since TLS is terminated at the load balancer, traffic from the load balancer to Edge Stack will be cleartext. You need to configure Edge Stack differently depending on whether the load balancer is running in L4 or L7 (see [TLS termination](#tls-termination) notes below).

- `service.beta.kubernetes.io/aws-load-balancer-ssl-ports`:

    This configures which port the load balancer uses to listen for SSL traffic. The default is `"*"`.

    If you want to enable cleartext redirection, set this to `"443"`.

- `service.beta.kubernetes.io/aws-load-balancer-backend-protocol`:

    This configures the ELB to operate in L4 or L7 mode. You can set this to `"tcp"`/`"ssl"` for an L4 listener, or `"http"`/`"https"` for an L7 listener. This defaults to `"tcp"` or  `"ssl"` if `aws-load-balancer-ssl-cert` is set.

- `service.beta.kubernetes.io/aws-load-balancer-type: "nlb"`:

    When this annotation is set, it launches a [Network Load Balancer (NLB)](#network-load-balancer-nlb) instead of a classic ELB.

- `service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled`:

    This configures the load balancer to load balance across zones. For high availability, set this to `"true"`.

    **Note:** You cannot configure this annotation and `service.beta.kubernetes.io/aws-load-balancer-type: "nlb"` at the same time. First, you need to deploy the `Service` with an NLB and then update it with the cross-zone load balancing configuration.

- `service.beta.kubernetes.io/aws-load-balancer-proxy-protocol`:

    This configures the ELB to enable the proxy protocol. The only accepted value is `"*"`.

    The proxy protocol can be used to preserve the client IP address.

    If you set this value, you need to make sure Edge Stack is configured to use the proxy protocol (see [preserving the client IP address](#preserving-the-client-ip-address) below).

    **Note:** This annotation is not recognized if `aws-load-balancer-type: "nlb"` is configured. Proxy protocol must be manually enabled for NLBs.

## TLS termination

TLS termination is an important part of any modern web app. Edge Stack exposes many TLS termination configuration options, which makes it a powerful tool to manage encryption between your clients and microservices. Refer to the [TLS Termination](../tls) documentation for more information on how to configure TLS termination at Edge Stack.

With AWS, the AWS Certificate Manager (ACM) makes it easy to configure TLS termination at an AWS load balancer with the load balancer annotations above.

This means that when you run Edge Stack in AWS, you have a choice of two options on where to terminate TLS. You can terminate TLS at the load balancer using a certificate from the ACM, or you can terminate TLS at Edge Stack using a certificate stored as a `Secret` in your cluster.

### TLS termination at Edge Stack

 TLS termination at Edge Stack allows you to use all of the TLS termination options that Edge Stack exposes. This includes the ability to enforce the minimum TLS version, set the `alpn_protocols`, and redirect cleartext to HTTPS.

If you terminate TLS at Edge Stack, you can provision any AWS load balancer that you want with the following default port assignments:

```yaml
spec:
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: https
    port: 443
    targetPort: 8443
```

Although TLS termination at Edge Stack makes it easier to expose more advanced TLS configuration options, it has the drawback of not being able to use the ACM to manage certificates. You need to manage your TLS certificates yourself or use the [automatic certificate management](../host-crd) available in Edge Stack to have Edge Stack do it for you.

### TLS termination at the load balancer

If you choose to terminate TLS at your Amazon load balancer, you can use the ACM to manage TLS certificates. This option can add complexity to your Edge Stack configuration depending on which load balancer you are using.

 TLS termination at the load balancer means that Edge Stack receives all traffic as un-encrypted cleartext traffic. Since Edge Stack expects service both encrypted and cleartext traffic by default, you need to make the following configuration changes to Edge Stack to support this:

#### L4 load balancer (default ELB or NLB)

* **Load Balancer Service Configuration:**
   The following `Service` deploys an L4 ELB with TLS termination configured at the load balancer:
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: ambassador
     namespace: ambassador
     annotations:
       service.beta.kubernetes.io/aws-load-balancer-ssl-cert: {{ACM_CERT_ARN}}
       service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "443"
   spec:
     type: LoadBalancer
     ports:
     - name: HTTP
       port: 80
       targetPort: 8080
     - name: HTTPS
       port: 443
       targetPort: 8080
     selector:
       service: ambassador
   ```

   Note that the `spec.ports` has been changed so both the HTTP and HTTPS ports forward to the cleartext port 8080 on Edge Stack.

* **`Host`:**

   The `Host` configures how Edge Stack handles encrypted and cleartext traffic. The following `Host` configuration tells Edge Stack to `Route` cleartext traffic that comes in from the load balancer:

   ```yaml
   apiVersion: getambassador.io/v3alpha1
   kind: Host
   metadata:
     name: ambassador
   spec:
     hostname: "*"
     selector:
       matchLabels:
         hostname: wildcard
     acmeProvider:
       authority: none
     requestPolicy:
       insecure:
         action: Route
   ```

**Important:**

Because L4 load balancers do not set `X-Forwarded` headers, Edge Stack in unable to distinguish between traffic that came in to the load balancer as encrypted or cleartext. Because of this, **HTTP -> HTTPS redirection is not possible when terminating TLS at an L4 load balancer**.

#### L7 load balancer (ELB or ALB)

* **Load Balancer Service Configuration (L7 ELB):**

   The following `Service` deploys an L7 ELB with TLS termination configured at the load balancer:
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: ambassador
     namespace: ambassador
     annotations:
       service.beta.kubernetes.io/aws-load-balancer-ssl-cert: {{ACM_CERT_ARN}}
       service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "443"
       service.beta.kubernetes.io/aws-load-balancer-backend-protocol: "http"
   spec:
     type: LoadBalancer
     ports:
     - name: HTTP
       port: 80
       targetPort: 8080
     - name: HTTPS
       port: 443
       targetPort: 8080
     selector:
       service: ambassador
   ```

   Note that the `spec.ports` has been changed so both the HTTP and HTTPS ports forward to the cleartext port 8080 on Edge Stack.

* **`Host`:**

   The `Host` configures how Edge Stack handles encrypted and cleartext traffic. The following `Host` configuration will tell Edge Stack to `Redirect` cleartext traffic that comes in from the load balancer:

   ```yaml
   apiVersion: getambassador.io/v3alpha1
   kind: Host
   metadata:
     name: ambassador
   spec:
     hostname: "*"
     selector:
       matchLabels:
         hostname: wildcard
     acmeProvider:
       authority: none
     requestPolicy:
       insecure:
         action: Redirect
   ```

* **Module:**

   Since an L7 load balancer is able to append to `X-Forwarded` headers, you need to configure Edge Stack to trust the value of these headers. The following `Module` configures Edge Stack to trust a single L7 proxy in front of Edge Stack:

   ```yaml
   apiVersion: getambassador.io/v3alpha1
   kind: Module
   metadata:
     name: ambassador
     namespace: ambassador
   spec:
     config:
       xff_num_trusted_hops: 1
       use_remote_address: false
   ```

**Note:**

Edge Stack uses the value of `X-Forwarded-Proto` to know if the request originated as encrypted or cleartext. Unlike L4 load balancers, L7 load balancers set this header so HTTP -> HTTPS redirection is possible when terminating TLS at an L7 load balancer.

## Preserving the client IP address

Many applications want to know the IP address of the connecting client. In Kubernetes, this IP address is often obscured by the IP address of the `Node` that forwards the request to Edge Stack, so additional configuration is required if you need to preserve the client IP address.

In AWS, there are two options to preserve the client IP address:

1. Use an l7 Load Balancer that sets `X-Forwarded-For`

   An L7 load balancer populates the `X-Forwarded-For` header with the IP address of the downstream connecting client. If your clients connect directly to the load balancer, this is the IP address of your client.

   When you use L7 load balancers, you must configure Edge Stack to trust the value of `X-Forwarded-For` and not append its own IP address to it. You need to set `xff_num_trusted_hops` and `use_remote_address: false` in the [Ambassador `Module`](../ambassador) as follows:

   ```yaml
   apiVersion: getambassador.io/v3alpha1
   kind: Module
   metadata:
     name: ambassador
     namespace: ambassador
   spec:
     config:
       xff_num_trusted_hops: 1
       use_remote_address: false
   ```

   After you configure the the above `Module`, restart Edge Stack for the changes to take effect.

2. Use the proxy protocol

   The [proxy protocol](https://www.haproxy.org/download/1.8/doc/proxy-protocol.txt) is a wrapper around an HTTP request. Like `X-Forwarded-For`, this lists the IP address of the downstream connecting client. This can be set by L4 load balancers as well.

   In AWS, you can configure ELBs to use the proxy protocol with the `service.beta.kubernetes.io/aws-load-balancer-proxy-protocol: "*"` annotation on the service. You must manually configure this on ALBs and NLBs.

   Once you configure the load balancer to use the proxy protocol, you need to tell Edge Stack to expect it on the request with the `Listener` resource. See the [`Listener` resource documentation](../listener) for setup details.




