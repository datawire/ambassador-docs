# Major differences between $productName$ 3.x and 4.x

## Architecture Changes

The most significant difference that users familiar with $productName$ 1.x through 3.x will notice is that
4.x is built on the [Envoy Gateway project][] while 1.x - 3.x were built on the [Emissary-ingress project][].
Due to this, there are significant architectural differences between the versions.

Emissary-ingress and $productName$ versions prior to 4.x ship with a custom build of Envoy Proxy. Both Envoy and
the Emissary-ingress process run in the same pod. In contrast, Envoy Gateway creates and manages a fleet of Envoy Proxy deployments
according to your configuration. Separating the control plane and data plane in this way may be slightly more operationally
complex, but it offers many significant advantages.

1. **Isolation and Resource Management**: Separating the data plane and control plane into distinct pods enables better isolation. Each plane can be allocated specific resources based on its requirements, preventing resource contention and ensuring optimal performance for both functions.

2. **Scalability**: Decoupling the data plane and control plane allows for independent scaling. This means you can scale the data plane and control plane pods based on their respective workloads, ensuring that the scaling of one does not hinder the other or waste resources scaling things you don't need to.

3. **Resilience and High Availability**: By distributing the data plane and control plane across separate pods, you enhance the resilience of your application. Failures or issues in one plane are less likely to impact the other, resulting in improved high availability.

4. **Updates and Maintenance**: Separate pods facilitate smoother updates and maintenance. You can update or patch the control plane without disrupting the data plane and vice versa. This reduces downtime and enhances the overall stability of the application.

5. **Resource Utilization**: In scenarios where the control plane requires additional resources for complex operations or analysis, separating it from the data plane prevents resource contention that might affect the performance of critical data processing.

6. **Enhanced Security**: Isolating the control plane from the data plane can enhance security. You can apply different security measures and policies to each plane, reducing the attack surface and potential vulnerabilities.

7. **Debugging and Troubleshooting**: Separate pods simplify debugging and troubleshooting processes. It becomes easier to monitor and analyze the performance of each plane independently, aiding in identifying and resolving issues effectively.

For a more in-depth look at the architecture of $productName$ 4.x, please refer to the [system architecture doc][]

## Configuration

$productName$ 3.x and earlier make use of several `getambassador.io` custom resources as their configuration language.
With 4.x, the configuration has shifted to primarily use the [Gateway API resources][] for common gateway features.

$productName$ 4.x retains the following resources from 3.x and prior; however, along with the major version release, we've taken the opportunity to make some breaking changes to the custom resources to clean up inconsistencies in the fields and follow more standard practices. Check out the custom resources introduced by $productName$ below for full API References.

- [The Filter resource][]
- [The FilterPolicy resource][]
- [The WebApplicationFirewall resource][]
- [The WebApplicationFirewallPolicy resource][]

[system architecture doc]: ../../design/system
[The Filter resource]: ../../custom-resources/filter
[The FilterPolicy resource]: ../../custom-resources/filterpolicy
[The WebApplicationFirewall resource]: ../../custom-resources/webapplicationfirewall
[The WebApplicationFirewallPolicy resource]: ../../custom-resources/webapplicationfirewallpolicy
[Gateway API resources]: https://gateway-api.sigs.k8s.io/
[Envoy Gateway project]: https://github.com/envoyproxy/gateway
[Emissary-ingress project]: https://github.com/emissary-ingress/emissary
