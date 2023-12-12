import Alert from '@material-ui/lab/Alert';

# Run the demo with Docker

In this Docker quickstart guide, we'll get $productName$ running locally
with a demo configuration. In the next section, we'll then walk through how to
deploy $productName$ in Kubernetes with a custom configuration.

## 1. Running the demo configuration

By default, $productName$ uses a demo configuration to show some of its basic features. Get it running with Docker, and expose $productName$ on port 8080:

```
docker run -it -p 8080:8080 --name=$productDeploymentName$ --rm docker.io/emissaryingress/emissary:$version$ --demo
```

## 2. $productName$'s diagnostics

$productName$ provides live diagnostics viewable with a web browser. While this would normally not be exposed to the public network, the Docker demo publishes the diagnostics service at the following URL:

`http://localhost:8080/ambassador/v0/diag/`

You'll have to authenticate to view this page: use the username `admin`,
password `admin` (obviously this would be a poor choice in the real world!).
We'll talk more about authentication shortly.

To access the Diagnostics page with authentication, use `curl http://localhost:8080/ambassador/v0/diag/ -u admin:admin`

Some of the most important information - your $productName$ version, how recently $productName$'s configuration was updated, and how recently Envoy last reported status to $productName$ - is right at the top. The diagnostics overview can show you what it sees in your configuration map, and which Envoy objects were created based on your configuration.

## 3. The Quote of the Moment service

Since $productName$ is a comprehensive, self-service edge stack, its primary purpose is to provide access and control to microservices for the teams that manage them. The demo is preconfigured with a mapping that connects the `/qotm/` resource to the "Quote of the Moment" service -- a demo service that supplies quotations. You can try it out by opening

`http://localhost:8080/qotm/`

in your browser, or from the command line as

```
curl -L 'http://localhost:8080/qotm/?json=true'
```

This request will route to the `qotm` service at `demo.getambassador.io`, and return a random quote for this very moment.

You can see details of the mapping by clicking the blue `http://localhost:8080/qotm/` link at the very bottom of the `Ambassador Route Table` in the diagnostics overview.

## 4. Authentication

On the diagnostic overview, you can also see that $productName$ is configured to do authentication -- in the middle of the overview page, you'll see the `Ambassador Services In Use` section, and you can click the `tcp://127.0.0.1:5050` link for details on the `AuthService` configuration. This demo auth service is running inside the Docker container with $productName$ and the Quote of the Moment service, and $productName$ uses it to mediate access to everything behind $productName$.

You saw above that access to the diagnostic overview required you to authenticate as an administrator. Getting a random Quote of the Moment does not require authentication, but to get a specific quote, you'll have to authenticate as a demo user. To see this in action, open

`http://localhost:8080/qotm/quote/5`

in your browser. From the command line, you can see that:

```
curl -Lv 'http://localhost:8080/qotm/quote/5?json=true'
```

will return a 401, but

```
curl -Lv -u username:password 'http://localhost:8080/qotm/quote/5?json=true'
```

will succeed. (Note that that's literally "username" and "password" -- the demo auth service is deliberately not very secure!)

Note that it's up to the auth service to decide what needs authentication -- teaming $productName$ with an authentication service can be as flexible or strict as you need it to be.

## Next steps

We've just walked through some of the core features of $productName$ in a local configuration. To see $productName$ in action on Kubernetes, check out the [Installation Guide](../).
