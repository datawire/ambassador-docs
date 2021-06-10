# Intercepts and Preview URLs FAQs

**Why are my intercepts still reporting as active when they've been disconnected?**

In certain cases, Telepresence might not have been able to communicate back with Ambassador Cloud to update the intercept's status. Worry not, they will get garbage collected after a period of time.

**Why is my intercept associated with an "Unreported" cluster?**

Intercepts tagged with "Unreported" clusters simply mean Ambassador Cloud was unable to associate a service instance with a known detailed service from an Edge Stack or API Gateway cluster. [Connecting your cluster to the Service Catalog](../../service-catalog/quick-start/) will properly match your services from multiple data sources.

## More questions?

Visit the [Telepresence FAQ](../../../../telepresence/latest/faqs/) for more information regarding the usage of the Telepresence CLI tool.
