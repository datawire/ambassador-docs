# Sharing intercepted services

Telepresence can generate sharable preview URLs, allowing you to work on a copy of your service locally and share that environment directly with a teammate for pair programming. While using preview URLs Telepresence will route only the requests coming from that preview URL to your local environment; requests to the ingress will be routed to your cluster as usual.

Preview URLs are protected behind authentication via Ambassador Cloud, ensuring that only users in your organization can view them. A preview URL can also be set to allow public access for sharing with outside collaborators.

Preview URLs generate an ingress request containing a custom header with a token (the context). Telepresence sends this token to Ambassador Cloud with other information about the preview. Visiting the preview URL directs the user to Ambassador Cloud, which proxies the user to the cluster ingress with the token header injected into the request. The request carrying the header is routed in the cluster to the appropriate pod (the propagation). The Traffic Agent on the service pod sees the header and intercepts the request, redirecting it to the local developer machine that ran the intercept.
