import Alert from '@material-ui/lab/Alert';

# Manage an Intercept's preview URL

## Change access restrictions

To collaborate with someone outside of your identity provider's organization, you must make your preview URL publicly accessible.

  1. Go to [Ambassador Cloud](https://app.getambassador.io/cloud/)
  2. Navigate to the desired service Intercepts page
  3. Expand the preview URL details
  4. Click **Make Publicly Accessible**
    
Now anyone with the link will have access to the preview URL. When they visit the preview URL, they will see the intercepted service running on a local environment.

To disable sharing the preview URL publicly, click **Require Authentication** in the dashboard. 

## Remove a preview URL from an Intercept

To delete a preview URL and remove all access to the intercepted service,

  1. Go to [Ambassador Cloud](https://app.getambassador.io/cloud/)
  2. Navigate to the desired service Intercepts page
  3. Expand the preview URL details
  4. Click **Remove Preview**

Alternatively, a preview URL can also be removed by running 
  `telepresence preview remove <intercept-name>`
