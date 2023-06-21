---
title: GitHub Actions for Telepresence
description: "Learn more about GitHub Actions for Telepresence and how to integrate them in your processes to run tests for your own environments and improve your CI/CD pipeline. "
---

import Alert from '@material-ui/lab/Alert';
import Platform from '@src/components/Platform';
import QSCards from '../quick-start/qs-cards'

# Telepresence with GitHub Actions

Telepresence combined with [GitHub Actions](https://docs.github.com/en/actions) allows you to run integration tests in your continuous integration/continuous delivery (CI/CD) pipeline without the need to run any dependant service. When you connect to the target Kubernetes cluster, you can intercept traffic of the remote services and send it to an instance of the local service running in CI. This way, you can quickly test the bugfixes, updates, and features that you develop in your project.

You can [register here](https://app.getambassador.io/auth/realms/production/protocol/openid-connect/auth?client_id=telepresence-github-actions&response_type=code&code_challenge=qhXI67CwarbmH-pqjDIV1ZE6kqggBKvGfs69cxst43w&code_challenge_method=S256&redirect_uri=https://app.getambassador.io) to get a free Ambassador Cloud account to try the GitHub Actions for Telepresence yourself. 

## GitHub Actions for Telepresence

Ambassador Labs has created a set of GitHub Actions for Telepresence that enable you to run integration tests in your CI pipeline against any existing remote cluster. The GitHub Actions for Telepresence are the following:

  - **configure**: Initial configuration setup for Telepresence that is needed to run the actions successfully.
  - **install**: Installs Telepresence in your CI server with latest version or the one specified by you.
  - **login**: Logs into Telepresence, you can create a [personal intercept](/docs/telepresence/latest/concepts/intercepts/#personal-intercept). You'll need a Telepresence API key and set it as an environment variable in your workflow. See the [acquiring an API key guide](/docs/telepresence/latest/reference/client/login/#acquiring-an-api-key) for instructions on how to get one.
  - **connect**: Connects to the remote target environment.
  - **intercept**: Redirects traffic to the remote service to the version of the service running in CI so you can run integration tests.

Each action contains a post-action script to clean up resources. This includes logging out of Telepresence, closing the connection to the remote cluster, and stopping the intercept process. These post scripts are executed automatically, regardless of job result. This way, you don't have to worry about terminating the session yourself. You can look at the [GitHub Actions for Telepresence repository](https://github.com/datawire/telepresence-actions) for more information.

# Using Telepresence in your GitHub Actions CI pipeline

## Prerequisites

To enable GitHub Actions with telepresence, you need:

* A [Telepresence API KEY](/docs/telepresence/latest/reference/client/login/#acquiring-an-api-key) and set it as an environment variable in your workflow.
* Access to your remote Kubernetes cluster, like a `kubeconfig.yaml` file with the information to connect to the cluster.
* If your remote cluster already has Telepresence installed, you need to know whether Telepresence is installed [Cluster wide](/docs/telepresence/latest/reference/rbac/#cluster-wide-telepresence-user-access) or [Namespace only](/docs/telepresence/latest/reference/rbac/#namespace-only-telepresence-user-access). If telepresence is configured for namespace only, verify that your `kubeconfig.yaml` is configured to find the installation of the Traffic Manager. For example:

  ```yaml
  apiVersion: v1
  clusters:
  - cluster:
      server: https://127.0.0.1
      extensions:
      - name: telepresence.io
        extension:
          manager:
            namespace: traffic-manager-namespace
    name: example-cluster
  ```

* If Telepresence is installed, you also need to know the version of Telepresence running in the cluster. You can run the command `kubectl describe service traffic-manager -n namespace`. The version is listed in the `labels` section of the output.
* You need a GitHub Actions secret named `TELEPRESENCE_API_KEY` in your repository that has your Telepresence API key. See [GitHub docs](https://docs.github.com/en/github-ae@latest/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) for instructions on how to create GitHub Actions secrets.
* You need a GitHub Actions secret named `KUBECONFIG_FILE` in your repository with the content of your `kubeconfig.yaml`).

**Does your environment look different?** We're actively working on making GitHub Actions for Telepresence more useful for more

<div class="cloud-qs-form">
  <Button  size="m" color="ctaPurple" to="https://support.datawire.io" >
    Create a ticket
  </Button>
  <HubspotForm formId="8b2da809-eda8-436c-b057-13fa318ab34b" />
</div>

## Initial configuration setup

To be able to use the GitHub Actions for Telepresence, you need to do an initial setup to [configure Telepresence](../../reference/config/) so the repository is able to run your workflow. To complete the Telepresence setup:

<Alert severity="warning">
This action only supports <strong>Ubuntu runners</strong> at the moment.
</Alert>
1. In your main branch, create a `.github/workflows` directory in your GitHub repository if it does not already exist.
1. Next, in the `.github/workflows` directory, create a new YAML file named `configure-telepresence.yaml`:

    ```yaml
      name: Configuring telepresence
      on: workflow_dispatch
      jobs:
        configuring:
          name: Configure telepresence
          runs-on: ubuntu-latest
          env:
            TELEPRESENCE_API_KEY: ${{ secrets.TELEPRESENCE_API_KEY }}
          steps:
            - name : Checkout
              uses: actions/checkout@v3
            #---- here run your custom command to connect to your cluster
            #- name: Connect to cluster
            #  shell: bash
            #  run: ./connnect to cluster
            #----
            - name: Congifuring Telepresence
              uses: datawire/telepresence-actions/configure@v1.0-rc
              with:
                version: latest
    ```

1. Push the `configure-telepresence.yaml` file to your repository.
1. Run the `Configuring Telepresence Workflow` [manually](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow) in your repository's Actions tab.

When the workflow runs, the action caches the configuration directory of Telepresence and a Telepresence configuration file if is provided by you. This configuration file should be placed in the`/.github/telepresence-config/config.yml` with your own [Telepresence config](../../reference/config/). If you update your this file with a new configuration, you must run the `Configuring Telepresence Workflow` action manually on your main branch so your workflow detects the new configuration.

<Alert severity="warning">
When you create a branch, do not remove the <strong>.telepresence/config.yml</strong> file. This is required for Telepresence to run GitHub action properly when there is a new push to the branch in your repository.
</Alert>

## Using Telepresence in your GitHub Actions workflows

1. In the `.github/workflows` directory create a new YAML file named `run-integration-tests.yaml` and modify placeholders with real actions to run your service and perform integration tests.

    ```yaml
      name: Run Integration Tests
      on:
        push:
          branches-ignore:
          - 'main'
      jobs:
        my-job:
          name: Run Integration Test using Remote Cluster
          runs-on: ubuntu-latest
          env:
            TELEPRESENCE_API_KEY: ${{ secrets.TELEPRESENCE_API_KEY }}
            KUBECONFIG_FILE: ${{ secrets.KUBECONFIG_FILE }}
            KUBECONFIG: /opt/kubeconfig
          steps:
          - name : Checkout
            uses: actions/checkout@v3
            with:
              ref: ${{ github.event.pull_request.head.sha }}
          #---- here run your custom command to run your service
          #- name: Run your service to test
          #  shell: bash
          #  run: ./run_local_service
          #----
          # First you need to log in to Telepresence, with your api key
          - name: Create kubeconfig file
            run: |
              cat <<EOF > /opt/kubeconfig
              ${{ env.KUBECONFIG_FILE }}
              EOF
          - name: Install Telepresence
            uses: datawire/telepresence-actions/install@v1.0-rc
            with:
              version: 2.5.8 # Change the version number here according to the version of Telepresence in your cluster or omit this parameter to install the latest version
          - name: Telepresence connect
            uses: datawire/telepresence-actions/connect@v1.0-rc
          - name: Login
            uses: datawire/telepresence-actions/login@v1.0-rc
            with:
              telepresence_api_key: ${{ secrets.TELEPRESENCE_API_KEY }}
          - name: Intercept the service
            uses: datawire/telepresence-actions/intercept@v1.0-rc
            with:
              service_name: service-name
              service_port: 8081:8080
              namespace: namespacename-of-your-service
              http_header: "x-telepresence-intercept-id=service-intercepted"
              print_logs: true # Flag to instruct the action to print out Telepresence logs and export an artifact with them
          #---- here run your custom command
          #- name: Run integrations test
          #  shell: bash
          #  run: ./run_integration_test
          #----
    ```

The previous is an example of a workflow that:

* Checks out the repository code.
* Has a placeholder step to run the service during CI.
* Creates the `/opt/kubeconfig` file with the contents of the `secrets.KUBECONFIG_FILE` to make it available for Telepresence.
* Installs Telepresence.
* Runs Telepresence Connect.
* Logs into Telepresence.
* Intercepts traffic to the service running in the remote cluster.
* A placeholder for an action that would run integration tests, such as one that makes HTTP requests to your running service and verifies it works while dependent services run in the remote cluster.

This workflow gives you the ability to run integration tests during the CI run against an ephemeral instance of your service to verify that the any change that is pushed to the working branch works as expected. After you push the changes, the CI server will run the integration tests against the intercept. You can view the results on your GitHub repository, under "Actions" tab.
