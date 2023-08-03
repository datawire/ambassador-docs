
# Frequently Asked Questions

- **If I want to start using $productName$ should I get started with 3.x or 4.x**
If you intend to use $productName$ for a production environment, then you should install and use 3.x.
4.x is in developer preview and is not supported or recommended for production use. If you are just looking to
experiment and learn, then we would appreciate any feedback you have from trying out 4.x. If you install and use
3.x now, you will be able to upgrade to 4.x when the official release is available.

- **Can I upgrade from $productName$ 3.x to 4.x?**
Upgrading from 3.x to 4.x is not supported or advised since 4.x is still in Developer Preview (Early Access).
Upgrades from 3.x to 4.x will, of course, be supported along with a release guide when we are nearing the release of
4.x GA.

- **Does $productName$ 4.x have feature parity with 3.x?**
$productName$ does not support all of the features that 3.x has at this time. This is largely due to the shift towards
Gateway API config and Envoy Gateway. We are heavily involved in both those projects and aim to get 4.x to feature parity
with 3.x while also delivering new features in 4.x not available in 3.x.

- **Is $productName$ 4.x officially supported by Ambassador Labs?**
$productName$ 4.x is not currently supported even if you have a support contract with Ambassador Labs since it is in Developer Preview.

- **When is $productName$ 4.x GA going to be released?**
There is currently no planned release date for 4.x GA.

- **Can I bring my use my old CRDs from 3.x and below with $productName 4.x?**
No, $productName$ 4.x does not consume the `getambassador.io/v2` or `getambassador.io/v3alpha1` CRDs and currently
has no plans to support them directly; however, when the official release of 4.x happens, a CRD migration upgrade tool will be provided.

- **Why is $productName$ built on Envoy Gateway now?**
There are several reasons why we decided to move to Envoy Gateway as the foundation for $productName$.
You can refer to the [About $productName$ 4.x page][] for an overview of the changes and a list of some of the benefits.

- **Do I need to keep the Redis deployed with $productName$?**
You must provide $productName$ with a valid Redis connection, but you are free to replace the deployment
that is provided with your own Redis solution, for more information, see the [Redis docs][]

- **Will I be able to upgrade from $productName$ 4.x Developer Preview to 4.x GA?**
There is no plan to offer a "migration" from 4.x Developer Preview to 4.x GA.
It is very likely that there will be breaking changes between now and the official release of 4.x. While
you may be able to perform the upgrade successfully, you should expect there to be significant changes.

- **Can I run $productName$ 4.x in production?**
Running $productName$ 4.x in production is not supported or advised until the official (GA) release.

- **Where can I go to get help with $productName$ 4.x?**
The best place to go for $productName$ assistance or questions is [our community Slack channel][]

- **Does the release of 4.x mean that 3.x and Emissary-ingress are no longer supported?**
$productName$ 3.x and Emissary-ingress currently do not have a planned end of life and will continue to receive updates and support.

- **Will emissary-apiext be coming to $productName$ 4.x to support older CRD versions?**
At this time, we do not currently plan to port the emissary-apiext tool to 4.x or to support older CRD versions from
1.x - 3.x. This is subject to change before the official release of 4.x, and we will be providing tooling to help translate your old CRDs into the new `gateway.getambassador.io/v1alpha1`, Envoy Gateway, and Gateway API CRDs used by 4.x.

[Redis docs]: ../../guides/aes/redis-config
[About $productName$ 4.x page]: ../aes-4x
[our community slack channel]: https://a8r.io/slack
