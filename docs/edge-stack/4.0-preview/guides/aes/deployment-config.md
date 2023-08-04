import Alert from '@material-ui/lab/Alert';

# Configuring $productName$'s Deployments

Currently $productName$'s Deployments have minimal configuraiton and only support the following Environment Variables.

| Environment Variable       | Default     | Parse Type        | Description                        |
|----------------------------|-------------|-------------------|------------------------------------|
| `AES_LOG_LEVEL`            | `"info"`    | `string`          | Configures the logging verbosity. Allowed values are: `debug`;`info`;`warn`;`error`;`dpanic`;`panic`;`fatal` |
| `AMBASSADOR_JSON_LOGGING`  | `"false"`   | `bool`            | When set to `"true"`, configures all logging to use JSON as the format |

There are several more environment variables supported by all Deployments used specifically for [configuring Redis][].

[configuring Redis]: ../redis-config
