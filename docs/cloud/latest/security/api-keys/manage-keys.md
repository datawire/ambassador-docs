import Alert from '@material-ui/lab/Alert';

# Manage api keys

From this part of the interface, you can generate or revoke a key across multiple filters.

# Steps

First, browse through the different 'pools' of API keys, and unfold the one
you want to manage by clicking on it.

<p align="center">
  <img src="./../../../images/security-filters-api-keys-unfold.png" width="1000"/>
</p>

## Create a key

To create a key, click on **CREATE API KEY**, and provide a name & a description:

<p align="center">
  <img src="./../../../images/security-filters-api-keys-create.png" width="600"/>
</p>

<Alert severity="warning">
  You won't be able to see the value of this key again.
</Alert>

A key will be generated, and you can copy it to send it to a client the way you prefer. 

<Alert severity="info">
  It can take up to 30 seconds before the key becomes active.
</Alert>

## Revoke a key

To revoke a key, select the one you want to revoke, and click on **REVOKE**. The key won't 
be usable anymore.





