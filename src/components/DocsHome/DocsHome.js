import React from 'react';

import Code from '../../../../src/assets/images/home/home-code.svg';
import DocsHero from '../../../../src/assets/images/home/home-docs-hero.svg';
import Run from '../../../../src/assets/images/home/home-run.svg';
import Ship from '../../../../src/assets/images/home/home-ship.svg';
import Button from '../../../../src/components/Button';
import {
  goToDocsTelepresence,
  goToDocsArgo,
  goToEdgeStackDocs
} from '../../../../src/utils/routes';

import './styles.less';

const Product = ({
  image,
  title,
  description,
  getStarted,
  buttonTitle = 'GET STARTED',
}) => (
  <div className="product__container">
    <div className="product__container-wrapper">
      <img className="product__container-image" src={image} alt={title} loading='lazy' />
      <h2 className="product__container-title">{title}</h2>
      <p className="product__container-description">{description}</p>
    </div>
    <Button
      className="product__container-button"
      size="m"
      color="ctaPurple"
      to={getStarted}
    >
      {buttonTitle}
    </Button>
  </div>
);

const DocsHome = () => {
  return (
    <div className="docs__container-homePage">
      <div className="docs__hero">
        <div className="docs__hero-text">
          <h1 className="docs__hero--title">Documentation</h1>
          <span className="docs__hero--description">
           For every stage of your Kubernetes development loop, 
           Ambassador Labs has the cloud-native tools to ensure 
           your team’s success. Explore our documentation to find 
           out more about our products and learn how Ambassador 
           Labs can simplify your workflow and safeguard your services.
          </span>
        </div>
        <img className="docs__hero-img" src={DocsHero} alt="hero" loading='lazy' />
      </div>
      <hr className="docs__separator docs__container docs__homePage-separator" />
      <div className="docs__home-product">
        <Product
          title={'Telepresence'}
          description={
            'With Telepresence, you can easily build and ship code. Telepresence enables you to configure and maintain development and testing environments without impacting performance.'
          }
          image={Code}
          getStarted={goToDocsTelepresence}
          buttonTitle="Telepresence documentation"
        />
        <Product
          title={'Argo'}
          description={
            'With Argo, you can release updates cleanly and monitor your rollouts as you do. Create canary releases of new versions of a service easily with the option to safely rollback changes when necessarily.'
          }
          image={Ship}
          getStarted={goToDocsArgo}
          buttonTitle="Argo documentation"
        />
        <Product
          title={'Edge Stack'}
          description={
            'In a fast-paced development environment, it is essential to keep services running 24/7. Mitigate issues, monitor updates, and maintain complete control over protecting your services with Edge Stack.'
          }
          image={Run}
          getStarted={goToEdgeStackDocs}
          buttonTitle="Edge Stack documentation"
        />
      </div>
    </div>
  );
};

export default DocsHome;
