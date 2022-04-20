import Alert from '@material-ui/lab/Alert';

# Prerequisites

For managing Rollouts in your cluster using Ambassador's Cloud the following requirements have to be fulfilled:

* Argo Rollouts must be installed and configured in the cluster.
  Follow [this quickstart guide to set up Argo CD with Argo Rollouts](/docs/argo/latest/quick-start/).
* Emissary or Edge Stack 2.2.x or higher installed and configured in the cluster.
  Follow [this quickstart guide to set up Edge Stack](/docs/edge-stack/latest/tutorials/getting-started/)

# Managing Rollouts Using Cloud

As a developer, it is always important to keep an eye on deployment metrics to ensure everything is going smoothly. Rollouts can be paused or rolled back even after completion. Ambassador Cloud enables you to manage your deployments with the click of a button.

## Understanding the health of Services and Rollouts

The [RED method](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/) is used for observing
the health of your services. These metrics are briefly stored for you to have a [quick overview of how stable your service is](#understanding-the-health-of-services-and-rollouts).

The key metrics outlined in the RED method are:

* **Rate** - How many requests per second (RPS) your service is serving
* **Errors** - How many requests are failing per second
* **Duration (99th percentile)** - How long the requests are (latency)

You can check the health of any Service or Rollout in the Service Details screen. There you can see various details such as:

* Charts indicating your Service's health (rate, errors and duration).
* If a Rollout is happening
  * Options to pause or resume the Rollout
  * The Rollout's details (when it has started, canary weight, how much time left to complete, etc)
  * The health of the canary instances alongside the stable ones.

## Charts

The **All** view allows you to see a more complete composition of your all your service instances in the cell. This view shows
your canaries depicted as a dotted line in comparison to how it is performing against stable instances.

At the bottom of the Service Details view, you can see charts displaying RED metrics for the last 30 minutes, updated ever 1 minute.

![Line charts](../../images/line-charts.png)

During a canary Rollout, you will see an additional dashed line showing RED metrics.

![Line charts with canary line](../../images/line-charts-canary.png)

If you want to look further into the performance of your services from here, you can click on the links below the charts to open your confiugred monitoring app.

To set up these links, hover over any greyed-out one, click on "Learn more" and you will see instructions for adding the `a8r.io/performance` annotation metadata.

![Adding monitoring app to line charts annotations](../../images/line-charts-annotation-tooltiop.png)

## Pausing a Rollout

<Alert severity="warning">
A Rollout that is paused is kept at the canary weight based on the moment it was paused. This means that users will still be directed to this service at the rate displayed.
</Alert>

You can pause a Rollout to give you more time to look into the status of your service since it begun.

The pause button can be found on the Service Details page in the **Rollouts** tab.

<Alert severity="warning">
Has the exact effect as pausing a rollout in the Argo Rollouts Dashboard or by running *kubectl argo rollouts pause &lt;ROLLOUT_NAME&gt;*
</Alert>

![Rollout in progress](../../images/rollout-actions-in-progress.png)

## Resuming a Rollout

You can resumes the rollout if it was **paused** or **aborted**.

Resuming a **paused** rollout simply allows it to continue.

<Alert severity="warning">
Has the exact same effect as resuming a rollout in Argo
</Alert>

![Paused Rollout](../../images/rollout-actions-paused.png)
