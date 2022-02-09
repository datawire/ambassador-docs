import { Link } from 'gatsby';
import React from 'react';

//import Card from '../../../src/components/Card';
import Icon from '../../../src/components/Icon';
import { goToTelepresenceQuickStart } from '../../../src/utils/routes';

import { TelepresenceCards } from './config';

const Card = ({ img, title, description }) => (
  <div>
    <img src={img} />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const Telepresence = () => {
  return (
    <section className="docs__quickStart-container">
      <div className="docs__quickStart-hero">
        <div className="docs__quickStart-container">
          <h1 className="docs__quickStart-title">
            <span className="docs__quickStart-code">Code</span> with
            Telepresence
          </h1>
          <p>
            Ambassador Labs helps make it easier to code with Telepresence. Set
            up your ideal development environment for Kubernetes in seconds with
            Telepresence. Use Telepresence’s intercepts and make continuous
            integration and team collaboration an easy and efficient part of
            your Kubernetes coding process.
          </p>
        </div>
        <img />
      </div>
      <hr className="docs__separator docs__container docs__container-home" />
      <p>
        This guide provides an overview of the key ideas behind Telepresence, as
        well as the instructions you need to get Telepresence up and running in
        your environment quickly.
      </p>
      <div>
        <Card
          title={'Quick start guide'}
          description={
            'Visit the quick start guide to see how easily Telepresence works in a demo environment.'
          }
        />
        <Card
          title={'Telepresence overview'}
          description={
            'Run through the installation guide and create an intercept in your own environment to share with coworkers to see how easy coding collaboration is with Telepresence as a foundation to your Kubernetes development cycle.'
          }
        />
        <Card
          title={'Advanced Telepresence documentation'}
          description={
            'View the full user guide to learn advanced techniques to make your continuous integration even more powerful.'
          }
        />
      </div>
    </section>
  );
};

const Telepresence1 = () => (
  <section className="docs__started docs__container product-page">
    <h1 className="docs__heading-primary docs__heading-primary--aligned">
      <Icon name="telepresence-icon" /> Telepresence
    </h1>
    <p>
      Code and test microservices locally against a remote Kubernetes cluster.
    </p>
    <Link
      to={goToTelepresenceQuickStart}
      className="docs__button-secondary docs__m-bottom-50"
    >
      Get Started{' '}
      <Icon name="right-arrow" className="docs__button-secondary--arrow" />
    </Link>
    <div className="docs__cards">
      {TelepresenceCards.map((c) => (
        <Card
          key={c.title}
          title={c.title}
          description={c.description}
          link={c.link}
          linkText={c.linkText}
          icon={c.icon}
        />
      ))}
    </div>
  </section>
);

export default Telepresence;
