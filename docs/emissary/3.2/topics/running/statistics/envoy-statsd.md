import Alert from '@material-ui/lab/Alert';

# Envoy statistics with StatsD

> For an overview of other options for gathering statistics on
> $productName$, see the [Statistics and Monitoring](../) overview.

At the core of $productName$ is [Envoy Proxy], which has built-in
support for exporting a multitude of statistics about its own
operations to StatsD (or to the modified DogStatsD used by Datadog).

[Envoy Proxy]: https://www.envoyproxy.io

If enabled, then $productName$ has Envoy expose this information via the
[StatsD](https://github.com/etsy/statsd) protocol.
To enable this, you will simply need to set the environment
variable `STATSD_ENABLED=true` in $productName$'s deployment YAML:

```diff
     spec:
       containers:
       - env:
+        - name: STATSD_ENABLED
+          value: "true"
         - name: AMBASSADOR_NAMESPACE
           valueFrom:
             fieldRef:
```

When this variable is set, $productName$ by default sends statistics to a
Kubernetes service named `statsd-sink` on UDP port 8125 (the usual
port of the StatsD protocol).  You may instead tell $productName$ to send
the statistics to a different StatsD server by setting the
`STATSD_HOST` environment variable.  This can be useful if you have an
existing StatsD sink available in your cluster.

We have included a few example configurations in
[the `statsd-sink/` directory](https://github.com/emissary-ingress/emissary/tree/master/deployments/statsd-sink)
to help you get started.  Clone or download the
repository to get local, editable copies and open a terminal
window in the `emissary/deployments/` folder.

## Using Graphite as the StatsD sink

[Graphite] is a web-based real-time graphing system.  Spin up an
example Graphite setup:

[Graphite]: http://graphite.readthedocs.org/

```
kubectl apply -f statsd-sink/graphite/graphite-statsd-sink.yaml
```

This sets up the `statsd-sink` service and a deployment that contains
Graphite and its related infrastructure.  Graphite's web interface is
available at `http://statsd-sink/` from within the cluster.  Use port
forwarding to access the interface from your local machine:

```
SINKPOD=$(kubectl get pod -l service=statsd-sink -o jsonpath="{.items[0].metadata.name}")
kubectl port-forward $SINKPOD 8080:80
```

This sets up Graphite access at `http://localhost:8080/`.

## Using Datadog DogStatsD as the StatsD sink

If you are a user of the [Datadog] monitoring system, pulling in the
Envoy statistics from $productName$ is very easy.

[Datadog]: https://www.datadoghq.com/

Because the DogStatsD protocol is slightly different than the normal
StatsD protocol, in addition to setting $productName$'s
`STATSD_ENABLED=true` environment variable, you also need to set the
`DOGSTATSD=true` environment variable:

```diff
     spec:
       containers:
       - env:
+        - name: STATSD_ENABLED
+          value: "true"
+        - name: DOGSTATSD
+          value: "true"
         - name: AMBASSADOR_NAMESPACE
           valueFrom:
             fieldRef:
```

Then, you will need to deploy the DogStatsD agent in to your cluster
to act as the StatsD sink.  To do this, replace the sample API key in
our [sample YAML file][`dd-statsd-sink.yaml`] with your own, then
apply that YAML:

[`dd-statsd-sink.yaml`]: https://github.com/emissary-ingress/emissary/blob/master/deployments/statsd-sink/datadog/dd-statsd-sink.yaml

```
kubectl apply -f statsd-sink/datadog/dd-statsd-sink.yaml
```

This sets up the `statsd-sink` service and a deployment of the
DogStatsD agent that forwards the $productName$ statistics to your
Datadog account.

Additionally, $productName$ supports setting the `dd.internal.entity_id`
statitics tag using the `DD_ENTITY_ID` environment variable. If this value
is set, statistics will be tagged with the value of the environment variable.
Otherwise, this statistics tag will be omitted (the default).
