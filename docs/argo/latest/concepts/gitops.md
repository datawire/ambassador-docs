# Developer-centric GitOps-style deployment 

## What is GitOps?

[GitOps](https://www.getambassador.io/learn/kubernetes-glossary/gitops/) is an approach to continuous deployment that relies on using a version control/source control system as a single source of truth for all infrastructure and configuration for a Kubernetes deployment. The source code itself as well as deployment metadata that describe how the application should run inside the cluster live within this source control system. 

In the GitOps model, configuration changes go through a specific pull-based workflow:

*   All configuration is stored in source control. The Git repository is the source of truth.
*   A configuration change is made via pull request.
*   The pull request is approved and merged into the production branch.
*   Automated systems (e.g., a build pipeline or Kubernetes Operator) ensure the configuration of the production branch is in full sync with actual production systems.

Changes are automated via the source control system; GitOps enables Kubernetes clusters themselves to "pull" updates from source control manifests. The entire GitOps workflow is also self-service; an operations team does not need to be directly involved in managing the change process (except in the review/approval process). 

## Why GitOps for progressive delivery?

GitOps offers developers a way to manage operational workflows, particularly for Kubernetes, that relies on familiar processes, e.g., pull requests, which they already use to merge code. These same processes and tools can be used to push Kubernetes resources into production. 

The idea of GitOps for developers is to allow for ease of use: a developer writes code, sends a pull request via a version control system, it's reviewed by another person, and from there, there is no further human interaction. Humans don't need full access to production environments. Compliance and change audits become trivial. The rollout is automated in a GitOps workflow, in the form, for example, of a canary deployment using a tool like Argo.

## Why Argo for applying GitOps-based progressive delivery?

With a GitOps deployment approach, Argo continuously monitors a Git repository with Kubernetes manifests for commits and actively pulls changes from the repo, syncing them with cluster resources. This pull-and-sync reconciliation process continuously harmonizes the state of the cluster configuration with the state described in Git. 

Continuous monitoring and syncing helps to eliminate the common problem of configuration drift, which often occurs when clusters are configured differently. Unexpected configuration differences are one of the most common reasons why deployments fail, but Argo can prevent this “drift”, or at the very least provide a traceable path to understand the cluster deployment history and detect out-of-sync deployments. 

*   More efficient workflows: developers can use familiar processes and tools for deploying code
*   Greater system reliability and consistency; preventing mismatches. You can use agents to ensure that the desired state defined in Git is the same as the state of your cluster.
*   Increased productivity: automated CD
*   Increased speed of delivery 
*   Reduced deployment complexity

Progressive delivery relies on automated rollouts to incrementally and iteratively release features and easily roll back if needed. This is designed to make the process safe and reduce the blast radius of any problems. Making the progressive delivery process easier, or more developer friendly, is where GitOps shines. Using GitOps means that everything is defined as code, which lives in Git. 

Argo is the unifying factor, as it enables applying GitOps workflows to progressive delivery techniques, such as [canary deployments](https://blog.argoproj.io/deploying-argo-rollouts-with-ambassador-for-canary-releases-on-kubernetes-f5910ed1fd61).
