
# Organize the service catalog

The service catalog references all your services across your environments. Although, it can be hard to identify which 
moving pieces are working together, forcing you to rely only on their name.

This guide explains how you can use the <a href="../../concepts/service-groups//">service groups</a> for this purpose.

## Identify the services you want to group together

Services can be grouped together in different fashions depending on your need. The most common use case is to group
services which are related to a group of functionnalities, or a specific application.

Taking the example of a database working as a multi-node cluster, you may have:

* **database-primary**
* **database-read-replicas**
* **database-admin**

It would be a good idea to group all of them under a **database** group.

## Add a service to a group

1. Hover the mouse on a service that does not belong to a group, and click on the **move to group** option.

  <p align="center">
    <img src="../../../images/service-group-create.png"/>
  </p>

2. Select an existing group, or click on **new group** to add a one and name it. Then click on **save**.

  <p align="center">
    <img src="../../../images/service-group-add.png"/>
  </p>


## Remove a service from a group

1. Hover the mouse on a group, and click on **manage this group** to edit it.

  <p align="center">
    <img src="../../../images/service-group-manage.png"/>
  </p>

2. Select the **services** tab, and remove all the services you don't need anymore by clicking on **remove**.
  
  <p align="center">
    <img src="../../../images/service-group-remove.png"/>
  </p>

3. Click **save** to apply the changes. The group will be automatically deleted if there are no more services in it.
