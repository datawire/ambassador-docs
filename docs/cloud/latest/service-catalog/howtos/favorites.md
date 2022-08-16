---
description: ""
title: ""
---

import Alert from '@material-ui/lab/Alert';

# Filter my service view

If you feel overwhelmed by the number of cluster namespaces and services displayed in the Service Catalog view, you may take advantage of the filtering options to personalize your view.

## Mark a Service as Favorite

On the main Service Catalog view, in the service listing:

1. Locate the service you wish to add to your favorites.

2. Hover over the service row to display the flyout buttons

3. Click the star symbol.

<p align="center">
  <img src="../../../images/add-service-to-favorites.png" width="300" alt="Service flyout buttons"/>
</p>

Favorited services will be displayed with a star icon next to the service name.

Note that the services are favorited for specific environments.

## Filter the view by favorite services

You can filter your view by favorites service or / and cells. Then only the favorites services, and groups containing favorites services will be displayed.

This can be achieved by selecting **Favorites** in the services filter on the page's top bar:

<p align="center">
  <img src="../../../images/service-groups-favorite-services-filter.png"/>
</p>

## Mark a Cell as Favorite

On the cell management page, which you can reach by clicking on the **Cells** item in the left-hand side navigation menu:

1. Locate the `cell` you wish to add to your favorites.

2. Click on the `cell`'s incon to mark as a favorite.

Favorited `cell` will be displayed with a star icon next to its name.

If you had some `cluster:namespace` favorites, those favorites were migrated to `cell` favorites, the cell that contains the `cluster:namespace` favorites it will be marked as a favorite.

## Filter the view by Cell and Services

Customize your view by displaying only favorited cells and services. This can be easily achieved by toggling the filters on the page's top bar from **All** to **Favorites**.

Filters are applied consecutively, starting with the cluster namespace selection, followed by services.

