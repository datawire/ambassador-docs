---
description: "Automated Configuration Analysis | Ambassador Cloud"
title: "Automated configuration analysis provides visibility into Edge Stack and Emissary-ingress configuration changes."
---

import Alert from '@material-ui/lab/Alert';

# Automated Configuration Analysis

Automated configuration analysis provides visibility into Edge Stack and
Emissary-ingress configuration changes _before_ any changes get deployed to your
clusters.

The GitHub integration scans pull requests for Edge Stack and Emissary-ingress manifests, and compares
the current state of your cluster installation to report any changes to
Edge Stack or Emissary-ingress configuration and warn about any conflicts or invalid configuration.

## What are the current capabilities of the automated configuration analysis integration?

Currently, the integration relays information about:
* New routes created by `Mapping`s
* Conflicting routes (e.g. two `Mapping`s configuring the same `prefix` on the same `Host`)
* Envoy metric names for any new routes

Coming soon, we plan to support:
* Validation for the produced Envoy configuration.
* Validation for `TCPMapping`s
* Validation for `Host`s
* Support other git providers


## Can I support multiple directories or cluster configurations?

Yes, you can configure a repository to support multiple configurations from [Ambassador Cloud](https://app.getambassador.io/cloud/settings/teams/gitops).
These configurations are managed with the `.a8r.yaml` configuration file. For example:

```
k8s_config:
- manifest_path: /manifests/
  cluster_info:
    cluster_id: 282b8880-24d4-530c-87aa-55f75132985b
    cluster_name: us-east
- manifest_path: /manifests/
  cluster_info:
    cluster_id: 5c31a862-f6c9-11eb-9a03-0242ac130003
    cluster_name: us-west
```

Different directories that get applied to the same clusters can be managed with an `.a8r.yaml` configuration file similar to the below:

```
k8s_config:
- manifest_path: /frontend/
  cluster_info:
    cluster_id: 282b8880-24d4-530c-87aa-55f75132985b
    cluster_name: us-east
- manifest_path: /backend/
  cluster_info:
    cluster_id: 282b8880-24d4-530c-87aa-55f75132985b
    cluster_name: us-east
```

You can either manually edit your `.a8r.yaml` file if you know your
`cluster_id`, or you can visit the [configuration page in the Ambassador
Cloud](https://app.getambassador.io/cloud/settings/teams/gitops) to register additional
clusters and manifest paths.

## Will the automated configuration analysis recursively search for files?

Yes, if you configure a `manifest_path`, the automated configuration analysis will recursively
search the entire directory structure to find Kubernetes yaml files.

## What if I have manifest files for different clusters in the same directory?

We strongly urge you to separate out files that get applied to different
clusters into different directories.

Organizing your manifests in this manner will save you from accidentally applying
manifests to a cluster. When running `kubectl apply -f $DIRECTORY`, kubectl will
search the directory and apply _all_ the manifest files in that directory, and
this could have undesired consequences.

For instance, if you have a directory `manifests` with
`manifests/test-app.yaml` and `manifests/prod-app.yaml`, it is easy to run
```
kubectl apply -f manifests/
```
and deploy your test application to your production cluster, or vice versa.
