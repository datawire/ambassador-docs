import Alert from '@material-ui/lab/Alert';

# Manage API keys

This page will display all filters associated to your cluster, and give you the ability to create and revoke keys amongst those filters.

# Steps

Browse through the different filters and unfurl the one you want to manage by clicking on it.

<p align="center">
  <img src="./../../../images/security-filters-api-keys-unfold.png" width="1000"/>
</p>

## Create a key

To create a key, click on **CREATE API KEY**, and provide a name and description:

<p align="center">
  <img src="./../../../images/security-filters-api-keys-create.png" width="600"/>
</p>

<Alert severity="warning">
  You won't be able to see the value of this key again.
</Alert>

A key will be generated you can then copy and provide to the end user. 

<Alert severity="info">
  It can take up to 30 seconds before the key becomes active.
</Alert>

## Revoke a key

To revoke a key, select the key you want to revoke, and click on **REVOKE**. The key won't 
be usable anymore.





