# What’s new in Telepresence 2.8.0?

## DNS improvements
The Telepresence DNS resolver is now capable of resolving queries of type `A`, `AAAA`, `CNAME`,
`MX`, `NS`, `PTR`, `SRV`, and `TXT`.

## Helm configuration additions
- A `connectionTTL` that controls the time the traffic manager will retain a connection without seeing any sign of life from
  the client.
- DNS settings for `includeSuffixes` and `excludeSuffixes` can now be set cluster-wide in the Helm chart. Prior to this change,
  this had to be set in a kubeconfig extension on all workstations.
- Router settings for `alsoProxySubnets` and `neverProxySubnets` can now be set cluster-wide in the Helm chart. Prior to this change,
  this had to be set in a kubeconfig extension on all workstations.
- The Envoy server and admin port can now be configured in the Helm chart.