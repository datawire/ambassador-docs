---
title: "Ambassador Cloud Developer Portal"
description: "API Management by Ambassador"
---

# Ambassador Cloud Developer Portal guide

You will access and explore some of the key features of the Developer Portal in Ambassador Cloud.

## What is the Ambassador Cloud Developer Portal ?

The Developer Portal allows you to publish API documentation about your services, it provides you a consolidated view using the information from all your [cells](../../service-catalog/concepts/cells) and all your clusters.

## Features

The Developer Portal has the following features:

- Service discovery for all your services connected to Ambassador Cloud.
- API documentation of your services.
- Share privately and publicly your Developer Portal.

## Add Open API documentation to Developer Portal

Before exploring the Developer Portal, you first need to report your API docs using Mapping resources. You can follow this [quick start](../../visualize-api/quick-start).

## Explore Developer Portal

The Developer Portal is accessible in the [Cloud](https://app.getambassador.io/cloud/dev-portal) using the side navigation menu.

  <p align="center">
    <img src="./../../images/dev-portal-cloud.png" width="800"/>
  </p>

All your services are consolidated by [cell name](../../service-catalog/concepts/cells), here you can explore the Open API documentation and try out the services :

  <p align="center">
    <img src="./../../images/dev-portal-cloud-service.png" width="800"/>
  </p>

  ## Using the spec within the Developer Portal

  Often times your users will want to try out some of the requests directly from the Developer Portal.

  There may be some caveates when doing so:

  1. If you've added your basepath in your swagger specification, or the full path to the URL Edge Stack will add it when parsing the contract. 
  1. You may need to set CORS on the mappings for your routes to `https://app.getambassador.io`
