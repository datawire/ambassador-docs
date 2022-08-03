# Ambassador Edge Stack and Emissary-ingress End of Life Policy

This document describes the End of Life policy and maintenance windows for Ambassador Edge Stack, and to the open source project Emissary Ingress.

## Supported Versions

Ambassador Edge Stack and Emissary-ingress versions are expressed as **x.y.z**, where **x** is the major version, **y** is the minor version, and **z** is the patch version, following [Semantic Versioning](https://semver.org/) terminology.

**X-series (Major Versions)**

- **1.y**: 1.0 GA on January 2020
- **2.y**: 2.0.4 GA on October 2021, and 2.1.0 in December 2021.

**Y-release (Minor versions)**

- For 1.y, that is **1.14.z**
- For 2.y, that is **2.3.z**

In this document, **Current** refers to the latest X-series release.

Maintenance refers to the previous X-series release, including security and Sev1 defect patches.

## CNCF Ecosystem Considerations

- Envoy releases a major version every 3 months and supports its previous releases for 12 months. Envoy does not support any release longer than 12 months.
- Kubernetes 1.19 and newer receive 12 months of patch support (The [Kubernetes Yearly Support Period](https://github.com/kubernetes/enhancements/blob/master/keps/sig-release/1498-kubernetes-yearly-support-period/README.md)).

# The Policy

> We will offer a 6 month maintenance window for the latest Y-release of an X-series after a new X-series goes GA and becomes the current release. For example, we will support 2.3 for severity 1 and defect patches for six months after 3.0 is released.
>

> During the maintenance window, Y-releases will only receive security and Sev1 defect patches. Users desiring new features or bug fixes for lower severity defects will need to upgrade to the current X-series.
>

> The current X-series will receive as many Y-releases as necessary and as often as we have new features or patches to release.
>

> Ambassador Labs offers no-downtime migration to current versions from maintenance releases. Migration from releases that are outside of the maintenance window may be subject to downtime.
>

> Artifacts of releases outside of the maintenance window will be frozen and will remain available publicly for download with the best effort. These artifacts include Docker images, application binaries, Helm charts, etc.
>

### When we say support with “defect patches”, what do we mean?

- We will fix security issues in our Emissary-ingress and Ambassador Edge Stack code
- We will pick up security fixes from dependencies as they are made available
- We will not maintain forks of our major dependencies
- We will not attempt our own back ports of critical fixes to dependencies which are out of support from their own communities

## Extended Maintenance for 1.14

Given this policy, we should have dropped maintenance for 1.14 in March 2022, however we recognize that the introduction of an EOL policy necessitates a longer maintenance window. For this reason, we do offer an "extended maintenance" window for 1.14 until the end of September 2022, 3 months after the latest 2.3 release. Please note that this extended maintenance window will not apply to customers using Kubernetes 1.22 and above, and this extended maintenance will also not provide a no-downtime migration path from 1.14 to 3.0.

After September 2022, the current series will be 3.x, and the maintenance series will be 2.y.

## Visual timeline representation

<img alt="Timeline" src="/images/documentation/timeline.png"/>
