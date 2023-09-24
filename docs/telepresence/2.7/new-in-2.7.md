# What’s new in Telepresence 2.7.0?

## Distributed tracing
- Telepresence components now automatically pass OTEL headers to one another and keep trace data in memory
- Traces can be collected into a zip file with `telepresence gather-traces` and uploaded to an OTEL collector with `telepresence upload-traces`

## Helm install improvements
- The traffic manager is installed with `telepresence helm install`. It must be installed before connecting or creating intercepts.
- The traffic manager can be configured using a values file.
- The command `telepresence uninstall` has been moved to `telepresence helm uninstall`
