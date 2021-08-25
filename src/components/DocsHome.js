import { Link } from 'gatsby';
import React from 'react';

import AmbassadorCloud from '../../../src/assets/images/ambassador-cloud.svg';
import { Badge } from '../../../src/components/Badge';
import Icon from '../../../src/components/Icon';
import {
  goToTelepresenceDocs,
  goToCloudAnnotate,
  goToCloudEnvironments,
  goToTutorialsGettingStarted,
  goToTelepresenceHowTo,
  goToTelepresenceEnv,
  goToTelepresenceIntercept,
  goToMappings,
  goToOauth,
  goToKubeSSO,
  goToCloudQuickStart,
} from '../../../src/utils/routes';
import { products } from '../config';

const DocsHome = () => {
  return (
    <>
      <section className="docs__started docs__container">
        <div className="docs__info">
          <div className="docs__info--first">
            <h2 className="docs__heading-primary">Documentation</h2>
            <p className="docs__text-primary">
              Concepts, guides, and examples to using Ambassador.
            </p>
          </div>
          <div className="docs__info--second">
            <img
              src={AmbassadorCloud}
              width="280"
              height="153"
              className="docs__ambassador-cloud-image"
              alt="Ambassador Cloud"
            />
          </div>
        </div>
      </section>

      <hr className="docs__separator docs__container" />

      <section className="docs__container">
        <span className="docs__heading-secondary">
          Explore Ambassador Products
        </span>
        {products.map((product, index) => {
          return (
            (index > 0) &&
              <Badge key={product.id} to={product.to}>
                {product.name}
              </Badge>
            )
          }
        )}
        <div className="docs__cards">
          <div className="docs__card">
            <div className="docs__card--heading">
              <Icon name="cloud" />
              Cloud
            </div>
            <p>
              Adopt an integrated workflow for quickly coding, testing, and
              releasing microservices on Kubernetes
            </p>
            <Link to={goToCloudQuickStart} className="docs__button-tertiary">
              Get Started{' '}
              <Icon
                name="right-arrow"
                className="docs__button-tertiary--arrow"
              />
            </Link>
            <hr className="docs__card--separator" />
            <span className="docs__heading-tertiary">Popular Tutorials</span>
            <ul className="docs__popular-list">
              <li>
                <Link to={goToCloudAnnotate}>Annotate a service</Link>
              </li>
              <li>
                <Link to={goToCloudEnvironments}>Manage my environments</Link>
              </li>
            </ul>
          </div>
          <div className="docs__card">
            <div className="docs__card--heading">
              <Icon name="telepresence-icon" />
              Telepresence
            </div>
            <p>
              Code and test microservices locally against a remote Kubernetes
              cluster.
            </p>
            <Link to={goToTelepresenceDocs} className="docs__button-tertiary">
              Get Started{' '}
              <Icon
                name="right-arrow"
                className="docs__button-tertiary--arrow"
              />
            </Link>
            <hr className="docs__card--separator" />
            <span className="docs__heading-tertiary">Popular Tutorials</span>
            <ul className="docs__popular-list">
              <li>
                <Link to={goToTelepresenceIntercept}>Intercept a service</Link>
              </li>
              <li>
                <Link to={goToTelepresenceHowTo}>
                  Collaborate with preview URLs
                </Link>
              </li>
              <li>
                <Link to={goToTelepresenceEnv}>
                  Import environment variables
                </Link>
              </li>
            </ul>
          </div>
          <div className="docs__card">
            <div className="docs__card--heading">
              <Icon name="edge-stack-icon" />
              Edge Stack
            </div>
            <p>
              Route and secure traffic to your cluster with a Kubernetes-native
              API Gateway.
            </p>
            <Link
              to={goToTutorialsGettingStarted}
              className="docs__button-tertiary"
            >
              Get Started{' '}
              <Icon
                name="right-arrow"
                className="docs__button-tertiary--arrow"
              />
            </Link>
            <hr className="docs__card--separator" />
            <span className="docs__heading-tertiary">Popular Tutorials</span>
            <ul className="docs__popular-list">
              <li>
                <Link to={goToMappings}>Introduction to mappings</Link>
              </li>
              <li>
                <Link to={goToOauth}>
                  Single sign-on authentication with OpenID Connect
                </Link>
              </li>
              <li>
                <Link to={goToKubeSSO}>
                  Set up single sign-on with kubectl
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default DocsHome;
