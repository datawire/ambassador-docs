import React from 'react';
import { Link } from 'gatsby';

import Icon from '../../../src/components/Icon';
import Card from '../../../src/components/Card';
import { TelepresenceCards } from './config';
import { goToTelepresenceQuickStart } from '../../../src/utils/routes';

const Telepresence = () => (
  <section className="docs__started docs__container product-page">
    <h2 className="docs__heading-primary docs__heading-primary--aligned">
      <Icon name="telepresence-icon" /> Telepresence
    </h2>
    <p>Code and test microservices locally against a remote Kubernetes cluster.</p>
    <Link to={goToTelepresenceQuickStart} className="docs__button-secondary docs__m-bottom-50">
      Get Started <Icon name="right-arrow" className="docs__button-secondary--arrow" />
    </Link>
    <div className="docs__cards">
      {TelepresenceCards.map(c => (
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