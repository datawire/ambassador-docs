# Environments

Not every Kubernetes cluster and namespace run the same type of workload. Engineering organization typically segment their multiple cloud instances into logical stages to allow for fast private development and testing in one environment, all the while serving public stable traffic on a distinct production infrastructure. Typically, these environments are:
- Development
- Staging
- Production

The Service Catalog will match and group services in multiple environments, allowing you to develop and manage your services through its entire cloud-native lifecycle. Easily visualize the flow of services through the different stages, as versions get rolled out. The Service Catalog will guide you through the promotion pipeline from development to production.
