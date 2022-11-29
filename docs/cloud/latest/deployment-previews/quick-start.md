---
title: "Using Deployment Previews | Ambassador Cloud"
description: "Take advantage of your GitOps integration and use CI, Ambassador Cloud, and ArgoCD to configure deployment previews using your connected GitHub repository."
---
import Alert from '@material-ui/lab/Alert';
import HubspotForm from "../../../../../src/components/HubspotForm";
import Button from '../../../../../src/components/Button';

# Using Deployment Previews with Ambassador Cloud

Deployment previews are a clean, simple mechanism to easily provide access to a development version of a service while it is still a pull request, _before_ merging the new code. This reduces development time by making it significantly faster to iterate on new features or bugfixes. This means you no longer need to manually coordinate deployments to staging or test environments, deployment previews can handle as many development streams as you need for you.

<Alert severity="info"> The deployment previews are a licensed feature in Ambassador Cloud. For more information, refer to <a href="../../../../../editions/">Ambassador Labs' various service plans.</a> </Alert>

## Prerequisites

* An application that can be deployed to K8s that is set up for GitOps. This includes a repo that has all of the application code, as well as a declarative deployment configuration for that application. The it could be in two repos or in the same one. The following example uses a two repo approach.
* A cluster connected to Ambassador Cloud with Edge Stack version of 2.2.x or later installed on it.
* Ambassador Cloud GitOps integration enabled on the repo containing the application code.
* Argo CD set up to sync the deployment configuration into the cluster,
* A container registry that has read/write permissions. The following example uses Docker.


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
   cluster. This is the _infrastructure repository_; it may or may not be the same code respiratory. Confirm how your repository is configured before proceeding.

   If you haven't configured how manifests are synced from your GitLab or GitHub repository yet, follow the [ArgoCD quick start](../../../../argo/latest/quick-start/) to complete this process.

3. Deployment previews rely on a Telepresence pod daemon container for routing. Your
   cluster must have RBAC configured for the deployment preview daemon container:

   ```bash
   kubectl apply -f https://app.getambassador.io/yaml/pod-daemon/deploy-previews-rbac.yaml
   ```

   <Alert severity="info">
   The above sample RBAC policy as well and rest of this document assumes that you are deploying your previews in the <code>deploy-previews</code> namespace. If you are deploying your previews in a different namespace then simply change all instances of <code>namespace: deploy-previews</code> to match your namespace.
   </Alert>

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

After setup is complete, open a pull request in your code repository:

1. After CI publishes the image and manifests for your new deployment, Argo syncs the new
   deployment preview manifests into your cluster. (This may take a few minutes, depending on
   how Argo is configured.)

2. Once argo has synced the new manifests into your cluster, the deployment preview pod requests a new preview URL
   from Ambassador Cloud. Once the URL has been created, it is posted to your PR as a
   comment.

3. Simply open the preview URL in your browser and (if needed) authenticate to
   Ambassador Cloud to interact with your new deployment. You can share this URL with other
   members of your Ambassador Cloud organization to get their feedback, too.

4. Once your PR is merged or closed, CI removes the deployment preview manifests.
   If Argo is properly configured to automatically prune resources, it removes the
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
       - name: pod-daemon
         image: docker.io/datawire/tel2:$telepresenceVersion$
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
           - pod-daemon
           - --workload-name=$NAME
           - --workload-namespace=$NAMESPACE
           - --port=$PORT
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
           - name: MANAGER_NAMESPACE
             value: ambassador
   ```

In the manifest, several things must be customized:

- `$NAME`, `$NAMESPACE`, and `$PORT` need to match the name, namespace, and port of your live application
  (non-preview) Deployment.
- `$INGRESS_HOST` needs to be the DNS name or IP address of the Edge Stack running in your cluster.
  In standard installations, it should be `edge-stack.ambassador`.
- `$PUBLIC_HOSTNAME` needs to be the DNS name where you would access your live application.
- If your Edge Stack is not doing TLS on port 443, edit the `--ingress-tls` and `--ingress-port`
  arguments.
- If your Telepresence traffic-manager is not running in the `ambassador` namespace, edit the
  `MANAGER_NAMESPACE` environment variable.
- If you are running an different version of Telepresence, you may
  wish to change the version number from $telepresenceVersion$ to the
  version that you use.  Deploy previews require Telepresence
  2.6.9-BOGUS-WE-WILL-FILL-IN-THIS-VERSION-ONCE-WE-HAVE-IT or later.

For an example of CI editing the manifest, see the [deployment previews demo GitHub repo](https://github.com/AliceProxy/test-app).

[This is just a test](.../authenticating/)