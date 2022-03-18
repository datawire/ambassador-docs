import Alert from '@material-ui/lab/Alert';

# Filter my service view

If you feel overwhelmed by the number of cluster namespaces and services displayed in the Service Catalog view, you may take advantage of the filtering options to personalize your view.

## Mark a Service as Favorite

On the main Service Catalog view: the service listing:

1. Locate the service you wish to add to your favorites.

2. Hover over the service row to display the flyout buttons

3. Click the star symbol.

![Service flyout buttons](../../../images/add-service-to-favorites.png)

Favorited services will be displayed with a star icon next to the service name.

Note that the services are favorited for specific environments.

## Mark a Cell as Favorite

On the cell management page, which you can reach by clicking on the **Cells** item in the left-hand side navigation menu:

1. Locate the `cell` you wish to add to your favorites.

2. Click on the `cell`'s incon to mark as a favorite.

Favorited `cell` will be displayed with a star icon next to its name.

If you had some `cluster:namespace` favorites, those favorites were migrated to `cell` favorites, the cell that contains the `cluster:namespace` favorites it will be marked as a favorite.

## Filter the view by Cell

Customize your view by displaying only favorited Cells in the Cells page. This can be easily achieved by toggling the filters on the page's top bar from **All** to **Favorites**.

## Filter the view by Cell and Services

Customize your view by displaying only favorited cells and services. This can be easily achieved by toggling the filters on the page's top bar from **All** to **Favorites**.

Filters are applied consecutively, starting with the cluster namespace selection, followed by services.
