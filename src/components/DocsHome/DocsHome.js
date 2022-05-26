import React from 'react';

import Argo from '../../../../src/assets/images/home/home-argo.svg';
import Code from '../../../../src/assets/images/home/home-code.svg';
import DocsHero from '../../../../src/assets/images/home/home-docs-hero.svg';
import EdgeStack from '../../../../src/assets/images/home/home-edge-stack.svg';
import Run from '../../../../src/assets/images/home/home-run.svg';
import Ship from '../../../../src/assets/images/home/home-ship.svg';
import Telepresence from '../../../../src/assets/images/home/home-telepresence.svg';
import Button from '../../../../src/components/Button';
import { goToCodeDocs, goToShipDocs, goToRunDocs } from '../../../../src/utils/routes';
import Link from '../../../../src/components/Link';
import { goToDocsTelepresence } from '../../../../src/utils/routes';

import './styles.less';

const Product = ({
  image,
  title,
  description,
  getStarted,
  docDescription,
  docImage,
  docLink,
}) => (
  <div className="product__container">
    <div className="product__container-wrapper">
      <img className="product__container-image" src={image} alt={title} loading='lazy'/>
      <h2 className="product__container-title">{title}</h2>
      <p className="product__container-description">{description}</p>
    </div>
    <Button
      className="product__container-button"
      size="m"
      color="ctaPurple"
      to={getStarted}
    >
      GET STARTED
    </Button>
    <h3 className="product__container-docs--title">Ambassador Products</h3>
    <div className="product__container-docs">
      <img className="product__container-docs--image" src={docImage} alt={docDescription} loading='lazy'/>
      <Link className="product__container-docs--description" to={docLink}>
        {docDescription}
      </Link>
    </div>
  </div>
);

const DocsHome = () => {
  return (
    <div className="docs__container-homePage">
      <div className="docs__hero">
        <div className="docs__hero-text">
          <h1 className="docs__hero--title">Documentation</h1>
          <span className="docs__hero--description">
            Code, ship, run. For modern cloud-native developers, this
            development loop defines the lifecycle of maintaining and growing
            their product. Code new services, ship them to production, and keep
            them running efficiently over time. Ambassador Labs provides a full
            range of products to keep your team on top of the loop.
          </span>
        </div>
        <img className="docs__hero-img" src={DocsHero} alt="hero" loading='lazy'/>
      </div>
      <hr className="docs__separator docs__container docs__homePage-separator" />
      <div className="docs__home-product">
        <Product
          title={'Code with Telepresence'}
          description={
            'With Telepresence, you can easily build and ship code. Telepresence enables you to configure and maintain development and testing environments without impacting performance.'
          }
          image={Code}
          getStarted={goToCodeDocs}
          docDescription={'Advanced Telepresence documentation'}
          docImage={Telepresence}
          docLink={'/docs/telepresence/'}
        />
        <Product
          title={'Ship with Argo'}
          description={
            'With Argo, you can release updates cleanly and monitor your rollouts as you do. Create canary releases of new versions of a service easily with the option to safely rollback changes when necessarily.'
          }
          image={Ship}
          getStarted={goToShipDocs}
          docDescription={'Advanced Argo documentation'}
          docImage={Argo}
          docLink={'/docs/argo/'}
        />
        <Product
          title={'Run with Edge Stack'}
          description={
            'In a fast-paced development environment, it is essential to keep services running 24/7. Mitigate issues, monitor updates, and maintain complete control over protecting your services with Edge Stack.'
          }
          image={Run}
          getStarted={goToRunDocs}
          docDescription={'Advanced Edge Stack documentation'}
          docImage={EdgeStack}
          docLink={'/docs/edge-stack/'}
        />
      </div>
    </div>
  );
};

export default DocsHome;
