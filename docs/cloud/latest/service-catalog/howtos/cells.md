---
title: "Managing your cells | Ambassador Cloud "
description: "Cells are complete, independent instances of entire application in Ambassador Cloud. They represent the application across Development, Staging and Production."
---

import Alert from '@material-ui/lab/Alert';
import { LogInText } from '../../../../../../src/components/Docs/LogInText';

# Cells

Cells are complete, independent instances of entire application in Ambassador Cloud. With Cells, your applications are not limited to the standard Development, Staging, and Production lifecycle. Cells give you the freedom to configure the lifecycle what works best for your application.

## Managing your Cells

Ambassador Cloud associates Kubernetes clusters with Cells.

When you first generate an API key for a cluster, and you added that key to your cluster, the cluster will start reporting the services, we will create as many Cells as namespaces you have in your Cluster, the cell names will be the same as the namespaces, If you do not like the names, do not worry you will be able to rename it.

## Create a new Cell

1. In the Cells Page click in the **+ New** button.

2. The Cell box is shown on the screen in "rename" state, you should type the Cell name that you prefer and click in **Rename**.

The new Cell is automatically favorited and is not connected to anything else.

## Rename a Cell

1. In the Cells Page locate the Cell you want to rename and click ![...](../../images/cells-menu.png) menu.

2. Select the **Rename Cell** option.

3. The Cell box is sown on the screen with a field to name the Cell. Enter a name for the Cell and click **Rename**.

## Delete a Cell

1. Locate the Cell you want to delete and click in the ![...](../../images/cells-menu.png) menu (to delete a Cell is a prerequisite to not have any `cluster:namespace` added to it, if that's not the case you will need to remove all the `cluster:namespace` from the Cell).

2. Select the **Delete Cell** option.

## Associate a Cluster:namespace to a Cell

1. Create a new Cell or locate the Cell you wish to use.

2. If the Cell is empty, click on the ![Cluster:Namespace](../../images/cells-namespace-icon.png) icon that is showing you the number of namespaces (it should show `0`), and select the `Move an existing cluster:namespace to this cell` option.

3. Now, from the list, select the `cluster:namespace` where is running your application.

A `cluster:namespace` can be associated to a single Cell, if you associate a `cluster:namespace` that is already associated to other Cell, it will be removed from the previous Cell.

## Move an existing Cluster:namespace to a Cell

1. Select the Cell where you want to add an existing `cluster:namespace`.

2. Click on the ![Cluster:Namespace](../../images/cells-namespace-icon.png) icon that is showing you the number of namespaces, it will open a list of the current namespaces in the Cell and at the bottom click on the `Move cluster:namespace to this cell` option.

3. It will show a list of the `cluster:namespaces` that are already reported, select and click on the `cluster:namespace` that you want in this Cell.

## Remove a Cluster:namespace from a Cell

1. Locate the Cell that contains the `cluster:namespace` that you want to remove.

2. Click on the ![Cluster:Namespace](../../images/cells-namespace-icon.png) icon that is showing you the number of namespaces, it will open a list of the current namespaces in the Cell.

3. Click on the ![Move namespace](../../images/cells-move-icon.svg) icon from the `cluster:namespace` that you want to remove and then select the destination Cell.

## Model your service lifecycle using cells

A service moves through many environments during its lifecycle. Typical examples are development, staging, and production, but there are often many more than just these three. For example, different developers or teams may have their own development environment, but share staging and production. Or perhaps there are multiple production environments in different regions. You can model these scenarios by defining cells for each environment and then connecting them in a parent-child relationship to represent how the service flows through development, testing, and production in your particular case.

1. Locate the Cells you want to connect to define the new relationship.

2. Select the Cell's connector from the Cell that you identify as start point and draw the line to the Cell that is your end point.

3. If everything went well, you should be able to see a connection line between the Cells in the graphical view.

You can create as many relationships as you need, from one to one, one to many, or many to many.
