# Using OpenID Connect to secure Kubernetes with Keycloak

Developers use `kubectl` to access Kubernetes clusters. By default `kubectl` uses a certificate to authenticate to the Kubernetes API. This means that when multiple developers need to access a cluster, the certificate needs to be shared. Sharing the credentials to access a Kubernetes cluster presents a significant security problem. Compromise of the certificate is very easy and the consequences can be catastrophic.

In this tutorial, we walk through how to set up your Kubernetes cluster to add Single Sign-On support for `kubectl`. Instead of using a shared certificate, users will be able to use their own personal credentials to use `kubectl`.

## Prerequisites

This tutorial relies on Ambassador Edge Stack to manage access to your Kubernetes cluster, and uses Keycloak as your identity provider. To get started:

*Note* This guide was designed and validated using an Azure AKS Cluster.  It's possible that this procedure will work with other cloud providers, but there is a lot of variance in the Authentication mechanisms for the Kubernetes API.  See the troubleshooting note at the bottom for more info.

* Azure AKS Cluster [here](https://docs.microsoft.com/en-us/azure/aks/tutorial-kubernetes-deploy-cluster)
* Install Edge Stack [here](https://www.getambassador.io/docs/edge-stack/latest/topics/install/)
* Deploy Keycloak on Kubernetes [here](https://www.keycloak.org/getting-started/getting-started-kube)

## Cluster Setup

In this section, we'll configure your Kubernetes cluster for single-sign on.

### 1. Authenticate Ambassador with Kubernetes API

1. Delete the openapi mapping from the Ambassador namespace `kubectl delete -n ambassador ambassador-devportal-api`. (this mapping can conflict with `kubectl` commands)

2. Create a new private key using `openssl genrsa -out aes-key.pem 4096`.

3. Create a file `aes-csr.cnf` and paste the following config.

    ```cnf
    [ req ]
    default_bits = 2048
    prompt = no
    default_md = sha256
    distinguished_name = dn

    [ dn ]
    CN = ambassador-kubeapi # Required

    [ v3_ext ]
    authorityKeyIdentifier=keyid,issuer:always
    basicConstraints=CA:FALSE
    keyUsage=keyEncipherment,dataEncipherment
    extendedKeyUsage=serverAuth,clientAuth
    ```

4. Create a certificate signing request with the config file we just created.  `openssl req -config ./aes-csr.cnf -new -key aes-key.pem -nodes -out aes-csr.csr`.

5. Create and apply the following YAML for a CertificateSigningRequest.  Replace {{BASE64_CSR}} with the value from `cat aes-csr.csr | base64`.  Note that this is `aes-csr.csr`, and not `aes-csr.cnf`.

    ```yaml
    apiVersion: certificates.k8s.io/v1beta1
    kind: CertificateSigningRequest
    metadata:
      name: aes-csr
    spec:
      groups:
      - system:authenticated
      request: {{BASE64_CSR}} # Base64 encoded aes-csr.csr
      usages:
      - digital signature
      - key encipherment
      - server auth
      - client auth
    ```

6. Check csr was created: `kubectl get csr` (it will be in pending state).  After confirmation, run `kubectl certificate approve aes-csr`.  You can check `kubectl get csr` again to see that it's in the `Approved, Issued` state.

7. Get the resulting certificate and put it into a pem file.  `kubectl get csr aes-csr -o jsonpath='{.status.certificate}' | base64 -d > aes-cert.pem`.

8. Create a TLS `Secret` using our private key and public certificate.  `kubectl create secret tls -n ambassador aes-kubeapi --cert ./aes-cert.pem --key ./aes-key.pem`

9. Create a `Mapping` and `TLSContext` for the Kube API.

    ```yaml
    ---
    apiVersion: getambassador.io/v2
    kind: TLSContext
    metadata:
      name: aes-kubeapi-context
      namespace: ambassador
    spec:
      hosts:
      - "*"
      secret: aes-kubeapi
    ---
    apiVersion: getambassador.io/v2
    kind: Mapping
    metadata:
      name: aes-kubeapi-mapping
      namespace: ambassador
    spec:
      prefix: /
      allow_upgrade:
      - spdy/3.1
      service: https://kubernetes.default.svc
      timeout_ms: 0
      tls: aes-kubeapi-context
    ```

10. Create RBAC for the "aes-kubeapi" user by applying the following YAML.

    ```yaml
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRole
    metadata:
      name: aes-impersonator-role
    rules:
    - apiGroups: [""]
      resources: ["users", "groups", "serviceaccounts"]
      verbs: ["impersonate"]
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRoleBinding
    metadata:
      name: aes-impersonator-rolebinding
    subjects:
    - apiGroup: rbac.authorization.k8s.io 
      kind: User
      name: aes-kubeapi
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: ClusterRole
      name: aes-impersonator-role
    ```

As a quick check, you should be able to `curl https://<ambassador-domain>/api` and get a response similar to the following:

  ```json
  {
    "kind": "APIVersions",
    "versions": [
      "v1"
    ],
    "serverAddressByClientCIDRs": [
      {
        "clientCIDR": "0.0.0.0/0",
        "serverAddress": "\"<some-kubernetes-service-address>\":443"
      }
    ]
  }%
  ```

### 2. Set up Keycloak config

1. Create a new Realm and Client (e.g. ambassador, ambassador)
2. Make sure that `http://localhost:8000` and `http://localhost:18000` are valid Redirect URIs
3. Set access type to confidential and Save
4. Go to the Credentials tab and note down the secret
5. Go to the user tab and create a user with the first name "john"

### 3. Create a ClusterRole and ClusterRoleBinding for the OIDC user "john"

1. Add the following RBAC to create a user "john" that only allowed to perform `kubectl get services` in the cluster.

    ```yaml
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRoleBinding
    metadata:
      name: john-binding
    subjects:
    - kind: User
      name: john
      apiGroup: rbac.authorization.k8s.io
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: ClusterRole
      name: john-role
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRole
    metadata:
      name: john-role
    rules:
      - apiGroups: [""]
        resources: ["services"]
        verbs: ["get", "list"]
    ```

2. Test the API again with the following 2 `curls`: `curl https://<ambassador-domain>/api/v1/namespaces/default/services?limit=500 -H "Impersonate-User: "john"` and `curl https://<ambassador-domain>/api/v1/namespaces/default/pods?limit=500 -H "Impersonate-User: "john"`.  You will find that the first curl should succeeds and the second curl should fail with the following response.

```json
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {

  },
  "status": "Failure",
  "message": "pods is forbidden: User \"john\" cannot list resource \"pods\" in API group \"\" in the namespace \"default\"",
  "reason": "Forbidden",
  "details": {
    "kind": "pods"
  },
  "code": 403
}
```

### 4. Create a JWT filter to authenticate the user

1. Create the following JWT `Filter` and `FilterPolicy` based on this template:

    ```yaml
    ---
    apiVersion: getambassador.io/v2
    kind: Filter
    metadata:
      name: "kubeapi-jwt-filter"
      namespace: "ambassador"
    spec:
      JWT:
        jwksURI: https://<keycloak-domain>/auth/realms/<my-realm>/protocol/openid-connect/certs # If the keycloak instance is internal, you may want to use the internal k8s endpoint (e.g. http://keycloak.keycloak) instead of figuring out how to exclude JWKS requests from the FilterPolicy
        injectRequestHeaders:
        - name: "Impersonate-User" # Impersonate-User is mandatory, you can also add an Impersonate-Groups if you want to do group-based RBAC
          value: "{{ .token.Claims.given_name }}" # This uses the first name we specified in the Keycloak user account
    ---
    apiVersion: getambassador.io/v2
    kind: FilterPolicy
    metadata:
      name: "kubeapi-filter-policy"
      namespace: "ambassador"
    spec:
      rules:
      - host: "*"
        path: "*"
        filters:
        - name: kubeapi-jwt-filter
    ```

## Client set up

Now, we need to set up the client. Each user who needs to access the Kubernetes cluster will need to follow these steps.

### 1. Install kubelogin

1. Install [kubelogin](https://github.com/int128/kubelogin#getting-started). Kubelogin is a `kubectl` plugin that enables OpenID Connect login with `kubectl`.

2. Edit your local Kubernetes config file (either `~/.kube/config`, or your `$KUBECONFIG` file) to include the following, making sure to replace the templated values.

    ```yaml
    apiVersion: v1
    kind: Config
    clusters:
    - name: azure-ambassador
      cluster:
        server: https://<ambassador-domain>
    contexts:
    - name: azure-ambassador-kube-api
      context:
        cluster: azure-ambassador
        user: azure-ambassador
    users:
    - name: azure-ambassador
      user:
        exec:
          apiVersion: client.authentication.k8s.io/v1beta1
          command: kubectl
          args:
          - oidc-login
          - get-token
          - --oidc-issuer-url=https://<keycloak-domain>/auth/realms/<my-realm>
          - --oidc-client-id=<client-id>
          - --oidc-client-secret=<client-secret>
    ```

3. Switch to the context set above (in the example it's `azure-ambassador-kube-api`).

4. Run `kubectl get svc`.  This should open a browser page to the Keycloak login.  Type in the credentials for "john" and, on success, return to the terminal to see the kubectl response. Congratulations, you've set up Single Sign-On with Kubernetes!

5. Now try running `kubectl get pods`, and notice we get an `Error from server (Forbidden): pods is forbidden: User "john" cannot list resource "pods" in API group "" in the namespace "default"`.  This is expected because we explicitly set up "john" to only have access to view `Service` resources, and not `Pods`.

### 7. Logging Out

1. Delete the token cache with `rm -r ~/.kube/cache/oidc-login`
2. You may also have to remove session cookies in your browser or do a remote logout in the keycloak admin page.

### Troubleshooting

1. Why isn't this process working in my `<insert-cloud-provider-here>` cluster?
  Authentication to the Kubernetes API is highly cluster specific.  Many use x509 certificates, but as a notable exception, Amazon's Elastic Kubernetes Service, for example, uses an Authenticating Webhook that connects to their IAM solution for Authentication, and so is not compatible specifically with this guide.
2. What if I want to use RBAC Groups?
  User impersonation allows you to specify a Group using the `Impersonate-Group` header.  As such, if you wanted to use any kind of custom claims for the ID token, they can be mapped to the `Impersonate-Group` header.  Note that you always have to use an `Impersonate-Name` header, even if you're relying solely on the Group for Authorization.
3. I keep getting a 401 `Failure`, `Unauthorized` message, even for `https://<ambassador-domain>/api`.
  This likely means that there is either something wrong with the Certificate that was issued, or there's something wrong with your `TLSContext` or `Mapping` config.  Ambassador must present the correct certificate to the Kubernetes API and the RBAC usernames and the CN of the certificate have to be consistent with one another.
4. Do I have to use `kubelogin`?
  Technically no.  Any method of obtaining an ID or Access token from an Identity Provider will work.  You can then pass the token using `--token <jwt-token>` when running `kubectl`.  `kubelogin` simply automates the process of getting the ID token and attaching it to a `kubectl` request.

## Under the Hood

In this tutorial, we set up Ambassador Edge Stack to [impersonate a user](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation) to access the Kubernetes API. Requests get sent to Edge Stack, which functions as an Authenticating Proxy. Edge Stack uses its integrated authentication mechanism to authenticate the external request's identity and sets the User and Group based on Claims recieved by the `Filter`.

The general flow of the `kubectl` command is as follows: On making an unauthenticated kubectl command, `kubelogin` does a browser open/redirect in order to do OIDC token negotiation.  `kubelogin` obtains an OIDC Identity Token (notice this is not an access token) and sends it to Ambassador in an Authorization header.  Ambassador validates the Identity Token and parses Claims from it to put into `Impersonate-XXX` headers.  Ambassador then scrubs the Authorization header and replaces it with the Admin token we set up in step 1.  Ambassador then forwards this request with the new Authorization and Impersonate headers to the KubeAPI to first Authenticate, and then Authorize based on Kubernetes RBAC.

(draw flow diagram)
