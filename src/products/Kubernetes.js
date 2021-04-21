import React from 'react';
import { Link } from 'gatsby';

import Icon from '../../../src/components/Icon';
import Card from '../../../src/components/Card';
import { KubernetesCards } from './config';
import { goToKubernetesQuickStart } from '../../../src/utils/routes';

const Kubernetes = () => (
  <section className="docs__container product-page">
    <h1 className="docs__heading-primary docs__heading-primary--aligned">
      <Icon name="kubernetes" className="docs__kubernetes-icon" /> Kubernetes (K8s)
    </h1>
    <p>Develop and manage your apps productively. <br />Ready to go? Get your code running in K8s today.</p>
    <Link to={goToKubernetesQuickStart} className="docs__button-secondary docs__m-bottom-50">
      Get Started <Icon name="right-arrow" className="docs__button-secondary--arrow" />
    </Link>
    <div className="docs__cards">
      {KubernetesCards.map(c => (
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

export default Kubernetes;