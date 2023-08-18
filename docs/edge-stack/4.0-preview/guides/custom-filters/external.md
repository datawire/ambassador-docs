import Alert from '@material-ui/lab/Alert';

# Custom Logic With External Filters

The `External` `Filter` calls out to an external service speaking the
[ext_authz protocol][], providing
a highly flexible interface to plug in your own authentication,
authorization, and filtering logic. This guide will showcase using External Filters. See the [External Filter API Reference][] for all the fields that the custom resource suports, or the [The Ext_Authz Protocol doc][] for more information about implementing ext_authz.

## Configuring an External Filter

1. Create an [External Filter][]

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: v1
   kind: Secret
   metadata:
     name: apikey-filter-keys
   type: Opaque
   data:
     key-1: ZXhhbXBsZS1hcGkta2V5LXZhbHVl
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: Filter
   metadata:
     name: external-filter
     namespace: default
   spec:
     type: "external"
     external:
       protocol: "grpc" # or "http" if you chose to implement an HTTP service instead
       authServiceURL: {{YOUR_AUTH_SERVICE}}
   EOF
   ```

2. Create a [FilterPolicy resource][] to use the `Filter` created above

   ```yaml
   kubectl apply -f -<<EOF
   ---
   apiVersion: gateway.getambassador.io/v1alpha1
   kind: FilterPolicy
   metadata:
     name: external-filterpolicy
     namespace: default
   spec:
     rules:
     - host: "*"
       path: "*"
       filterRefs:
       - name: external-filter # Filter name from above
         namespace: default # Filter namespace from above
   EOF
   ```

## Building an External Filter Service

In the [datawire/sample-external-service repository][], you can find examples of an External Filter. There is a directory showcasing support of an older `v2` transport protocol version as well as the most recent `v3` protocol version. The `v2` transport protocol is no longer supported, so make sure to use the `v3` libraries when building your External Filter. The External Filter in this repo does not perform any authorization and is instead meant to serve as a reference for some of the operations that an External can perform.

[ext_authz protocol]: ../ext-authz
[FilterPolicy resource]: ../../../custom-resources/filterpolicy
[External Filter API Reference]: ../../../custom-resources/filter-external
[External Filter]: ../../../custom-resources/filter-external
[datawire/sample-external-service repository]: https://github.com/datawire/Sample-External-Service/tree/main/v3_Auth
[The Ext_Authz Protocol doc]: ../ext-authz
