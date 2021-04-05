# Using OpenID Connect to secure Kubernetes with Keycloak

Developers use `kubectl` to access Kubernetes clusters. By default `kubectl` uses a certificate to authenticate to the Kubernetes API. This means that when multiple developers need to access a cluster, the certificate needs to be shared. Sharing the credentials to access a Kubernetes cluster presents a significant security problem. Compromise of the certificate is very easy and the consequences can be catastrophic.

In this tutorial, we walk through how to set up your Kubernetes cluster to add Single Sign-On support for `kubectl`. Instead of using a shared certificate, users will be able to use their own personal credentials to use `kubectl`.

## Prerequisites

This tutorial relies on Ambassador Edge Stack to manage access to your Kubernetes cluster, and uses Keycloak as your identity provider. To get started:

* Install Edge Stack (install docs)
* Deploy Keycloak on Kubernetes (here)

## Cluster Setup

In this section, we'll configure your Kubernetes cluster for single-sign on.

### 1. Authenticate Ambassador with Kubernetes API

1. Delete the openapi mapping from the Ambassador namespace `kubectl delete -n ambassador ambassador-devportal-api`. (this mapping can conflict with `kubectl` commands)
2. Get the token from your KUBECONFIG yaml, and encode it into a base64 basic token and add it to a kube-api mapping in place of `<token>`. 

 (The most reliable way I've found to do this is to `curl -v <some-valid-url> -u "admin:<token>"` and copy the Authorization header from the -v output.  I've noticed that sometimes doing an `echo "admin:token" | base64` doesn't always yield the correct token, not sure why)

    ```yaml
    ---
    apiVersion: getambassador.io/v2
    kind: Mapping
    metadata:
      name: ambassador-kube-api-mapping
      namespace: ambassador
    spec:
      prefix: /
      allow_upgrade:
      - spdy/3.1
      add_request_headers:
        authorization: "Basic <token>"
      remove_request_headers:
        - authorization
      service: https://kubernetes.default
    ```

3. Test that the API works and is responding correctly.  `curl https://<ambassador>/api/v1/namespaces/default/services?limit=500` and `curl https://<ambassador>/api/v1/namespaces/default/pods?limit=500`.

### 2. Create a ClusterRole and ClusterRoleBinding for a generic user "john"

XXX: do we always impersonate John? if so, should we create a more generic name e.g., ambassador-kubectl-impersonation
XXX: we should clarify that we should add the RBAC that we expect the user to use

1. Add the following RBAC to create a user "john" that will only have get/list access to services.

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

2. Test again with the same two curls but now include impersonation headers with `-H "Impersonate-User: john"`.  Notice, however, that the while the first curl responds correctly, the second will respond with the following:

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

### 3. Set up Keycloak config

1. Create a new Realm and Client (e.g. ambassador, ambassador)
2. Make sure that `http://localhost:8000` and `http://localhost:18000` are valid Redirect URIs
3. Set access type to confidential and Save
4. Go to the Credentials tab and note down the secret
5. Go to the user tab and create a user with the first name "john"

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

2. Edit your local Kubernetes YAML file to include the following, making sure to replace the templated values. XXX: WHere is this file? Echo $KUBECONFIG?

```yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    server: https://<my-ambassador-domain>
  name: ambassador
contexts:
- context:
  name: ambassador-kube-api
    cluster: ambassador
    user: ambassador
users:
- name: ambassador
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


3. Switch to the context we set in 4.2 (in the example it's `ambassador-kube-api` ) XXX: Do you mean above?

4. Run `kubectl get svc`.  This should open a browser page to the Keycloak login.  Type in your credentials and, on success, return to the terminal to see the kubectl response. Congratulations, you've set up Single Sign-On with Kubernetes!


# ## 7. Logging Out
1. Delete the token cache with `rm -r ~/.kube/cache/oidc-login`
2. You may also have to remove session cookies in your browser or do a remote logout in the keycloak admin page.


Troubleshooting?

 Now try running `kubectl get pods`, and notice we get an `Error from server (Forbidden): pods is forbidden: User "john" cannot list resource "pods" in API group "" in the namespace "default"`.


## Under the Hood



In this tutorial, we set up Ambassador Edge Stack to [impersonate a user](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation) to access the Kubernetes API. Requests get sent to Edge Stack, which functions as an Authenticating Proxy. Edge Stack uses its integrated authentication mechanism to authenticate the external request's identity and sets the User and Group based on Claims recieved by the `Filter`. 


The general flow of the `kubectl` command is as follows: On making an unauthenticated kubectl command, `kubelogin` does a browser open/redirect in order to do OIDC token negotiation.  `kubelogin` obtains an OIDC Identity Token (notice this is not an access token) and sends it to Ambassador in an Authorization header.  Ambassador validates the Identity Token and parses Claims from it to put into `Impersonate-XXX` headers.  Ambassador then scrubs the Authorization header and replaces it with the Admin token we set up in step 1.  Ambassador then forwards this request with the new Authorization and Impersonate headers to the KubeAPI to first Authenticate, and then Authorize based on Kubernetes RBAC.

(draw flow diagram)


#### XXX: Are these internal notes?

 This does still present the problem of establishing the special Authentication for Ambassador, however we only have to do it once in this case instead of having to create either a Service Account or an x509 cert for every user or group that we want to implement.  As a result, we just have to specify some custom Claims to be put on a JWT so that we can use header injection to directly map them to the `Impersonate-User`, `Impersonate-Group` and `Impersonate-Extra` headers.

*Note* Regarding Cloud Provider Authentication: Ambassador needs to have some kind of Authentication mechanism in place between Ambassador and the Kube API such that the Kube API knows that Ambassador is allowed to impersonate users.  This mechanism can be highly cloud specific (Azure uses x509 certificates, EKS uses an IAM webhook, GKE has legacy support for x509 certs, while generally supporting IAM or OIDC identity tokens).  Utilizing service accounts for this would probably be the most "universal" (there are no k8s clusters that don't use service accounts), but there are some complications when it comes to reading secrets and attaching them to Headers.  If the token never changes, then it's just a matter of physically copying the service account token value to the `add_request_headers` field.  Some clusters, however, have a token rotation policy for service accounts, and so Ambassador needs the most up-to-date token in order to authenticate with Kube API.  There is currently no mechanism for Ambassador to be able to put information either in a K8s Secret/Configmap or from the Pod's Filesystem into a Header. (If we did, probably the easiest way to do this is to give impersonation permission to the `ambassador` Service Account and use the token mounted on a volume in the Ambassador `Pod`, but, again, we have no mechanism for putting something in the file system into a Header).

Requirements:
1. Ambassador Edge Stack
2. Keycloak Deployment (technically any OIDC provider can be substituted)

Kubeception Specific Instructions:
Note, Kubeception does not support x509 certificate authentication, it uses static tokens for Authentication.  This does have the downside that Ambassador technically has full cluster admin access, though with a proper `Filter` and `FilterPolicy` in place, this should not present an overt problem.  Note that a different cluster might have a different step 1 in this process based on the above "Cloud Provider Authentication" note.

