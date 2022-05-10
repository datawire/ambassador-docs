import React from 'react';

import ArgoDocsImg from '../../../src/assets/images/ship/Argo_Doc.svg';
import ArgoOverviewImg from '../../../src/assets/images/ship/Argo_Overview.svg';
import ShipQuickstartImg from '../../../src/assets/images/ship/Quick_Start_Ship.svg';
import ShipHeroImg from '../../../src/assets/images/ship/Ship_Hero.svg';
import {
  goToShipDocsQuickStart,
  goToShipDocsOverview,
  goToShipDocsAdvancedDocs,
} from '../../../src/utils/routes';

import ProductTemplate from './ProductTemplate';

const props = {
  heroDescription:
    'With Ambassador Labs’ Argo, you can ship your products and monitor your rollouts easily. Argo’s event-driven workflow automation takes the pain out of deployments with advanced metrics for rollouts, and the ability to seamlessly rollback deployments if any issues arise.',
  titleFirstWord: 'Ship',
  titleRest: 'with Argo',
  heroImg: ShipHeroImg,
  heroImgDescription: 'Ship your products and monitor your rollouts easily',
  overview:
    'This guide provides an overview of the key ideas behind Argo, as well as the instructions you need to get Argo up and running in your environment quickly.',
  getStartedLink: goToShipDocsQuickStart,
  cards: [
    {
      title: 'Quick start guide',
      img: ShipQuickstartImg,
      description:
        'Visit the quick start guide to create a basic rollout in a demo environment.',
      link: goToShipDocsQuickStart,
    },
    {
      title: 'Argo overview',
      img: ArgoOverviewImg,
      description:
        'Run through the installation guide and get Argo up and running in your own environment.',
      link: goToShipDocsOverview,
    },
    {
      title: 'Advanced Argo documentation',
      img: ArgoDocsImg,
      description:
        'View the full user guide to learn advanced techniques to further tailor Argo to your needs.',
      link: goToShipDocsAdvancedDocs,
    },
  ],
};

const Ship = () => <ProductTemplate {...props} />;

export default Ship;
