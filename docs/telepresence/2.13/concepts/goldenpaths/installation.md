# Installing the Telepresence Traffic Manager Golden Path

## Why?

Telepresence requires a Traffic Manager to be installed in your cluster, to control how traffic is redirected while intercepting. The Traffic Manager can be installed in two different modes, [Single User Mode](../../modes#single-user-mode) and [Team Mode](../../modes#team-mode). 

Single User Mode is great for an individual user that has autonomy within their cluster and won't impede other developers if they were to intercept traffic. However, this is often not the case for most developers, you often work in a shared environment and will affect other team members by hi-jacking their traffic. 

We recommend installing your Traffic Manager in Team Mode. This will default all Intercepts created to be a [Personal Intercept](../../../reference/intercepts#personal-intercept). This will give each Intercept a specific HTTP header, that will only reroute the traffic containing the header. Thus working best in a team environment.

## How?

Installing the Traffic Manager in Team Mode is quite easy. 

If you install the Traffic Manager using the Telepresence command you can simply pass the `--team-mode` flag like so:

```cli
telepresence helm install --team-mode
```

If you use the Helm chart directly, you can just set the `mode` variable.
```cli
helm install traffic-manager datawire/telepresence --set mode=team
```

Or if you are upgrading your Traffic Manager you can run:

```cli
telepresence helm upgrade --team-mode
```

```cli
helm upgrade traffic-manager datawire/telepresence --set mode=team
```

## Key Learnings

* Team mode is essential when working in a shared cluster to ensure you aren't interrupting other developers workflows
* You can always change the mode of your Traffic Manager while installing or upgrading