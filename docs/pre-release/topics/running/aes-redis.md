# The Ambassador Edge Stack and Redis

The Ambassador Edge Stack make use of Redis for several purposes.  By default,
all components of the Ambassador Edge Stack share a Redis connection pool.

## Rate Limit Service

The rate limiting service, can be configured to use different connection pools 
for handling per-second rate limits or connecting to Redis clusters.

### AES_RATELIMIT_PREVIEW

Set `AES_RATELIMIT_PREVIEW` to `true` to access support for redis clustering, 
local caching, and an upgraded redis client with improved scalability in 
preview mode.

### REDIS_PERSECOND

If `REDIS_PERSECOND` is true, a second Redis connection pool is created (to a
potentially different Redis instance) that is only used for per-second
RateLimits; this second connection pool is configured by the `REDIS_PERSECOND_*`
variables rather than the usual `REDIS_*` variables.

## Redis layer 4 connectivity (L4)

 
#### `SOCKET_TYPE` 

The Go network to use to talk to Redis. see [Go `net.Dial`][]

Most users will leave this as the default of `tcp`.

#### `URL` 

The URL to dial to talk to Redis 

This will be either a hostname:port pair or a comma separated list of 
hostname:port pairs depending on the [`TYPE`](#redis-type) you are using.
  
For `REDIS_URL` (but not `REDIS_PERSECOND_URL`), not setting a value disables
Ambassador Edge Stack features that require Redis.

#### `TLS_ENABLED`  

Specifies whether to use TLS when talking to Redis.

#### `TLS_INSECURE` 

Specifies whether to skip certificate verification when
using TLS to talk to Redis.  

Consider [installing the self-signed certificate for your Redis in to the 
Ambassador Edge Stack container](../../using/filters/#installing-self-signed-certificates) 
in order to leave certificate verification on.

## Redis authentication (auth)

**Default** 

Configure authentication to a redis pool using the default implementation.

#### `PASSWORD`

If set, it is used to `AUTH` to Redis immediately after the connection is
established.

#### `USERNAME`

If set, then that username is used with the password to log in as that user in 
the [Redis 6 ACL][].  It is invalid to set a username without setting a 
password.  It is invalid to set a username with Redis 5 or lower.

**Rate Limit Preview** 

Configure authentication to a redis pool using the preview rate limiting 
implementation

#### `AUTH` 

If set, the value will be used as the password to authenticate to redis with 
username `default`. 

There is no way to change the username with this implementation.


## Redis performance tuning (tune)

#### `POOL_SIZE`

  The number of connections to keep around when idle.

  The total number of connections may go lower than this if there are errors.  

  The total number of connections may go higher than this during a load surge.

#### `PING_INTERVAL` 

  The rate at which Ambassador will ping the idle connections in the normal pool
  (not extra connections created for a load surge). 

  Ambassador will `PING` one of them every `PING_INTERVAL÷POOL_SIZE` so
  that each connection will on average be `PING`ed every `PING_INTERVAL`.
  

#### `TIMEOUT` 

  Sets 4 different timeouts:

   1. `(*net.Dialer).Timeout` for establishing connections
   2. `(*redis.Client).ReadTimeout` for reading a single complete response
   3. `(*redis.Client).WriteTimeout` for writing a single complete request
   4. The timeout when waiting for a connection to become available from the
      pool (not including the dial time, which is timed out separately)

  A value of "0" means "no timeout".

#### `SURGE_LIMIT_INTERVAL`  

  During a load surge, if the pool is depleted, then Ambassador may create new
  connections to Redis in order to fulfill demand, at a maximum rate of one new
  connection per `SURGE_LIMIT_INTERVAL`.  

  A value of "0" (the default) means "allow new connections to be created as
  fast as necessary.

  The total number of connections that Ambassador can surge to is unbounded.

#### `SURGE_LIMIT_AFTER` 

  The number of connections that can be created *after* the normal pool is
  depleted before `SURGE_LIMIT_INTERVAL` kicks in. 

  The first `POOL_SIZE+SURGE_LIMIT_AFTER` connections are allowed to
  be created as fast as necessary.  

  This setting has no effect if `SURGE_LIMIT_INTERVAL` is 0.

#### `SURGE_POOL_SIZE`  

  Normally during a surge, excess connections beyond `POOL_SIZE` are
  closed immediately after they are done being used, instead of being returned
  to a pool.

  `SURGE_POOL_SIZE` configures a "reserve" pool for excess connections
  created during a surge.

  Excess connections beyond `POOL_SIZE+SURGE_POOL_SIZE` will still
  be closed immediately after use.  

#### `SURGE_POOL_DRAIN_INTERVAL`

  How quickly to drain connections from the surge pool after a surge is over. 

  Connections are closed at a rate of one connection per
  `SURGE_POOL_DRAIN_INTERVAL`. 

  This setting has no effect if `SURGE_POOL_SIZE` is 0.

## Redis Type

Redis currently support three different deployment methods. Ambassador Edge
Stack can now support using a Redis deployed in any of these ways for rate
limiting when `AES_RATELIMIT_PREVIEW=true`.

#### `TYPE` 

- `SINGLE`: Talk to a single instance of redis, or a redis proxy.

  Requires the redis `REDIS_URL` or `REDIS_PERSECOND_URL` to be either a
  single hostname:port pair or a unix domain socket reference.

- `SENTINEL`: Talk to a redis deployment with sentinel instances (see
  https://redis.io/topics/sentinel).

  Requires the redis `REDIS_URL` or `REDIS_PERSECOND_URL` to be a comma
  separated list with the first string as the master name of the sentinel
  cluster followed by hostname:port pairs. The list size should be >= 2.
  The first item is the name of the master and the rest are the sentinels.

- `CLUSTER`: Talk to a redis in cluster mode (see 
  https://redis.io/topics/cluster-spec)

  Requires the redis `REDIS_URL` or `REDIS_PERSECOND_URL` to be either a
  single hostname:port pair of the read/write endpoint or a comma separated
  list of hostname:port pairs with all the nodes in the cluster.

  `PIPELINE_WINDOW` must be set when `TYPE: CLUSTER`.

#### `PIPELINE_WINDOW` 

The duration after which internal pipelines will be flushed. 

If window is zero then implicit pipelining will be disabled.

> `150us` is recommended when using implicit pipelining in production.

#### `PIPELINE_LIMIT` 

The maximum number of commands that can be pipelined before flushing. 

If limit is zero then no limit will be used and pipelines will only be limited
by the specified time window.