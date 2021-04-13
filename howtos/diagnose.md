# Diagnose my Kubernetes Deployments

<div class="docs-article-toc">
<h3>Contents</h3>

* [Cluster Status Checks](#cluster-status-checks)
* [Basic Deployment and Pod Status Checks](#basic-deployment-and-pod-status-checks)
* [Crashing Pods](#crashing-pods)
* [Checking Logs](#checking-logs)
* [Exec into Pods](#exec-into-pods)

</div>

Debugging issues in Kubernetes can be difficult and debugging always begins with diagnosing the problem. Finding the information you need to diagnose a failing Deployment or Pod isn't obvious.

If a YAML file applies without error then your app should work, right?  Not necessarily, the YAML could be valid but the configuration or image name or any of dozens of other things could be awry.

Let's look at some common errors and techniques to diagnose issues with your Pods.

## Cluster Status Checks

First, checking the status of your cluster components is helpful if your problems aren't isolated to a single Pod:

```
$ kubectl get componentstatus
  
  NAME                 STATUS    MESSAGE             ERROR
  scheduler            Healthy   ok
  controller-manager   Healthy   ok
  etcd-0               Healthy   {"health":"true"}
```

A issue with any of those components can cause issues across your entire cluster.  Cluster components can fail for many reasons, the [Kubernetes documentation](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster/#a-general-overview-of-cluster-failure-modes) does a good job covering them.

## Basic Deployment and Pod Status Checks

Check the status of your deployments:

```
$ kubectl get deployments
  
  NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
  test                    0/1     1            0           29s
```

The `test` deployment seems to have a problem as its Pod is not ready.  Check the Pod's status next:

```
$ kubectl get pods
  
  NAME                                     READY   STATUS             RESTARTS   AGE
  test-bdcfc6876-rs4nw                     0/1     ImagePullBackOff   0          29s
```

The Pod has an `ImagePullBackOff` status.  This particular error means Kubernetes could not retrieve the container image for some reason: the name was misspelled, the specified tag doesn't exist, or the repository is private and Kubernetes doesn't have access.

We can see more detail by getting a description of the pod:

```
$ kubectl describe pod test-bdcfc6876-rs4nw
  
  Name:         test-bdcfc6876-rs4nw
  Namespace:    default
  ...
  Events:
  Type     Reason   Age                    From     Message
  ----     ------   ----                   ----     -------
  Normal   BackOff  2s (x2 over 32s   kubelet  Back-off pulling image "docker.io/datawire/bad_image_name"
  Warning  Failed   2s (x2 over 32s)  kubelet  Error: ImagePullBackOff
```

Here we see the `ImagePullBackOff` again and, looking at the image name, and obvious reason why it's failing.

## Crashing Pods

Another very common error you will see when a pod won't run is `CrashLoopBackOff`.  Kubernetes expects a pod to start and run continuously.  This is by design so that if the app running in a pod does crash or can't start for any reason, Kubernetes will pick up on the exit error and restart the pod (unless different behavior is specified with [the `restartPolicy` on the Pod `spec`](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy)).  If this happens too many times in too short of a period, then Kubernetes assumes there is a problem with the pod, stops trying to restart it, and returns `CrashLoopBackOff`.

Start a pod with this command:

```
$ kubectl run mysql --image=mysql
  
  pod/mysql created
```

Wait a moment, then check the status:

```
$ kubectl get pods
  
  NAME                                     READY   STATUS             RESTARTS   AGE
  ...
  mysql                                    0/1     CrashLoopBackOff   2          40s
```

What happened?  Describe the pod to get the events from Kubernetes' effort to start it:  

```
$ kubectl describe pod mysql
  
  ...
  Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  66s                default-scheduler  Successfully assigned default/mysql to mycluster
  Normal   Pulling    23s (x4 over 66s)  kubelet            Pulling image "mysql"
  Normal   Pulled     22s (x4 over 66s)  kubelet            Successfully pulled image "mysql"
  Normal   Created    22s (x4 over 66s)  kubelet            Created container mysql
  Normal   Started    22s (x4 over 65s)  kubelet            Started container mysql
  Warning  BackOff    11s (x6 over 64s)  kubelet            Back-off restarting failed container
```

This outputs a lot of information, but the events we need are at the bottom.  We can see Kubernetes pulled the image, started the container, then backed off after restarting the container multiple times.  But why?

## Checking Logs

Kubernetes keeps the logs from the container's runtime.  View them with `kubectl logs <pod_name>`:

```
$ kubectl logs mysql

2021-04-12 16:16:04+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.0.23-1debian10 started.
2021-04-12 16:16:04+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'
2021-04-12 16:16:04+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 8.0.23-1debian10 started.
2021-04-12 16:16:04+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
    You need to specify one of the following:
    - MYSQL_ROOT_PASSWORD
    - MYSQL_ALLOW_EMPTY_PASSWORD
    - MYSQL_RANDOM_ROOT_PASSWORD
```

Here we can see the error preventing MySQL from starting.  

For log streaming, [kail](https://github.com/boz/kail) is a handy tool for viewing logs in real time.  After installing, you can run `kail -p <pod_name>` to start a stream of that Pod's logs.

Delete the MySQL pod, start kail in a new terminal window, and then rerun MySQL, this time setting the root password environment variable:

```
kubectl delete pod mysql
kail -p mysql  # run this command in a new terminal window so you can watch the logs
kubectl run mysql --image=mysql --env="MYSQL_ROOT_PASSWORD=p@ssw0rd"
```

You should see kail stream the MySQL logs as it starts up (successfully this time). 

If a Pod has been running for a while and has accumulated a giant log, or you want to see the logs only from the time the Pod starts, you can restart a Deployment with `kubectl rollout restart deployment <deployment_name>`.  This will stay up new Pods before shutting down old ones, allowing for a restart without interrupting your service uptime.


## Exec into Pods

Sometimes a Pod will start OK, but not act right.  If logs aren't helpful, you can always connect to the Pod's shell by running `kubectl exec -it <pod_name> -- /bin/bash`.  This should give you a terminal on the Pod as whatever user it is running as.  From here you can curl other Pods by name, confirm your ConfigMaps mounted correctly, or any other diagnosing that is relevant to your service.

Depending on the base image the container was built on, you might have to use a different shell such as `/bin/sh` or `/bin/ash.`  Also, given the lightweight nature of many base images, you might find many commands like `curl` or `vim` need to be installed after an `apt-get update`.