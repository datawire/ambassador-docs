import * as Macros from "../macros";

# Debug a Kubernetes service locally

<Macros.Install
    install="https://kubernetes.io/docs/tasks/tools/install-kubectl/"
    command="kubectl"
    cluster="Kubernetes"
    location="top" />

<Macros.GettingStartedPart1 cluster="Kubernetes" />

You should start a `Deployment` and publicly exposed `Service` like this:

```console
$ kubectl create deployment hello-world --image=datawire/hello-world
$ kubectl expose deployment hello-world --type=LoadBalancer --port=8000
```

> **If your cluster is in the cloud** you can find the address of the resulting `Service` like this:
>
> ```console
> $ kubectl get service hello-world
> NAME          CLUSTER-IP     EXTERNAL-IP       PORT(S)          AGE
> hello-world   10.3.242.226   104.197.103.123   8000:30022/TCP   5d
> ```

> If you see `<pending>` under EXTERNAL-IP wait a few seconds and try again.
> In this case the `Service` is exposed at `http://104.197.103.123:8000/`.

> **On `minikube` you should instead** do this to find the URL:
>
> ```console
> $ minikube service --url hello-world
> http://192.168.99.100:12345/
> ```

<Macros.GettingStartedPart2
    deployment="Deployment"
    command="kubectl"
    cluster="Kubernetes" />

```console
$ kubectl delete deployment,service hello-world
```

Telepresence can do much more than this: see the reference section of the documentation, on the top-left, for details.

<Macros.Install
    install="https://kubernetes.io/docs/tasks/tools/install-kubectl/"
    command="kubectl"
    cluster="Kubernetes"
    location="bottom" />

<Macros.TutorialFooter/>
