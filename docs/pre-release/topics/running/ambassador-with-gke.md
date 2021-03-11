# Install with Google Kubernetes Engine (GKE) Ingress 

Google offers a [L7 load balancer](https://cloud.google.com/kubernetes-engine/docs/concepts/ingress) to 
leverage network services such as managed SSL certificates, SSL offloading or the Google content delivery network. 
A L7 load balancer in front of Ambassador can be configured by hand or by using the Ingress-GCE resource. Using the 
Ingress resource also allows you to create Google-managed SSL certificates through Kubernetes.

With this setup, HTTPS will be terminated at the Google load balancer. The load balancer will be created and configured by 
the Ingress-GCE resource. The load balancer consists of a set of 
[forwarding rules](https://cloud.google.com/load-balancing/docs/forwarding-rule-concepts#https_lb) and a set of
[backend services](https://cloud.google.com/load-balancing/docs/backend-service). 
In this setup, the ingress resource creates two forwarding rules, one for HTTP and one for HTTPS. The HTTPS
forwarding rule has the SSL certificates attached. Also, one backend service will be created to point to
a list of instance groups at a static port. This will be the NodePort of the Ambassador service. 

With this setup, the load balancer terminates HTTPS and then directs the traffic to the Ambassador service 
via the `NodePort`. Ambassador is then doing all the routing to the other internal/external services. 

# Overview of steps

1. Install and configure the ingress with the HTTP(S) load balancer
2. Install Ambassador
3. Configure and connect Ambassador to ingress
4. Create an SSL certificate and enable HTTPS
5. Create BackendConfig for health checks
6. Configure Ambassador to do HTTP -> HTTPS redirection

`ambassador` will be running as a `NodePort` service. Health checks will be configured to go to a BackendConfig resource.

## 0. Ambassador Edge Stack

This guide will install Ambassador API gateway. You can also install Ambassador Edge Stack. Please note:
- The ingress and the `ambassador` service need to run in the same namespace
- The `ambassador` service needs to be of type `NodePort` and not `LoadBalancer`. Also remove the line with `externalTrafficPolicy: Local`
- Ambassador-Admin needs to be of type `NodePort` instead of `ClusterIP` since it needs to be available for health checks
 
## 1 . Install and configure ingress with the HTTP(S) load balancer

Create a GKE cluster through the web console. Use the release channel. When the cluster
is up and running follow [this tutorial from Google](https://cloud.google.com/kubernetes-engine/docs/tutorials/http-balancer) to configure 
an ingress and a L7 load balancer. After you have completed these steps you will have a running L7 load balancer
and one service. 

## 2. Install Ambassador

Follow the first section of the [Ambassador API installation guide](../../install/install-ambassador-oss)  to install Ambassador API.
Stop before defining the `ambassador` service.

Ambassador needs to be deployed as `NodePort` instead of `LoadBalancer` to work with the L7 load balancer and the ingress.

Save the YAML below in ambassador.yaml and apply with `kubectl apply -f ambassador.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ambassador
spec:
  type: NodePort
  ports:
   - port: 8080
     targetPort: 8080
  selector:
    service: ambassador
```

You will now have an `ambassador` service running next to your ingress.

## 3.  Configure and connect `ambassador` to the ingress

You need to change the ingress for it to send traffic to `ambassador`. Assuming you have followed the tutorial, you should
have a file named basic-ingress.yaml. Change it to point to `ambassador` instead of web:

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: basic-ingress
spec:
  backend:
    serviceName: ambassador
    servicePort: 8080
```

Now let's connect the other service from the tutorial to `ambassador` by specifying a Mapping:

```yaml
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: web
  namespace: default
spec:
  prefix: /
  service: web:8080
```

All traffic will now go to `ambassador` and from `ambassador` to the `web` service. You should be able to hit your load balancer and get the output. It may take some time until the load balancer infrastructure has rolled out all changes and you might see gateway errors during that time.
As a side note: right now all traffic will go to the `web` service, including the load balancer health check.

## 4. Create an SSL certificate and enable HTTPS

Read up on [managed certificates on GKE](https://cloud.google.com/kubernetes-engine/docs/how-to/managed-certs). You need
a DNS name and point it to the external IP of the load balancer.

certificate.yaml:
```yaml 
apiVersion: networking.gke.io/v1beta1
kind: ManagedCertificate
metadata:
  name: www-example-com
spec:
  domains:
    - www.example.com
```

Modify the ingress from before:
```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: basic-ingress
  annotations:
    networking.gke.io/managed-certificates: www-example-com
spec:
  backend:
    serviceName: ambassador
    servicePort: 8080
```

Please wait (5-15 minutes) until the certificate is created and all edge servers have the certificates ready. 
`kubectl describe ManagedCertificate` will show you the status or go to the web console to view the load balancer.

You should now be able to access the web service via `https://www.example.com`.

## 5. Configure BackendConfig for health checks

Create and apply a BackendConfig resource with a [custom health check](https://cloud.google.com/kubernetes-engine/docs/how-to/ingress-features#direct_health) specified:

```yaml
apiversion: cloud.google.com/v1
kind: backendconfig
metadata:
  name: ambassador-hc-config
  namespace: ambassador
spec:
  # https://cloud.google.com/kubernetes-engine/docs/how-to/ingress-features
  timeoutsec: 30
  connectiondraining:
    drainingtimeoutsec: 30
  customrequestheaders:
    headers:
      - "x-client-region:{client_region}"
      - "x-client-city:{client_city}"
      - "x-client-citylatlong:{client_city_lat_long}"
  logging:
    enable: true
    samplerate: 1.0
  healthcheck:
    checkintervalsec: 10
    timeoutsec: 10
    port: 8877
    type: http
    requestpath: /ambassador/v0/check_alive
```

Then edit your previous `ambassador.yaml` file to add an annotation referencing the BackendConfig and apply the file:

```
apiVersion: v1
kind: Service
metadata:
  name: ambassador
  annotations:
    cloud.google.com/backend-config: '{"default": "ambassador-hc-config"}'
spec:
  type: NodePort
  ports:
   - port: 8080
     targetPort: 8080
  selector:
    service: ambassador
```

## 6. Configure Ambassador to do HTTP -> HTTPS redirection

Configure Ambassador to [redirect traffic from HTTP to HTTPS](../tls/cleartext-redirection/#protocol-based-redirection). You will need to restart Ambassador to effect the changes with `kubectl rollout restart deployment ambassador`.

The result should be that `http://www.example.com` will redirect to `https://www.example.com`. 

You can now add more services by specifying the hostname in the Mapping.
