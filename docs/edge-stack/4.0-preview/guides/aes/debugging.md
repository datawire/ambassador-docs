import Alert from '@material-ui/lab/Alert';

# Troubleshooting and Debugging

## Check $productName$ status

1. First, check the $productName$ Deployments with the following:

    After a brief period, the terminal will print something similar to the following:

    ```console
    $ kubectl get -n ambassador deployments

      NAME                DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
      edge-stack-redis                       1/1     1            1           4h15m
      edge-stack-waf-service                 2/2     2            2           4h15m
      edge-stack                             2/2     2            2           4h15m
      envoy-gateway                          2/2     2            2           4h15m
      envoy-default-edge-stack-gw-64656661   1/1     1            1           4h12m
      edge-stack-auth-service                2/2     2            2           4h15m3           1m
    ```

2. Check that the “desired” number of Pods matches the “current” and “available” number of Pods.

3. If they are **not** equal, check the status of the associated Pods

   ```console
   $ kubectl get -n ambassador deployments

     NAME                                                    READY   STATUS      RESTARTS   AGE
     edge-stack-eg-certgen-h55lj                             0/1     Completed   0          4h17m
     edge-stack-redis-76497b9fb7-g8nhx                       1/1     Running     0          4h16m
     edge-stack-78bdd45b97-8xszc                             1/1     Running     0          4h16m
     edge-stack-waf-service-7665598d74-868sw                 1/1     Running     0          4h16m
     edge-stack-waf-service-7665598d74-x4kvp                 1/1     Running     0          4h16m
     edge-stack-78bdd45b97-bhrzc                             1/1     Running     0          4h16m
     envoy-gateway-56df9856c4-plfms                          2/2     Running     0          4h16m
     envoy-gateway-56df9856c4-ttt9d                          2/2     Running     0          4h16m
     envoy-default-edge-stack-gw-64656661-866dc44764-xk4rl   1/1     Running     0          4h13m
     edge-stack-auth-service-7746667d7-hsz5v                 1/1     Running     0          3h4m
     edge-stack-auth-service-7746667d7-4fzvp                 1/1     Running     0          3h4m
   ```

   The actual names of the Pods will vary. All the Pods should indicate `Running`/`Completed`, and all should show all containers ready.

4. If the Pods do not seem reasonable, check the details about the history of the Deployment with `kubectl describe -n ambassador deployment -A`

   * Look for data in the “Replicas” field near the top of the output. For example:
        `Replicas: 3 desired | 3 updated | 3 total | 3 available | 0 unavailable`

   * Look for data in the “Events” log field near the bottom of the output, which often displays data such as a fail image pull, RBAC issues, or a lack of cluster resources. For example:

   ```bash
   Events:
   Type    Reason              Age     From                      Message
   ----    ------              ----    ----                      -------
   Normal  ScalingReplicaSet    2m     deployment-controller      Scaled up replica set to 2
   ```

5. Additionally, use the following command to “describe” the individual Pods: `kubectl describe pod -n ambassador <deployment-pod-name>`

   * Look for data in the “Status” field near the top of the output. For example, `Status: Running`

   * Look for data in the “Events” field near the bottom of the output, as it will often show issues such as image pull failures, volume mount issues, and container crash loops. For example:

   ```bash
   Events:
   Type    Reason                 Age   From                                                     Message
   ----    ------                 ----  ----                                                     -------
   Normal  Scheduled              4m    default-scheduler                                        Successfully assigned edge-stack-auth-service-7746667d7-hsz5v to gke-ambassador-demo-default-pool-912378e5-dkxc
   Normal  Pulling                4m    kubelet, gke-ambassador-demo-default-pool-912378e5-dkxc  pulling image "docker.io/ambassador/aes-authsvc:v4.0.0-preview"
   Normal  Pulled                 4m    kubelet, gke-$productDeploymentName$-demo-default-pool-912378e5-dkxc  Successfully pulled image "docker.io/ambassador/aes-authsvc:v4.0.0-preview"
   Normal  Created                4m    kubelet, gke-$productDeploymentName$-demo-default-pool-912378e5-dkxc  Created container
   Normal  Started                4m    kubelet, gke-$productDeploymentName$-demo-default-pool-912378e5-dkxc  Started container
   ```

   In both the Deployment Pod and the individual Pods, take the necessary action to address any discovered issues.

## Review logs

$productName$ logging can provide information on anything that might be abnormal or malfunctioning. While there may be a large amount of data to sort through, look for key errors such as the $productName$ process restarting unexpectedly.
If a pod is stuck in a crashloop, you can use `kubectl logs -n ambassador <pod-name> -f` to follow the pod logs until it crashes.

- Try enabling debug logs by setting `AES_LOG_LEVEL: "debug"` in the environment variables of the pod.

- You can enable Envoy's Debug logs for any deployments of Envoy Proxy by performing the following steps:

1. `kubectl port-forward -n ambassador <envoy-proxy-pod> 19000:19000`

2. `curl -X POST http://127.0.0.1:19000/logging?level=debug`

   This will put that pod of Envoy Proxy into debug logging mode. Envoy's debug logs are **Very** verbose and may impact performance.

3. Disable Envoy Proxy's debug logs when you are done observing

   - If your port-forward is still active, you can `curl -X POST http://127.0.0.1:19000/logging?level=info`
   - Otherwise, restarting the pods will reset the log level

## Dump the Envoy Config

1. Port-forward to an Envoy Proxy pod: `kubectl port-forward -n ambassador <envoy-proxy-pod> 19000:19000`

2. In a web browser, visit `http://127.0.0.1:19000/config_dump`

   - If you are in Firefox or a similar browser, click on the `Raw Data` button at the top

3. Right click the page and save the contents as something like `config_dump.json` so you can explore it using an editor of your choice.

4. There are plenty of other functions in Envoy's Admin interface you can take advantage of while the port-forward is active
if you are comfortable exploring and debugging Envoy Proxy. Visit `http://127.0.0.1:19000/` in a web browser to check out some of the other functions.
