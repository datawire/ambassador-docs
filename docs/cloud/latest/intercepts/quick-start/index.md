import Alert from '@material-ui/lab/Alert';

# Quick start

<div class="docs-article-toc">
<h3>Contents</h3>

* [Intercepts and Preview URLs](#intercepts-and-preview-urls)
* [Prerequisites](#prerequisites)
* [1. Login to Ambassador Cloud](#1-login-to-ambassador-cloud)
* [2. Select the service you wish to intercept](#2-select-the-service-you-wish-to-intercept)
* [3. Start the intercept using the proposed command](#3-start-the-intercept-using-the-proposed-command)
* [4. Start your local environment](#4-start-your-local-environment)
* [5. Go to the preview URL](#5-go-to-the-preview-url)
* [6. Make a request](#6-make-a-request)
* [7. Share with a teammate](#7-share-with-a-teammate)
* [What's next?](#img-classos-logo-srcimageslogopng-whats-next)

</div>

## Intercepts and Preview URLs

The Ambassador Cloud Service Catalog pulls data from [many sources](../../service-catalog/quick-start/), including Telepresence. If you are only getting started with Telepresence, [follow this guide to install the CLI on your local development environment](../../../../telepresence/latest/quick-start/).

In order to benefit from the added value of Ambassador Cloud for your Telepresence intercepts, you must authenticate your Telepresence CLI. Users who chose to do so will be able to visualize their team's intercepted services in the Service Catalog. The Service Catalog will match your services with other data sources to build an aggregated view of a service as developers are interacting with it. Intercepts from logged-in users also have the ability to attach a Preview URL.

## Prerequisites

* You should have the Telepresence CLI [installed](../../../../telepresence/latest/install/) on your laptop.

* If you have Telepresence already installed and have used it previously, please first reset it with `telepresence uninstall --everything`.

* You will need a service running in your [cluster reporting to Ambassador Cloud](../../service-catalog/quick-start/) that you would like to intercept.

## 1. Login to Ambassador Cloud
  Login to Ambassador Cloud where you can browse the Service Catalog, create intercepts, and share preview URLs:  

  ```
  $ telepresence login
    
     Launching browser authentication flow...
     <browser opens, login and choose your org>
     Login successful.
   ```

## 2. Select the service you wish to intercept

  Click the **New Intercept** button in the service's intercept page, or click the **Intercept** button on the main service listing page. A slideout will guide you through the creation of a "Personal intercept" or a "Global intercept".

## 3. Start the intercept using the proposed command
   
  Start the intercept using Ambassador Cloud's proposed command in the slideout:
   `telepresence intercept example-service --http-match=Personal-Intercept=83ffd461-0f7b-4583-9734-8059d1a33f85`

  You will be asked for the following information:
    1. **Ingress layer 3 address**: This would usually be the internal address of your ingress controller in the format `<service name>.namespace `. For example, if you have a service `ambassador-edge-stack` in the `ambassador` namespace, you would enter `ambassador-edge-stack.ambassador`.
    2. **Ingress port**: The port on which your ingress controller is listening (often 80 for non-TLS and 443 for TLS).
    3. **Ingress TLS encryption**: Whether the ingress controller is expecting TLS communication on the specified port.
    4. **Ingress layer 5 hostname**: If your ingress controller routes traffic based on a domain name (often using the `Host` HTTP header), enter that value here.

  For the example below, you will create a personal intercept with a preview URL for `example-service` which listens on port 8080. The preview URL for ingress will use the `ambassador` service in the `ambassador` namespace on port `443`:

   ```
   $ telepresence intercept example-service --http-match=Personal-Intercept=83ffd461-0f7b-4583-9734-8059d1a33f85
     
     To create a preview URL, telepresence needs to know how cluster
     ingress works for this service.  Please Confirm the ingress to use.
       
     1/4: What's your ingress' layer 3 (IP) address?
          You may use an IP address or a DNS name (this is usually a
          "service.namespace" DNS name).
       
            [default: -]: ambassador.ambassador
       
     2/4: What's your ingress' layer 4 address (TCP port number)?
       
            [default: -]: 443
       
     3/4: Does that TCP port on your ingress use TLS (as opposed to cleartext)?
       
            [default: n]: y
       
     4/4: If required by your ingress, specify a different layer 5 hostname
          (TLS-SNI, HTTP "Host" header) to access this service.
       
            [default: ambassador.ambassador]: ambassador.ambassador
       
     Using deployment example-service
     intercepted
         Intercept name         : example-service
         State                  : ACTIVE
         Destination            : 127.0.0.1:8080
         Service Port Identifier: http
         Intercepting           : HTTP requests that match all of:
           header("Personal-Intercept") ~= regexp("83ffd461-0f7b-4583-9734-8059d1a33f85")
         Preview URL            : https://<random-domain-name>.preview.edgestack.me
         Layer 5 Hostname       : ambassador.ambassador
   ```

## 4. Start your local environment

  Start your local environment with an alternative version of the service running on port 8080.

## 5. Go to the preview URL
 
  The preview URL is now visible in the Intercepts list of your service in Ambassador Cloud. Your local service will be processing the request.

  <Alert severity="success">
    <strong>Success!</strong> You have intercepted traffic coming from your preview URL without impacting other traffic from your Ingress.
  </Alert>

  <Alert severity="info">
    <strong>Didn't work?</strong> It might be because you have services in between your ingress controller and the service you are intercepting that do not propagate the <code>Personal-Intercept</code> HTTP Header. Read more on <a href="../../../../telepresence/latest/concepts/context-prop">context propagation</a>.
  </Alert>

## 6. Make a request

  Make a request on the URL you would usually query for that environment. The request should **not** be routed to your laptop.
   
  Normal traffic coming into the cluster through the Ingress (i.e. not coming from the preview URL) will route to services in the cluster like normal.

## 7. Share with a teammate

  You can collaborate with teammates by sending your preview URL to them. They will be asked to log in to Ambassador Cloud if they are not already. Upon log in they must select the same identity provider and org as you are using; that is how they are authorized to access the preview URL. When they visit the preview URL, they will see the intercepted service running on your laptop.

## <img class="os-logo" src="../../images/logo.png"/> What's next?

You created an Intercept with a unique sharable preview URL! See how you can manage this intercept [here](../howtos/preview-urls/).
