import { Link } from 'gatsby';
import React from 'react';

import ArgoImage from '../../../src/assets/images/argo.svg';
import Card from '../../../src/components/Card';
import Icon from '../../../src/components/Icon';
import { goToArgoQuickStart } from '../../../src/utils/routes';

import { ArgoCards } from './config';

const Argo = () => (
  <section className="docs__container product-page">
    <h1 className="docs__heading-primary docs__heading-primary--aligned">
      <img
        src={ArgoImage}
        className="docs__argo-icon"
        alt="Argo"
        width="197"
        height="250"
        loading='lazy'
      />{' '}
      Argo
    </h1>
    <p>Safely deploy code changes to production.</p>
    <Link
      to={goToArgoQuickStart}
      className="docs__button-secondary docs__m-bottom-50"
    >
      Get Started{' '}
      <Icon name="right-arrow" className="docs__button-secondary--arrow" />
    </Link>
    <div className="docs__cards">
      {ArgoCards.map((c) => (
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
