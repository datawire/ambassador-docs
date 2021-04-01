# Ambassador Edge Stack Extensions

The Ambassador Edge Stack contains a number of pre-built extensions that make
running, deploying, and exposing your applications in Kubernetes easier. 

Use of AES extensions is implemented via Kubernetes Custom Resources.
Documentation for how to uses the various extensions can be found throughout the
[Using AES AES for Developer](../../using/) section of the docs. This section
is concerned with how to operate and tune deployment of these extensions in AES.

## Redis

Sine AES does not use a database, Redis is uses for caching state information
when an extension requires it.

The Ambassador Edge Stack shares the same Redis pool for all features that use
Redis.

The [Redis documentation](../aes-redis) contains detailed information on tuning
how AES talks to Redis.

## The Extension Process

The various extensions of the Ambassador Edge Stack run as a separate process
from the Ambassador control plane and Envoy data plane.

### `AES_LOG_LEVEL`

The `AES_LOG_LEVEL` controls the logging of all of the extensions in AES.

Log level names are case-insensitive.  From least verbose to most
verbose, valid log levels are `error`, `warn`/`warning`, `info`,
`debug`, and `trace`.