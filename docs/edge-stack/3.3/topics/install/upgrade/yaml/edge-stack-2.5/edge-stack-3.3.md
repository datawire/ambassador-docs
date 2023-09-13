import Alert from '@material-ui/lab/Alert';

# Upgrade $productName$ 2.5.Z to $productName$ $version$ (YAML)

<Alert severity="info">
  This guide covers migrating from $productName$ 2.5.Z to $productName$ $version$. If
  this is not your <b>exact</b> situation, see the <a href="../../../../migration-matrix">migration
  matrix</a>.
</Alert>

<Alert severity="warning">
  This guide is written for upgrading an installation made without using Helm.
  If you originally installed with Helm, see the <a href="../../../helm/edge-stack-2.5/edge-stack-3.3">Helm-based
  upgrade instructions</a>.
</Alert>

<Alert severity="warning">
  Make sure that you have converted your External Filters to `protocol_version: "v3"` before upgrading.
  If not set or set to `v2` then an error will be posted and a static response will be returned in $productName$ 3.Y.
</Alert>

Since $productName$'s configuration is entirely stored in Kubernetes resources, upgrading between
versions is straightforward.

$productName$ 3 is functionally compatible with $productName$ 2.x, but with any major upgrade there are some changes to consider. Such as, Envoy removing support for V2 Transport Protocol features. Below we will outline some of these changes and things to consider when upgrading.

### Resources to check before migrating to $version$.

$productName$ 3.X has been upgraded from Envoy 1.17.X to Envoy 1.22 which removed support for the Envoy V2 Transport Protocol. This means all `AuthService`, `RatelimitService`, `LogServices`, and External `Filters` must be updated to use the V3 Protocol. Additionally support for some of the runtime bootstrap flags has been removed.

You can refer to the [Major changes in $productName$ 3.x](../../../../../../about/changes-3.y/) guide for an overview of the changes.

1. $productName$ 3.2 fixed a bug with `Host.spec.selector\mappingSelector` and `Listener.spec.selector` not being properly enforced.
   In previous versions, if only a single label from the selector was present on the resource then they would be associated. Additionally, when associating `Hosts` with `Mappings`, if the `Mapping` configured a `hostname` that matched the `hostname` of the `Host` then they would be associated regardless of the configuration of the `selector\mappingSelector` on the `Host`.

   Before upgrading, review your Ambassador resources, and if you make use of the selectors, ensure that every other resource you want it to be associated with contains all the required labels.

   The environment variable `DISABLE_STRICT_LABEL_SELECTORS` can be set to `"true"` on the $productName$ deployment to revert to the
   old incorrect behavior to help prevent any configuration issues after upgrading in the event that not all manifests making use of the selectors have been corrected yet.

   For more information on `DISABLE_STRICT_LABEL_SELECTORS` see the [Environment Variables page](../../../../../running/environment).

2. Check Transport Protocol usage on all resources before migrating.

    The `AuthService`, `RatelimitService`, `LogServices`, and External `Filters` that use the `grpc` protocol will now need to explicilty set `protocol_version: "v3"`. If not set or set to `v2` then an error will be posted and a static response will be returned.

    `protocol_version` should be updated to `v3` for all of the above resources while still running $productName$ $versionTwoX$. As of version `2.3.z`+, support for `protocol_version` `v2` and `v3` is supported in order to allow migration from `protocol_version` `v2` to `v3` before upgrading to $productName$ $version$ where support for `v2` is removed.

    Upgrading any application code for your own implementations of these services is very straightforward.

    The following imports simply need to be updated to switch from Envoy's Transport Protocol `v2` to `v3`, and then the configuration for these resources can be updated to add the `protocl_version: "v3"` when the updated service is deployed.

    `v2` Imports:
    ```
	    envoyCoreV2 "github.com/datawire/ambassador/pkg/api/envoy/api/v2/core"
	    envoyAuthV2 "github.com/datawire/ambassador/pkg/api/envoy/service/auth/v2"
	    envoyType "github.com/datawire/ambassador/pkg/api/envoy/type"
    ```

    `v3` Imports:
    ```
	    envoyCoreV3 "github.com/datawire/ambassador/v2/pkg/api/envoy/config/core/v3"
	    envoyAuthV3 "github.com/datawire/ambassador/v2/pkg/api/envoy/service/auth/v3"
	    envoyType "github.com/datawire/ambassador/v2/pkg/api/envoy/type/v3"
    ```

3. Check removed runtime changes

   ```
   # No longer necessary because this was removed from Envoy
   # $productName$ already was converted to use the compressor API
   # https://www.envoyproxy.io/docs/envoy/v1.22.0/configuration/http/http_filters/compressor_filter#config-http-filters-compressor
   "envoy.deprecated_features.allow_deprecated_gzip_http_filter": true,

   # Upgraded to v3, all support for V2 Transport Protocol removed
   "envoy.deprecated_features:envoy.api.v2.route.HeaderMatcher.regex_match": true,
   "envoy.deprecated_features:envoy.api.v2.route.RouteMatch.regex": true,

   # Developers will need to upgrade TracingService to V3 protocol which no longer supports HTTP_JSON_V1
   "envoy.deprecated_features:envoy.config.trace.v2.ZipkinConfig.HTTP_JSON_V1": true,

   # V2 protocol removed so flag no longer necessary
   "envoy.reloadable_features.enable_deprecated_v2_api": true,
   ```

4. **Install new CRDs.**

   After reviewing the changes in 3.x and confirming that you are ready to upgrade, the process is the same as upgrading minor versions
   in previous version of $productName$ and does not require the complex migration steps that the migration from 1.x tto 2.x required.

   Before installing $productName$ $version$ itself, you need to update the CRDs in
   your cluster. This is mandatory during any upgrade of $productName$.

   ```
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes-crds.yaml
   kubectl wait --timeout=90s --for=condition=available deployment emissary-apiext -n emissary-system
   ```

   <Alert severity="info">
     $productName$ $version$ includes a Deployment in the `emissary-system` namespace
     called <code>emissary-apiext</code>. This is the APIserver extension
     that supports converting $productName$ CRDs between <code>getambassador.io/v2</code>
     and <code>getambassador.io/v3alpha1</code>. This Deployment needs to be running at
     all times.
   </Alert>

   <Alert severity="warning">
     If the <code>emissary-apiext</code> Deployment's Pods all stop running,
     you will not be able to use <code>getambassador.io/v3alpha1</code> CRDs until restarting
     the <code>emissary-apiext</code> Deployment.
   </Alert>

   <Alert severity="warning">
    There is a known issue with the <code>emissary-apiext</code> service that impacts all $productName$ 2.x and 3.x users. Specifically, the TLS certificate used by apiext expires one year after creation and does not auto-renew. All users who are running $productName$/$OSSproductName$ 2.x or 3.x with the apiext service should proactively renew their certificate as soon as practical by running <code>kubectl delete --all secrets --namespace=emissary-system</code> to delete the existing certificate, and then restart the <code>emissary-apiext</code> deployment with <code>kubectl rollout restart deploy/emissary-apiext -n emissary-system</code>.
    This will create a new certificate with a one year expiration. We will issue a software patch to address this issue well before the one year expiration. Note that certificate renewal will not cause any downtime.
   </Alert>

5. **Install $productName$ $version$.**

   After installing the new CRDs, upgrade $productName$ $version$:

   ```bash
   kubectl apply -f https://app.getambassador.io/yaml/edge-stack/$version$/aes.yaml && \
   kubectl rollout status -n $productNamespace$ deployment/edge-stack -w
   ```
