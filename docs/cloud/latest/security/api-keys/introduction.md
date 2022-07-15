import Alert from '@material-ui/lab/Alert';

# Introduction

<Alert severity="warning">
  This feature is supported only if you're cluster is running Edge-stack 3.1 and above.
</Alert>

Edge stack allows to create different filters to enforce an authentication on top of your 
services. One of these authentication method is the use of simple API Keys.

The Cloud UI gives you the ability to create such autentication system, and then to manage
your own set of keys.

  <p align="center">
    <img src="./../../../images/security-filters-api-keys.png" width="1000"/>
  </p>


# Technical architecture

To implement this functionnality, Ambassador cloud will interact with your cluster by leveraging the [Filter](../../../../../edge-stack/latest/topics/using/filters/apikeys/) & [FilterPolicy](../../../../../edge-stack/latest/topics/using/filters/#filterpolicy-definition) CRDs.

For each set of key, the system relies on:
1. A `Filter` with the `APIKey` configuration.
2. A shared `FilterPolicy` used by all the filters created through this functionnality.
3. A `Secret` for each set of keys, referenced in the `Filter`.
4. A link between Ambassador Cloud and your cluster to add / remove the keys from the secret associated with the filter (activated when you link your cluster to Ambassador Cloud)





