import Alert from '@material-ui/lab/Alert';

# Configuring $productName$'s Redis

Redis is a required component of $productName$ and is used for licensing. If a valid Redis connection is not supplied then $productName$'s pod will fail to start.

The following Environment variables can be used on all of $productName$'s deployments for configuring Redis. This allows you to make modifications to the instance of Redis that ships with $productName$, or even forgo it and provide your own Redis.

If you are installing $productName$ using Helm, there are several values in the chart to help you configure Redis. See [Installing and Updating][] for more details.

## Redis Environment Variables

| Environment Variable | Default     | Parse Type        | Description                        |
|----------------------|-------------|-------------------|------------------------------------|
| `REDIS_SOCKET_TYPE`  | `"tcp"`     | `string`          | The connection type to Redis. Can only be `"tcp"` or `"unix"`. |
| `REDIS_URL`          | N/A         | `string`          | The URL for the connection to Redis. Must be configured. |
| `REDIS_TLS_ENABLED`  | `"false"`   | `bool`            | Whether the connection to Redis uses TLS or not |
| `REDIS_TLS_INSECURE` | `"false"`   | `bool`            | Whether to allow insecure TLS certificates |
| `REDIS_USERNAME`     | N/A         | `string`          | Configures authentication to redis using the supplied username |
| `REDIS_PASSWORD`     | N/A         | `string`          | Configures authentication to redis using the supplied password |
| `REDIS_POOL_SIZE`    | `"10"`      | `int`             | The number of connections to keep around when idle. The total number of connections may go lower than this if there are errors.  The total number of connections may go higher than this during a load surge. |
| `REDIS_TIMEOUT`      | `"0s"`      | [time.Duration][] | Sets the timeout for connecting to Redis. A value of `"0s"` disables these timeouts. |

**Some notes about `REDIS_TIMEOUT`**:

Timeout sets 4 different timeouts:

- `(*net.Dialer).Timeout` for establishing connections
- `(*redis.Client).ReadTimeout` for reading a single
- `(*redis.Client).WriteTimeout` for writing a single
- The timeout when waiting for a connection to become
available from the pool (not including the dial time,
which is timed out separately)

[time.Duration]: https://pkg.go.dev/time
[Installing and Updating]: ../../../install/install-and-update
