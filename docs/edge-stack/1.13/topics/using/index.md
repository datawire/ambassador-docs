# Using $productName$

Application development teams use $productName$ to manage edge policies associated with a specific service. This section of the documentation covers core $productName$ elements that are typically used by the application development team.

* [The Project Resource](projects) The `Project` resource is the easiest way to develop a cloud-native service.
  * [Configuring Authentication](project-authentication)
  * [Customizing Deployment](project-customization)
* [Introduction to Mappings](intro-mappings) The `Mapping` resource is the core resource used by every application development team.
* Mapping Configuration:
  * [Automatic Retries](retries)
  * [Canary Releases](canary)
  * [Circuit Breakers](circuit-breakers)
  * [Cross Origin Resource Sharing](cors)
  * HTTP Headers
    * [Header-based Routing](headers/headers)
    * [Host Header](headers/host)
    * [Adding Request Headers](headers/add_request_headers)
    * [Adding Response Headers](headers/add_response_headers)
    * [Removing Request Headers](headers/remove_request_headers)
    * [Remove Response Headers](headers/remove_response_headers)
  * [Query Parameter Based Routing](query_parameters)
  * [Keepalive](keepalive)
  * Protocols
    * [TCP](tcpmappings)
    * gRPC, HTTP/1.0, gRPC-Web, WebSockets
  * [RegEx-based Routing](prefix_regex)
  * [Redirects](redirects)
  * [Rewrites](rewrites)
  * [Timeouts](timeouts)
  * [Traffic Shadowing](shadowing)
* [Advanced Mapping Configuration](mappings)
* Rate Limiting
  * [Introduction to Rate Limits](rate-limits/)
* Filters and Authentication
  * [Introduction to Filters and Authentication](filters/)
  * [OAuth2 Filter](filters/oauth2)
  * [JWT Filter](filters/jwt)
  * [External Filter](filters/external)
  * [Plugin Filter](filters/plugin)
* Service Preview and Edge Control
  * [Introduction to Edge Control](edgectl/edge-control)
  * [Edge Control in CI](edgectl/edge-control-in-ci)
* [Developer Portal](dev-portal)
* [Gateway API](gateway-api)
