# What’s new in Telepresence 2.8.0?

## Global Client Configuration

All values that previously was only configurable using a local `config.yml` file, or in some
cases a Kubernetes extension in the kubeconfig, on each workstation, can now be configured using
a `client:` structure in the Helm chart. A client will configure itself according to this global
configuration whenever it connects to a cluster. The local configuration still exists, and has
precedence.

## View the Client Configuration

A new `telepresence config view` command is added to make it easy to view the current client
configuration, as set when merging the configuration provided by the traffic-manager with the
local configuration. When called with `--client-only`, the command will only show the configuration
stored in the `config.yml` file of the client.

## YAML Output

The `--output` flag that is global to all `telepresence` commands, now accepts `yaml` in addition to `json`
so that output from commands like `telepresence config view` can be nicely formatted.
