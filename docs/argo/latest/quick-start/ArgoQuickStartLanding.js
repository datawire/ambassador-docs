import React, { Component } from 'react';
import ArgoImage from '../../../../../src/assets/images/argo.svg';
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
          />
          Argo quick start
        </h1>
        <p>[TODO: Description here?]</p>
        <p>
          [TODO: Where should the two pages linked below be on the nav sidebar?
          (The left choice in Telepresence does not appear in the nav)]
        </p>
        <p>
          [NOTE: Page content width expands with the description with of the
          boxes below]
        </p>
        <div className="argo-choice-wrapper">
          <div className="argo-choice">
            <h2>
              <mark className="highlight-mark">New</mark>
              to Kubernetes?
            </h2>
            <p>
              [TODO: Description <strong>here</strong>]<br />
            </p>
            <ol>
              <li>Outline step 1...</li>
            </ol>
            <a
              id="tp-demo-option-a"
              href="new-to-kubernetes/"
              className="get-started-button"
            >
              Get Started
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3579 4.4545C12.9186 4.01517 12.2063 4.01517 11.7669 4.4545C11.3276 4.89384 11.3276 5.60615 11.7669 6.04549L16.5969 10.8755H4.68768C4.06636 10.8755 3.56268 11.3792 3.56268 12.0005C3.56268 12.6218 4.06636 13.1255 4.68768 13.1255H16.596L11.7669 17.9545C11.3276 18.3938 11.3276 19.1061 11.7669 19.5455C12.2063 19.9848 12.9186 19.9848 13.3579 19.5455L20.1079 12.7955C20.5473 12.3562 20.5473 11.6438 20.1079 11.2045L13.3579 4.4545Z" />
              </svg>
            </a>
          </div>

          <div className="argo-choice">
            <h2>
              <mark className="highlight-mark">Already</mark>a User?
            </h2>
            <p>
              [TODO: <strong>GitHub+GitLab</strong> description?]
            </p>
            <ol>
              <li>Outline step 1...</li>
            </ol>
            <a
              id="tp-intercepts-option-b"
              href="already-a-user/"
              className="get-started-button"
            >
              Get Started
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3579 4.4545C12.9186 4.01517 12.2063 4.01517 11.7669 4.4545C11.3276 4.89384 11.3276 5.60615 11.7669 6.04549L16.5969 10.8755H4.68768C4.06636 10.8755 3.56268 11.3792 3.56268 12.0005C3.56268 12.6218 4.06636 13.1255 4.68768 13.1255H16.596L11.7669 17.9545C11.3276 18.3938 11.3276 19.1061 11.7669 19.5455C12.2063 19.9848 12.9186 19.9848 13.3579 19.5455L20.1079 12.7955C20.5473 12.3562 20.5473 11.6438 20.1079 11.2045L13.3579 4.4545Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ArgoQuickStartLanding;
