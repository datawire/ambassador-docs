# Telepresence Intercept Definitions

To make it easier to share Telepresence intercept configuration across team members, Ambassador Cloud saves intercept
definitions when [the `--save-intercept-definition-as` flag](../../../telepresence/latest/reference/intercepts#sharing-intercept-definition-with-teammates)
is provided with the `telepresence intercept` command.

## Managing intercept definitions

By navigating to the [Telepresence Intercept Definitions page on Ambassador Cloud](https://app.getambassador.io/cloud/telepresence-intercept-definitions),
you can see the list of intercept definitions created by any Ambassador team member. For each of these, you can:

- inspect its author, creation date, updated date and flags
- review the previous versions
- delete a definition (along with all it's versions)
- launch an instance of the definition through a connected Telepresence daemon

**TODO: replace the screenshot by a real one**
![Intercept definitions screenshot](../images/telepresence-intercept-definitions.png)

## Creating and using Intercept Definitions

### Prerequisites

1. Telepresence installed locally. [See the installation instructions](../../../telepresence/latest/install/index.md).
1. An account in Ambassador Cloud.
1. Access to a Kubernetes cluster.

### Creating an intercept definition from the Telepresence CLI

Follow the next instructions to create an intercept definition and share it with your team memebers.

1. Run `telepresence login` to authenticate yourself in Ambassador Cloud.
1. Run `telepresence connect`
1. Intercept traffic to a service running in your Kubernetes cluster by creating an intercept and include the `--save-intercept-definition-as` flag. For example:
  ```bash
  telepresence intercept voting --port 8081:8080 --namespace emojivoto --http-header x-telepresence-intercept-id=test-user-1 --save-intercept-definition-as=intercept-voting-service
  ```
  By adding the `--save-intercept-definition-as` flag Ambassador Cloud will be able to save the arguments used in the intercept command and associate them to the provided name. The
  combination of intercept arguments and the name create an intercept definition that can be reused later by any of the Ambassador team member.

  If you create a new intercept with the same name in the `--save-intercept-definition-as` flag Ambassador Cloud will create a record of it and when your teammates use the intercept
  definition they will get the latest arguments used in the intercept command.

### Using an intercept definition

Once a teammate or yourself have created an intercept definition you can reuse it to create more intercepts with the same set of arguments as in the original command just by typing:

```bash
telepresence intercept <intercept-definition-name>
```

The previous command will fetch the last set of arguments used to create the intercept definition and use them to create a new intercept so you don't have to remember all the arguments
required to intercept a service from a particular cluster.
