# Debugging

If you’re experiencing issues with the $productName$ and cannot diagnose the issue through the `/ambassador/v0/diag/` diagnostics endpoint, this document covers various approaches and advanced use cases for debugging $productName$ issues.

We assume that you already have a running $productName$ installation in the following sections.

## Check $productName$ status

1. First, check the $productName$ Deployment with the following: `kubectl get -n $productNamespace$ deployments`

    After a brief period, the terminal will print something similar to the following:

    ```
    $ kubectl get -n $productNamespace$ deployments
    NAME                DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
    $productDeploymentName$          3         3         3            3           1m
    $productDeploymentName$-apiext   3         3         3            3           1m
    ```

2. Check that the “desired” number of Pods matches the “current” and “available” number of Pods.

3. If they are **not** equal, check the status of the associated Pods with the following command: `kubectl get pods -n $productNamespace$`.

    The terminal should print something similar to the following:

    ```
    $ kubectl get pods -n $productNamespace$
    NAME                         READY     STATUS    RESTARTS   AGE
    $productDeploymentName$-85c4cf67b-4pfj2   1/1       Running   0          1m
    $productDeploymentName$-85c4cf67b-fqp9g   1/1       Running   0          1m
    $productDeploymentName$-85c4cf67b-vg6p5   1/1       Running   0          1m
    $productDeploymentName$-apiext-736f8497d-j34pf   1/1       Running   0          1m
    $productDeploymentName$-apiext-736f8497d-9gfpq   1/1       Running   0          1m
    $productDeploymentName$-apiext-736f8497d-p5wgx   1/1       Running   0          1m
    ```

    The actual names of the Pods will vary. All the Pods should indicate `Running`, and all should show 1/1 containers ready.

4. If the Pods do not seem reasonable, use the following command for details about the history of the Deployment: `kubectl describe -n $productNamespace$ deployment $productDeploymentName$`

    * Look for data in the “Replicas” field near the top of the output. For example:
        `Replicas: 3 desired | 3 updated | 3 total | 3 available | 0 unavailable`

    * Look for data in the “Events” log field near the bottom of the output, which often displays data such as a fail image pull, RBAC issues, or a lack of cluster resources. For example:

        ```
        Events:
        Type    Reason              Age     From                      Message
        ----    ------              ----    ----                      -------
        Normal  ScalingReplicaSet    2m     deployment-controller      Scaled up replica set $productDeploymentName$-85c4cf67b to 3
        ```

5. Additionally, use the following command to “describe” the individual Pods: `kubectl describe pods -n $productNamespace$ <$productDeploymentName$-pod-name>`

    * Look for data in the “Status” field near the top of the output. For example, `Status: Running`

    * Look for data in the “Events” field near the bottom of the output, as it will often show issues such as image pull failures, volume mount issues, and container crash loops. For example:
        ```
        Events:
        Type    Reason                 Age   From                                                     Message
        ----    ------                 ----  ----                                                     -------
        Normal  Scheduled              4m    default-scheduler                                        Successfully assigned $productDeploymentName$-85c4cf67b-4pfj2 to gke-ambassador-demo-default-pool-912378e5-dkxc
        Normal  SuccessfulMountVolume  4m    kubelet, gke-ambassador-demo-default-pool-912378e5-dkxc  MountVolume.SetUp succeeded for volume "$productDeploymentName$-token-tmk94"
        Normal  Pulling                4m    kubelet, gke-ambassador-demo-default-pool-912378e5-dkxc  pulling image "docker.io/datawire/ambassador:0.40.0"
        Normal  Pulled                 4m    kubelet, gke-$productDeploymentName$-demo-default-pool-912378e5-dkxc  Successfully pulled image "docker.io/datawire/ambassador:0.40.0"
        Normal  Created                4m    kubelet, gke-$productDeploymentName$-demo-default-pool-912378e5-dkxc  Created container
        Normal  Started                4m    kubelet, gke-$productDeploymentName$-demo-default-pool-912378e5-dkxc  Started container
        ```

In both the Deployment Pod and the individual Pods, take the necessary action to address any discovered issues.

## Review $productName$ logs

$productName$ logging can provide information on anything that might be abnormal or malfunctioning. While there may be a large amount of data to sort through, look for key errors such as the $productName$ process restarting unexpectedly, or a malformed Envoy configuration.

$productName$ has two major log mechanisms: $productName$ logging and Envoy logging. Both appear in the normal `kubectl logs` output, and both can have additional debug-level logging enabled.

<Alert severity="info">
  Enabling debug-level logging can produce a <i>lot</i> of log output &mdash; enough to
  potentially impact the performance of $productName$. We don't recommend running with debug
  logging enabled as a matter of course; it's usually better to enable it only when needed,
  then reset logging to normal once you're finished debugging.
</Alert>

### $productName$ debug logging

$productName$ logging is primarily concerned with the business of noticing changes to
Kubernetes resources that specify the $productName$ configuration, and generating new
Envoy configuration in response to those changes. Enabling debug logging for this part
of the system is under the control of two environment variables:

- Set `AES_LOG_LEVEL=debug` to debug the early boot sequence and $productName$'s interactions
  with the Kubernetes cluster (finding changed resources, etc.).
