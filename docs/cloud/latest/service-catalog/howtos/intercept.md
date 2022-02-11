import Alert from '@material-ui/lab/Alert';

# Intercept a service

You can quickly intercept traffic destined to a workload in your cluster so that it is sent to your workstation instead.

## Install Telepresence and log in

Follow [these instructions](/docs/telepresence/latest/install/) to install the latest version of Telepresence and make sure to login by running the following command:

    $ telepresence login

<Alert severity="info">Telepresence v2.5.0 or greater is required.</Alert>

Once you have logged in, you should see an indicator in the top bar telling you that you have a Telepresence instance
connected. Hover it and it will tell you what services are available for it to intercept. If your service is not part
of it, you might want to:
- make sure your Kubernetes cluster has [Edge Stack or Emissary-ingress installed and reporting to the cloud](/docs/cloud/latest/service-catalog/quick-start/);
- switch your current Telepresence context so that you are connected to the right Kubernetes cluster **(TODO: Telepresence docs on context switching with the long-running daemons?)**.

![Intercept Button](../../../images/cloud-intercept-button.png)

![Intercept Slideout](../../../images/cloud-intercept-slideout.png)

## Intercept from the main Service Catalog view

1. Start your local instance of the service
2. Select a service you want to intercept
3. In the Heads Up Display (HUD) section at the bottom of the screen, click the `+ Intercept` button.
4. Follow the instructions to complete the intercept.

## Intercept from the Service Details view

1. Start your local instance of the service
2. Go to the `Intercept` tab
3. Click the `New Intercept` button
4. Follow the instructions to complete the intercept.
