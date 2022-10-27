# TLS termination and enabling HTTPS

TLS encryption is one of the basic requirements of having a secure system.
$AESproductName$ [automatically enables TLS termination/HTTPs
](../../topics/running/host-crd#acme-support), making TLS encryption
easy and centralizing TLS termination for all of your services in Kubernetes.

While this automatic certificate management in $AESproductName$ helps
simply TLS configuration in your cluster, the Open-Source $OSSproductName$
still requires you provide your own certificate to enable TLS.

The following will walk you through the process of enabling TLS with a
self-signed certificate created with the `openssl` utility.

**Note** these instructions also work if you would like to provide your own
certificate to $AESproductName$.

## Prerequisites

This guide requires you have the following installed:

- A Kubernetes cluster v1.11 or newer
- The Kubernetes command-line tool,
[`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [openssl](https://www.openssl.org/source/)

## Install $productName$

[Install $productName$ in Kubernetes](../../topics/install).

## Create a listener listening on the correct port and protocol
We first need to create a listener to tell Emissary which port will be using the HTTPS protocol

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Listener
metadata:
  name: emissary-ingress-listener-8443
spec:
  port: 8443
  protocol: HTTPS
  securityModel: XFP
  hostBinding:
    namespace:
      from: ALL
```

## Create a self-signed certificate

OpenSSL is a tool that allows us to create self-signed certificates for opening
a TLS encrypted connection. The `openssl` command below will create a
create a certificate and private key pair that $productName$ can use for TLS
termination.

- Create a private key and certificate.

   ```
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -subj '/CN=ambassador-cert' -nodes
   ```

   The above command will create a certificate and private key with the common
   name `ambassador`. Since this certificate is self-signed and only used for testing,
   the other information requested can be left blank.

- Verify the `key.pem` and `cert.pem` files were created

   ```
   ls *.pem
   cert.pem	key.pem
   ```

## Store the certificate and key in a Kubernetes Secret

$productName$ dynamically loads TLS certificates by reading them from
Kubernetes secrets. Use `kubectl` to create a `tls` secret to hold the pem
files we created above.

```
kubectl create secret tls tls-cert --cert=cert.pem --key=key.pem
```

## Tell $productName$ to use this secret for TLS termination

Now that we have stored our certificate and private key in a Kubernetes secret
named `tls-cert`, we need to tell $productName$ to use this certificate
for terminating TLS on a domain. A `Host` is used to tell $productName$ which
certificate to use for TLS termination on a domain.

Create the following `Host` to have $productName$ use the `Secret` we created
above for terminating TLS on all domains.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: wildcard-host
spec:
  hostname: "*"
  acmeProvider:
    authority: none
  tlsSecret:
    name: tls-cert
  selector:
    matchLabels:
      hostname: wildcard-host
```

**Note:** If running multiple instances of $productName$ in one cluster remember to include the `ambassador_id` property in the `spec`, e.g:

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Host
metadata:
  name: wildcard-host
spec:
  ambassador_id: [ "my_id" ]
  ...
```

Apply the `Host` configured above with `kubectl`:

```
kubectl apply -f wildcard-host.yaml
```

$productName$ is now configured to listen for TLS traffic on port `8443` and
terminate TLS using the self-signed certificate we created.

## Send a request Over HTTPS

We can now send encrypted traffic over HTTPS.

First, make sure the $productName$ service is listening on `443` and forwarding
to port `8443`. Verify this with `kubectl`:

```
kubectl get service ambassador -o yaml

apiVersion: v1
kind: Service
...
spec:
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 8080
  - name: https
    port: 443
    protocol: TCP
    targetPort: 8443
...
```

If the output to the `kubectl` command is not similar to the example above,
edit the $productName$ service to add the `https` port.

After verifying $productName$ is listening on port 443, send a request
to your backend service with curl:

```
curl -Lk https://{{AMBASSADOR_IP}}/backend/

{
    "server": "trim-kumquat-fccjxh8x",
    "quote": "Abstraction is ever present.",
    "time": "2019-07-24T16:36:56.7983516Z"
}
```

**Note:** Since we are using a self-signed certificate, you must set the `-k`
flag in curl to disable hostname validation.

## Next steps

This guide walked you through how to enable basic TLS termination in $productName$ using a self-signed certificate for simplicity.

### Get a valid certificate from a certificate authority

While a self-signed certificate is a simple and quick way to get $productName$ to terminate TLS, it should not be used by production systems. In order to serve HTTPS traffic without being returned a security warning, you will need to get a certificate from an official Certificate Authority like Let's Encrypt.

With $productName$, this can be simply done by requesting a
certificate using the built in [ACME support
](../../topics/running/host-crd#acme-support)

For the Open-Source API Gateway, Jetstack's `cert-manager` provides a simple
way to manage certificates from Let's Encrypt. See our documentation for more
information on how to [use `cert-manager` with $productName$
](../cert-manager).

### Enable advanced TLS options

$productName$ exposes configuration for many more advanced options
around TLS termination, origination, client certificate validation, and SNI
support. See the full [TLS reference](../../topics/running/tls) for more
information.