- Set `AMBASSADOR_DEBUG=diagd` to debug the process of generating an Envoy configuration from
  the input resources.

### $productName$ Envoy logging

Envoy logging is concerned with the actions Envoy is taking for incoming requests.
Typically, Envoy will only output access logs, and certain errors, but enabling Envoy
debug logging will show very verbose information about the actions Envoy is actually
taking. It can be useful for understanding why connections are being closed, or whether
an error status is coming from Envoy or from the upstream service.

It is possible to enable Envoy logging at boot, but for the most part, it's safer to
enable it at runtime, right before sending a request that is known to have problems.
To enable Envoy debug logging, use `kubectl exec` to get a shell on the $productName$
pod, then:

    ```
    curl -XPOST http://localhost:8001/logging?level=trace && \
    sleep 10 && \
    curl -XPOST http://localhost:8001/logging?level=warning
    ```

This will turn on Envoy debug logging for ten seconds, then turn it off again.

### Viewing logs

To view the logs from $productName$:

1. Use the following command to target an individual $productName$ Pod: `kubectl get pods -n $productNamespace$`

    The terminal will print something similar to the following:

    ```
    $ kubectl get pods -n $productNamespace$
    NAME                         READY     STATUS    RESTARTS   AGE
    $productDeploymentName$-85c4cf67b-4pfj2   1/1       Running   0          3m
    ```

2. Then, run the following: `kubectl logs -n $productNamespace$ <$productDeploymentName$-pod-name>`

The terminal will print something similar to the following:

    ```
    $ kubectl logs -n $productNamespace$ $productDeploymentName$-85c4cf67b-4pfj2
    2018-10-10 12:26:50 kubewatch 0.40.0 INFO: generating config with gencount 1 (0 changes)
    /usr/lib/python3.6/site-packages/pkg_resources/__init__.py:1235: UserWarning: /ambassador is writable by group/others and vulnerable to attack when used with get_resource_filename. Consider a more secure location (set with .set_extraction_path or the PYTHON_EGG_CACHE environment variable).
    warnings.warn(msg, UserWarning)
    2018-10-10 12:26:51 kubewatch 0.40.0 INFO: Scout reports {"latest_version": "0.40.0", "application": "ambassador", "notices": [], "cached": false, "timestamp": 1539606411.061929}

    2018-10-10 12:26:54 diagd 0.40.0 [P15TMainThread] INFO: thread count 3, listening on 0.0.0.0:8877
    [2018-10-10 12:26:54 +0000] [15] [INFO] Starting gunicorn 19.8.1
    [2018-10-10 12:26:54 +0000] [15] [INFO] Listening at: http://0.0.0.0:8877 (15)
    [2018-10-10 12:26:54 +0000] [15] [INFO] Using worker: threads
    [2018-10-10 12:26:54 +0000] [42] [INFO] Booting worker with pid: 42
    2018-10-10 12:26:54 diagd 0.40.0 [P42TMainThread] INFO: Starting periodic updates
    [2018-10-10 12:27:01.977][21][info][main] source/server/drain_manager_impl.cc:63] shutting down parent after drain
    ```

Note that many deployments will have multiple logs, and the logs are independent for each Pod.

## Examine Pod and container contents

You can examine the contents of the $productName$ Pod for issues, such as if volume mounts are correct and TLS certificates are present in the required directory, to determine if the Pod has the latest $productName$ configuration, or if the generated Envoy configuration is correct or as expected. In these instructions, we will look for problems related to the Envoy configuration.

1. To look into an $productName$ Pod, get a shell on the Pod using `kubectl exec`. For example,

    ```
    kubectl exec -it -n $productNamespace$ <$productDeploymentName$-pod-name> -- bash
    ```

2. Determine the latest configuration. If you haven't overridden the configuration directory, the latest configuration will be in `/ambassador/snapshots`. If you have overridden it, $productName$ saves configurations in `$AMBASSADOR_CONFIG_BASE_DIR/snapshots`.

    In the snapshots directory:

    * `snapshot.yaml` contains the full input configuration that $productName$ has found;
    * `aconf.json` contains the $productName$ configuration extracted from the snapshot;
    * `ir.json` contains the IR constructed from the $productName$ configuration; and
    * `econf.json` contains the Envoy configuration generated from the IR.

    In the snapshots directory, the current configuration will be stored in files with no digit suffix, and older configurations have increasing numbers. For example, `ir.json` is current, `ir-1.json` is the next oldest, then `ir-2.json`, etc.

3. If something is wrong with `snapshot` or `aconf`, there is an issue with your configuration. If something is wrong with `ir` or `econf`, you should [open an issue on Github](https://github.com/emissary-ingress/emissary/issues/new/choose).

4. The actual input provided to Envoy is split into `$AMBASSADOR_CONFIG_BASE_DIR/bootstrap-ads.json` and `$AMBASSADOR_CONFIG_BASE_DIR/envoy/envoy.json`.

   - The `bootstrap-ads.json` file contains details about Envoy statistics, logging, authentication, etc.
   - The `envoy.json` file contains information about request routing.
   - You may generally find it simplest to just look at the `econf.json` files in the `snapshot`
     directory, which includes both kinds of configuration.
