import React from 'react';

import Argo from '../../../../src/assets/images/home/home-argo.svg';
import Code from '../../../../src/assets/images/home/home-code.svg';
import DocsHero from '../../../../src/assets/images/home/home-docs-hero.svg';
import EdgeStack from '../../../../src/assets/images/home/home-edge-stack.svg';
import Run from '../../../../src/assets/images/home/home-run.svg';
import Ship from '../../../../src/assets/images/home/home-ship.svg';
import Telepresence from '../../../../src/assets/images/home/home-telepresence.svg';
import Button from '../../../../src/components/Button';

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
  <div>
    <img scr={image} />
    <h2>{title}</h2>
    <p>{description}</p>
    <Button to={getStarted}>GET STARTED</Button>
    <hr className="docs__separator docs__container docs__container-home" />
    <h2>Ambassador Products</h2>
    <div>
      <img src={docImage} />
      <a href={docLink}>{docDescription}</a>
    </div>
  </div>
);

const DocsHome = () => {
  return (
    <div className="docs__container-home">
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
        <img className="docs__hero-img" src={DocsHero} alt="hero" />
      </div>
      <hr className="docs__separator docs__container docs__container-home" />
      <div>
        <div>
          <span>
            This guide provides an overview of the key ideas behind
            Telepresence, as well as the instructions you need to get
            Telepresence up and running in your environment quickly.
          </span>
        </div>
        <div>
          <Product
            title={'Code with Telepresence'}
            description={
              'With Telepresence, you can easily build and ship code. Telepresence enables you to configure and maintain development and testing environments without impacting performance.'
            }
            image={Code}
            getStarted={'https://www.google.com/'}
            docDescription={'Advanced Telepresence documentation'}
            docImage={Telepresence}
          />
          <Product
            title={'Ship with Argo'}
            description={
              'With Argo, you can release updates cleanly and monitor your rollouts as you do. Create canary releases of new versions of a service easily with the option to safely rollback changes when necessarily.'
            }
            image={Ship}
            getStarted={'https://www.google.com/'}
            docDescription={'Advanced Argo documentation'}
            docImage={Argo}
          />
          <Product
            title={'Run with Edge Stack'}
            description={
              'In a fast-paced development environment, it is essential to keep services running 24/7. Mitigate issues, monitor updates, and maintain complete control over protecting your services with Edge Stack.'
            }
            image={Run}
            getStarted={'https://www.google.com/'}
            docDescription={'Advanced Edge Stack documentation'}
            docImage={EdgeStack}
          />
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default DocsHome;
