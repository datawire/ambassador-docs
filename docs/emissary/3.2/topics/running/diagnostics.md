# Diagnostics

With $productName$ Diagnostics, you get a summary of the current status and mappingws of your cluster and it's services. To enter this view, you will need to navigate to 
`http://localhost:8877/ambassador/v0/diag/`, inside your $productName$ pod. 

Can't access this page? Head to [troubleshooting](#troubleshooting). 

## General Overview

The main $productName$ Diagnostics Overview page is comprised of :

### General Cluster Information

The information displayed here contains :

* Cluster system information (Ambassador module version, Pod hostname, and Cluster ID)
* Snapshot information (When the last status report was made by envoy)
* Configuration information
* Log information level (Changed by turning debug on/off)

And Ambassador cluster information

  <p align="center">
    <img src="../../../images/diag-general-info.png"/>
  </p>

### Notices Section

Logs, errors and notices contained in the health snapshot are displayed here

  <p align="center">
    <img src="../../../images/diag-notices.png"/>
  </p>

### Ambassador Documentation

Quick links to ambassador diagnostics related documentation. 

  <p align="center">
    <img src="../../../images/diag-documentation.png"/>
  </p>

### Ambassador Services

List of the ambassador services that the cluster is currently using.

  <p align="center">
    <img src="../../../images/diag-servicecs-in-use.png"/>
  </p>

By clicking on the link displayed next to the service type will take you to that services own $productName$ Diagnostics page, where you are able to see the active Envoy [Routes](https://www.envoyproxy.io/docs/envoy/v1.8.0/api-v2/api/v2/route/route.proto) and [Clusters](https://www.envoyproxy.io/docs/envoy/v1.8.0/api-v2/api/v2/cds.proto) that the service is currently using, alongside the `YAML` documents that Ambassador uses to read its configuration

  <p align="center">
    <img src="../../../images/diag-service-diag-overview.png" height="600"/>
  </p>

### Ambassador Resolvers

The list of service [resolvers](https://www.getambassador.io/docs/emissary/latest/topics/running/resolvers/#using-resolvers) being used

  <p align="center">
    <img src="../../../images/diag-resolvers.png"/>
  </p>

### Ambassador Route And TCP Mappings

Main section of the overview page. 

<p align="center">
    <img src="../../../images/diag-routes.png" height="600"/>
  </p>

This section contains:

1. **Ambassador Routes** : All the routes inside the cluster gets displayed. The information shown for each route will tell if the route is an internal one, their precedence vaule, service name color coded, and the weight of that route. Clicking on a route will take you to to that route diagnostics page, where you are able to see the active Envoy [Routes](https://www.envoyproxy.io/docs/envoy/v1.8.0/api-v2/api/v2/route/route.proto) and [Clusters](https://www.envoyproxy.io/docs/envoy/v1.8.0/api-v2/api/v2/cds.proto) that the route is currently using, alongside the `YAML` documents that Ambassador uses to read its configuration

2. **Ambassador TCP Mappings** : $productName$ can manage [TCPMappings](../../using/tcpmappings/), and those will get asssociated with upstream services. All your TCP mappings get displayed here. 

3. **Color Legend**: $productName$ assigns a color code to each service name displayed on this page. This color is based on the success rate for each service, and we get this value by computing `successful requests` / `total requests` and express that as a percentage. The "total requests" value comes from Envoy `upstream_rq_pending_total` stat. "successful requests" is calculated by substracting `upstream_rq_4xx` and `upstream_rq_5xx` from the total.

      * Red is used when the success rate ranges from 0% - 70%.
      * Yellow is used when the success rate ranges from 70% - 90%.
      * Green is used when the success rate is > 90%.
      * Grey is used when a service is "waiting". This means the success rate cannot be determined because the service has not recieved any requests yet.
      * Orange is used the service just started, and remains in a `unknown status`

## Troubleshooting

### Can't access $productName$ Diagnostics Overview?

Create an Ambassador `Module` if one does not already exist, and add the following config to enable diagnostics data. $productName$ will pick the new module and add the new configuration. 

```yaml
apiVersion: getambassador.io/v3alpha1
kind: Module
metadata:
  name: ambassador
spec:
  config:
    diagnostics:
      enabled: true
```
Next, In the deployment for Edge Stack / Emissary-ingress set the <code>AES_REPORT_DIAGNOSTICS_TO_CLOUD</code> environment variable to `"true"` to allow diagnostics information to be reported to the cloud.

  ```bash
  # Namespace and deployment name depend on your current install

  kubectl set env deployment/edge-stack-agent -n ambassador AES_REPORT_DIAGNOSTICS_TO_CLOUD="true"
  ```

Finally, set the `AES_DIAGNOSTICS_URL` environment variable to `"http://emissary-ingress-admin:8877/ambassador/v0/diag/?json=true"`

  ```bash
  # Namespace, deployment name, and pod url/port depend on your current install

  kubectl set env deployment/edge-stack-agent -n ambassador AES_DIAGNOSTICS_URL="http://emissary-ingress-admin:8877/ambassador/v0/diag/?json=true"
  ```

After setting up `AES_DIAGNOSTICS_URL`, you can access diagnostics information by using the same URL value. 

### Still can't see $productName$ Diagnostics?

Do a port forward on your $productName$ pod

  ```bash
  # Namespace, deployment name, and pod url/port depend on your current install

  kubectl port-forward edge-stack-76f785767-n2l2v -n ambassador 8877
  ```

You will be able to access the diagnostics overview page by going to `http://localhost:8877/ambassador/v0/diag/`

### $productName$ not routing your services as expected ?

You will need to examine the logs and $productName$ pod status. See [Debugging](../debugging) for more information.
