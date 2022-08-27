# The $productName$ container

To give you flexibility and independence from a hosting platform's uptime, you can pull the `ambassador` and `aes` images from any of the following registries:
- `docker.io/datawire/`
   * **Note**: In rare occasions, you may experience rate limits when using Docker Hub. See [this page](https://www.docker.com/increase-rate-limits) to learn how to deal with them.
- `quay.io/datawire/`
- `gcr.io/datawire/`

For an even more robust installation, consider using a [local registry as a pull through cache](https://docs.docker.com/registry/recipes/mirror/) or configure a [publicly accessible mirror](https://cloud.google.com/container-registry/docs/using-dockerhub-mirroring).

## Environment variables

Use the following variables for the environment of your $productName$ container:

| Purpose                           | Variable                                                                                 | Default value                                       | Value type |
|-----------------------------------|----------------------------------------------------------------------------------------- |-----------------------------------------------------|-------------------------------------------------------------------------------|
| Core                              | `AMBASSADOR_ID`                                                                          | `[ "default" ]`                                     | List of strings |
| Core                              | `AMBASSADOR_NAMESPACE`                                                                   | `default` ([^1])                                    | Kubernetes namespace |
| Core                              | `AMBASSADOR_SINGLE_NAMESPACE`                                                            | Empty                                               | Boolean; non-empty=true, empty=false |
| Core                              | `AMBASSADOR_ENVOY_BASE_ID`                                                               | `0`                                                 | Integer |
| Core                              | `AMBASSADOR_LEGACY_MODE`                                                                 | `false`                                             | Boolean; [Go `strconv.ParseBool`][] |
| Core                              | `AMBASSADOR_FAST_RECONFIGURE`                                                            | `false`                                             | EXPERIMENTAL -- Boolean; `true`=true, any other value=false |
| Core                              | `AMBASSADOR_ENVOY_API_VERSION`                                                           | `V3`                                                | String Enum; `V3` or `V2` |
| Core                              | `AMBASSADOR_UPDATE_MAPPING_STATUS`                                                       | `false`                                             | Boolean; `true`=true, any other value=false |
| Core                              | `AMBASSADOR_DISABLE_SNAPSHOT_SERVER`                                                     | `false`                                             | Boolean; non-empty=true, empty=false |
| Core                              | `AMBASSADOR_JSON_LOGGING`                                                                | `false`                                             | Boolean; non-empty=true, empty=false |
| Core                              | `AMBASSADOR_FORCE_SECRET_VALIDATION`                                                     | `false`                                             | Boolean: `true`=true, any other value=false |
| Core                              | `AMBASSADOR_EDS_BYPASS`                                                                  | `false`                                             | Boolean; `true`=true, any other value=false |
| $AESproductName$                  | `AES_LOG_LEVEL`                                                                          | `warn`                                              | Log level |
| Developer Portal                  | `DEVPORTAL_CONTENT_URL`                                                                  | `https://github.com/datawire/devportal-content`     | git-remote URL |
| Developer Portal                  | `DEVPORTAL_CONTENT_DIR`                                                                  | `/`                                                 | Rooted Git directory |
| Developer Portal                  | `DEVPORTAL_CONTENT_BRANCH`                                                               | `master`                                            | Git branch name |
| Developer Portal                  | `POLL_EVERY_SECS`                                                                        | `60`                                                | Integer |
| Envoy                             | `STATSD_ENABLED`                                                                         | `false`                                             | Boolean; Python `value.lower() == "true"` |
| Envoy                             | `DOGSTATSD`                                                                              | `false`                                             | Boolean; Python `value.lower() == "true"` |
| Envoy                             | `DD_ENTITY_ID`                                                                           | Empty                                               | String |
| Envoy                             | `ENVOY_CONCURRENCY`                                                                      | Empty                                               | Integer

Log level names are case-insensitive.  From least verbose to most
verbose, valid log levels are `error`, `warn`/`warning`, `info`,
`debug`, and `trace`.

## Port assignments

$productName$ uses the following ports to listen for HTTP/HTTPS traffic automatically via TCP:

| Port | Process  | Function                                                |
|------|----------|---------------------------------------------------------|
| 8001 | envoy    | Internal stats, logging, etc.; not exposed outside pod  |
| 8002 | watt     | Internal watt snapshot access; not exposed outside pod  |
| 8003 | ambex    | Internal ambex snapshot access; not exposed outside pod |
| 8004 | diagd    | Internal `diagd` access when `AMBASSADOR_FAST_RECONFIGURE` is set; not exposed outside pod |
| 8005 | snapshot | Exposes a scrubbed $productName$ snapshot outside of the pod |
| 8080 | envoy    | Default HTTP service port                               |
| 8443 | envoy    | Default HTTPS service port                              |
| 8877 | diagd    | Direct access to diagnostics UI; provided by `busyambassador entrypoint` when `AMBASSADOR_FAST_RECONFIGURE` is set |

[^1]: This may change in a future release to reflect the Pods's
      namespace if deployed to a namespace other than `default`.
      https://github.com/emissary-ingress/emissary/issues/1583

[Go `net.Dial`]: https://golang.org/pkg/net/#Dial
[Go `strconv.ParseBool`]: https://golang.org/pkg/strconv/#ParseBool
[Go `time.ParseDuration`]: https://pkg.go.dev/time#ParseDuration
[Redis 6 ACL]: https://redis.io/topics/acl
