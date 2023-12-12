import React, { Component } from 'react';

import ArgoImage from '../../../../../src/assets/images/argo.svg';
import MarkdownLink from '../../../../src/components/MarkdownLink';

import './argo-quickstart-landing.less';

class ArgoQuickStartLanding extends Component {
  render() {
    return (
      <div className="argo-quickstart-landing">
        <h1 className="docs__heading-primary docs__heading-primary--aligned">
          <img
            src={ArgoImage}
            className="docs__argo-icon"
            alt="Argo"
            width="197"
            height="250"
            loading='lazy'
          />
          Argo quick start
        </h1>
        <p>
          Do a Canary Rollout to <strong>safely deploy</strong> your app on a
          Kubernetes cluster.
        </p>
        <div className="argo-choice-wrapper">
          <div className="argo-choice">
            <h2>
              <mark className="highlight-mark">New</mark>
              to Kubernetes?
            </h2>
            <p>
              Use <strong>our cluster</strong> to do a Canary Rollout with our
              sample app. See Argo in action without writing lots of YAML.
            </p>
            <ol>
              <li>Connect to the demo cluster</li>
              <li>Define a Rollout</li>
              <li>Watch a Canary Rollout in action</li>
            </ol>
            <MarkdownLink
              id="tp-demo-option-a"
              href="./new-to-kubernetes"
              className="get-started-button"
            >
              Get Started
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3579 4.4545C12.9186 4.01517 12.2063 4.01517 11.7669 4.4545C11.3276 4.89384 11.3276 5.60615 11.7669 6.04549L16.5969 10.8755H4.68768C4.06636 10.8755 3.56268 11.3792 3.56268 12.0005C3.56268 12.6218 4.06636 13.1255 4.68768 13.1255H16.596L11.7669 17.9545C11.3276 18.3938 11.3276 19.1061 11.7669 19.5455C12.2063 19.9848 12.9186 19.9848 13.3579 19.5455L20.1079 12.7955C20.5473 12.3562 20.5473 11.6438 20.1079 11.2045L13.3579 4.4545Z" />
              </svg>
            </MarkdownLink>
          </div>

          <div className="argo-choice">
            <h2>
              <mark className="highlight-mark">Active</mark> Kubernetes User?
            </h2>
            <p>
              Start using Argo in your own environment. Follow these steps to do
              a Canary Rollout for your app in <strong>your cluster</strong>.
            </p>
            <ol>
              <li>Configure your cluster to use Argo</li>
              <li>Set up your service and image repositories</li>
              <li>Define and run a Canary Rollout on your service</li>
            </ol>
            <MarkdownLink
              id="tp-intercepts-option-b"
              href="../../../argo/latest/howtos/configure-argo-rollouts/"
              className="get-started-button"
            >
              Get Started
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3579 4.4545C12.9186 4.01517 12.2063 4.01517 11.7669 4.4545C11.3276 4.89384 11.3276 5.60615 11.7669 6.04549L16.5969 10.8755H4.68768C4.06636 10.8755 3.56268 11.3792 3.56268 12.0005C3.56268 12.6218 4.06636 13.1255 4.68768 13.1255H16.596L11.7669 17.9545C11.3276 18.3938 11.3276 19.1061 11.7669 19.5455C12.2063 19.9848 12.9186 19.9848 13.3579 19.5455L20.1079 12.7955C20.5473 12.3562 20.5473 11.6438 20.1079 11.2045L13.3579 4.4545Z" />
              </svg>
            </MarkdownLink>
          </div>
        </div>
      </div>
    );
  }
}

export default ArgoQuickStartLanding;
