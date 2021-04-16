import React from 'react';
import { Link } from 'gatsby';

import Icon from '../../../src/components/Icon';
import Card from '../../../src/components/Card';
import { ArgoCards } from './config';
import { goToArgoQuickStart } from '../../../src/utils/routes';

const Argo = () => (
  <section className="docs__container product-page">
    <h2 className="docs__heading-primary docs__heading-primary--aligned">
      <Icon name="argo" className="docs__argo-icon" /> Argo
    </h2>
    <p>Safely deploy code changes to production.</p>
    <Link to={goToArgoQuickStart} className="docs__button-secondary docs__m-bottom-50">
      Get Started <Icon name="right-arrow" className="docs__button-secondary--arrow" />
    </Link>
    <div className="docs__cards">
      {ArgoCards.map(c => (
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

export default Argo;