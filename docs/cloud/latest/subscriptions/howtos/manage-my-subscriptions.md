---
title: "Managing Ambassador Labs subscriptions | Ambassador Cloud"
description: "Depending on your needs, Ambassador Labs has subscription plans for all sizes of companies and applications. Find the plan that works best for your team."
---
import Alert from '@material-ui/lab/Alert';

# Manage my subscriptions

Ambassador Labs provides a variety of different subscription options depending on your needs. Whether you're working with a small team with a few developers or a company with a large number of services, Ambassador Labs has flexible subscription options for you to chose from. 

<Alert severity="info">
  A subscription is valid for the entire organization, and all the teams which are part of it.
</Alert>

## Check or upgrade your subscription

In user settings, go to the **Subscriptions** section.

The Subscription section of the Settings page shows your current utilization of Ambassador Cloud and the limits of your plan. Teams Edition subscribers can see their payment history here as well. If you’re nearing any of the quota limits, you can upgrade your subscription tier on this page. To learn more about the upgrade process, see the [upgrade your plan section](#upgrade-your-plan) below.

  <p align="center">
    <img src="/images/cloud/quota_limits.png" width="800" alt="Check or upgrade your subscription"/>
  </p>

## Quota types

There are three quota limits that pertain to subscriptions:

- Telepresence Connect: Time you are connected with Telepresence to your cluster.
- Connected Clusters: The Kubernetes clusters you have connected to the Ambassador Cloud app.
- Requests per Second: Requests per second (RPS) is the maximum usage in the cluster between Rate Limited Traffic and Authenticated Traffic. For multiple clusters, RPS is the sum of the maximum usage of each cluster. RPS is calculated from a database snapshot sent by Edge Stack every 30 seconds.

## Extend your quotas by adding more users

On the Free subscription tier, you can unlock additional quotas by adding more team members to your organization. On the subcription page, click the INVITE button and follow the listed steps to invite new team members and gain access to additional clusters and services for free.

<br />
<p style="max-width:600px;margin:0 auto;">
  <img src="/images/cloud/unlock-features.png" alt="Extend your quotas by adding more users" />
</p>

## Quota limits

Once you've reached a quota limit, you need to upgrade your plan to add more clusters, services, or extend your connect time. When the quota limit is reached, the following message is displayed:

  <p align="center">
    <img src="../../images/active-member-limit.png" width="600" alt="Quota limits" />
  </p>


## Upgrade your plan

If a quota does not fit your requirements, click **upgrade** to increase your quotas.

This opens the following page:

  <p align="center">
    <img src="/images/cloud/subscription_cloud_page.png" width="1000" alt="Upgrade your plan" />
  </p>

Once you have identified a more suitable subscription plan, click on **Buy Now** to be redirected to the checkout page, or **Contact Us** to talk to us about the details of the Enterprise plan.

### Example

For example, on the subscription page the team member quota indicates that you have up to 5 seats available. If you reach the limit, you can either release one seat, or **upgrade** your plan to increase the limit.

  <p align="center">
    <img src="/images/cloud/images/team-members-quota.png" width="600" alt="Upgrade team members" />
  </p>