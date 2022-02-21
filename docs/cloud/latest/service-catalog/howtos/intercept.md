import Alert from '@material-ui/lab/Alert';

# Intercept a service

You can quickly intercept traffic destined to a workload in your cluster so that it is sent to your workstation instead.

## Install Telepresence and log in

Follow [these instructions](/docs/telepresence/latest/install/) to install the latest version of Telepresence and make sure to login by running the following command:

    $ telepresence login

<Alert severity="info">Telepresence v2.5.0 or greater is required.</Alert>

## Intercept from the Connected view

1. Start your local instance of the service
1. Once you have logged in, you should see an indicator in the top bar telling you that your computer is connected. Click
on "Connected (x/x)", hover your computer name and click the "Intercept" button.

   ![Connected computer view's Intercept button](../../../images/connected-view-intercept-button.png)
1. In the slideout that opens, you'll see the list of services available to intercept based on the selected Namespace
filter.
   ![Intercept Slideout](../../../images/intercept-slideout-service-list.png)
1. Click on the service you want to intercept
1. [Fill out the form to complete the intercept.](#fill-out-the-form-to-complete-the-intercept)

## Intercept from the main Service Catalog view

1. Start your local instance of the service
1. Select a service you want to intercept
1. In the Heads Up Display (HUD) section at the bottom of the screen, click the `+ Intercept` button.
1. [Fill out the form to complete the intercept.](#fill-out-the-form-to-complete-the-intercept)

## Intercept from the Service Details view

1. Start your local instance of the service
1. Go to the `Intercept` tab
1. Click the `New Intercept` button
1. [Fill out the form to complete the intercept.](#fill-out-the-form-to-complete-the-intercept)

## Fill out the form to complete the intercept

1. Select the port from your service that you want to intercept
1. Select which port on your computer where requests should be sent to
1. Optionally, update the advanced settings that define how requests from generated preview url should be sent to you cluster:
   1. In the "INGRESS IP ADDRESS/DNS NAME + PORT NUMBER" field, enter the address and port of a LoadBalancer service in your cluster
   1. Select whether the LoadBalancer service port uses TLS
   1. Specify the `Host` header that should be passed along with the request. If you have a Mapping that routes requests to your services based a specific hostname, this is the value you should specify here
1. Click `Intercept`

   ![Intercept settings form](../../../images/intercept-slideout-settings-confirmation.png)
