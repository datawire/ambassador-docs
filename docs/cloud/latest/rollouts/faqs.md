# FAQs

**What is the Rollouts feature?**

Rolouts is a new feature in Ambassador Cloud that helps developers setting up a CD pipeline and deploying their applications using Canary releases.

**What can I do with Rollouts in Ambassador Cloud?**

Once the Rollouts feature is configured, developers will be able to run canary releases from Ambassador Cloud UI.

**How can Rollouts deploy applications inside my cluster?**

Rollouts leverage GitOps and Kubernetes native technologies such as Argo projects. Once a new Rollout is started a Pull Request is automatically created in a pre-configured Git repository. This Pull Request can then be reviewed by your team and once merged Argo will be responsible for applying the changes in your cluster.

**I don't know anything about Argo projects. Is this a requirement?**

No. Ambassador Cloud will guide you on how to install and configure everything in your cluster so you can have a fully functional CD pipeline capable of running canary releases.

**What are the requirements for using Rollouts?**

The Rollout feature requires:
- Kubernetes cluster running with Ambassador 1.13.8+
- An application running with Ambassador Mappings configured
- A Github repository with the manifests yamls of your application

**I use Ambassador open-source. Can I use the Rollouts feature?**

Yes. The Rollouts feature is available in all Ambassador 1.13.8+ releases: AES and Emissary

**Can I provide my manifests as a Helm Chart or as a Kustomize project?**

Currently, the Rollouts feature requires standard kubernetes manifests. You can generate standard Kubernetes manifests from Helm Charts or Kustomize projects and provide those files in a git repo so it can be consumed by Ambassador Cloud.

**What are the deployment strategies supported?**

Currently, Ambassador Cloud supports canary releases.
