import Alert from '@material-ui/lab/Alert';

<div class="docs-article-toc">
<h3>Contents</h3>

* [Setup](#setup)
* [Usage](#usage)
* [Manifest Requirements](#manifest-requirements)

</div>

# Deployment Previews with Ambassador Cloud

Deployment previews are a clean, simple mechanism to easily provide access to a development
version of a service while it is still a pull request, _before_ merging the new code. This
reduces development time by making it significantly faster to iterate on new features or
bugfixes: rather than needing to manually coordinate deployments to staging or test
environments, deployment previews can handle as many development streams as you need for you.

Note that this is a licensed feature.

## Setup

To use deployment previews, you need to configure CI, Ambassador Cloud, and ArgoCD to work
together, using a [GitOps workflow](../../../../edge-stack/latest/topics/concepts/gitops-continuous-delivery/):

1. Your cluster must be connected to Ambassador Cloud, and the GitHub repository for your
   service (the _code repository_) must have the Ambassador Cloud GitOps integration enabled.
   If you haven't done this yet, follow the
   [GitOps with Ambassador Cloud](../../gitops/quick-start) quick start.

   <Alert severity="info">

      Only GitHub is fully supported at the moment. While it is possible to have CI for a
      GitLab repository create a deploy preview, the deploy preview URL cannot be posted to
      a GitLab merge request.

   </Alert>

2. ArgoCD must be configured to sync manifests from a GitHub or GitLab repository into your
   cluster. This is the _infrastructure repository_; it may be same as the code repository,
   or it may be different.

   If you haven't done this yet, follow the [ArgoCD quick start](../../../../argo/latest/quick-start/).

3. Deployment previews rely on a Telepresence pod daemon container for routing. Your
   cluster must have RBAC configured for the deployment preview daemon container:

   ```bash
   kubectl apply -f https://github.com/AliceProxy/deploy-preview/blob/main/manifests/deploy-previews-rbac.yaml
   ```

   The above sample RBAC policy assumes you are deploying your previews in the `deploy-previews` namespace.

4. Your cluster needs a Secret containing your Ambassador Cloud API Key:

   ```yaml
   ---
   apiVersion: v1
   kind: Secret
   metadata:
     name: deployment-preview-apikey
     namespace: deploy-previews
   type: Opaque
   stringData:
     AMBASSADOR_CLOUD_APIKEY: "$AMBASSADOR_CLOUD_APIKEY"
   ```

   - This example assumes your are deploying your previews in the `deploy-previews` namespace. There must be a
     `deployment-preview-apikey` Secret in any namespace you use with deployment previews.

   - Replace `$AMBASSADOR_CLOUD_APIKEY` with your Ambassador Cloud API key. You can generate an API key from
     the [Ambassador Cloud Settings](https://app.getambassador.io/cloud/settings/licenses-api-keys)

5. For every pull request you want to preview, CI in the code repository must:

      - Build a Docker image for your service.
      - Push the Docker image to a Docker registry that is accessible by your cluster.
      - Commit a new manifest to the infrastructure repository that deploys the
         newly-built image to your cluster.

   The exact way CI does these three things depends on your service. See the
   [Manifest Requirements](#manifest-requirements) section below for more details.

5. When a pull request in the code repository is closed or merged, CI needs to delete the
   manifests it created.

## Usage

After setup is complete, simply open a pull request in your code repository:

1. After CI publishes the image and manifests for your new deployment, Argo will sync the new
   deployment preview manifests into your cluster. (This may take a few minutes, depending on
   how Argo is configured.)

2. At that point, the deployment preview pod will request a new preview URL
   from Ambassador Cloud. Once the URL has been created, it will be posted to your PR as a
   comment.

3. Simply open the preview URL in your browser and (if needed) authenticate to
   Ambassador Cloud to interact with your new deployment. You can share this URL with other
   members of your Ambassador Cloud organization to get their feedback, too.

4. Once your PR is merged or closed, CI will remove the deployment preview manifests.
   If Argo is properly configured to automatically prune resources, it will remove the
   deployment preview from your cluster. (Again, this may take a few minutes, depending on how
   Argo is configured.)

## Manifest Requirements

Since CI is responsible for creating the manifests used to deploy your service, it has enormous
flexibility in how exactly the manifest is created. However, the manifest **must** include the
deployment preview daemon container in your target application Deployment resource and its
ServiceAccount:

   ```yaml
     serviceAccountName: ambassador-deploy-previews
     containers:
       # Include your application container
       # - name: your-original-application
       #   image: image-built-from-pull-request
       #   [...]
       # Inject the preview-daemon container
       - name: preview-daemon
         image: docker.io/alicewasko/todd:1.5
         ports:
           - name: http
             containerPort: 80
           - name: https
             containerPort: 443
         resources:
           limits:
             cpu: "0.1"
             memory: 100Mi
         args:
           - --workload-name=$NAME
           - --workload-namespace=$NAMESPACE
           - --ingress-tls=true
           - --ingress-port=443
           - --ingress-host=$INGRESS_HOST
           - --ingress-l5host=$PUBLIC_HOSTNAME
           - --pull-request=$PULL_REQUEST_URL
         env:
           - name: AMBASSADOR_CLOUD_APIKEY
             valueFrom:
               secretKeyRef:
                 name: deployment-preview-apikey
                 key: AMBASSADOR_CLOUD_APIKEY
           - name: TELEPRESENCE_VERSION
             value: v2.5.4
           - name: MANAGER_NAMESPACE
             value: ambassador
   ```

In the manifest, several things must be customized:

- `$NAME` and `$NAMESPACE` need to match the name and namespace of your live application
  (non-preview) Deployment.
- `$INGRESS_HOST` needs to be the DNS name or IP address of the Edge Stack running in your cluster.
  In standard installations, it should be `edge-stack.ambassador`.
- `$PUBLIC_HOSTNAME` needs to be the DNS name where you would access your live application.
- If your Edge Stack is not doing TLS on port 443, edit the `--ingress-tls` and `--ingress-port`
  arguments.
- If your Telepresence traffic-manager is not running in the `ambassador` namespace, edit the
  `MANAGER_NAMESPACE` environment variable.

For an example of CI editing the manifest, see the [deployment previews demo GitHub repo](https://github.com/AliceProxy/test-app).
