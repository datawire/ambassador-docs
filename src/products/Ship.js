import React from 'react';

import ShipHero from '../../../src/assets/images/ship/ship_Hero.svg';
import ShipDocTele from '../../../src/assets/images/ship/ship_doc_tele.svg';
import ShipQuickStart from '../../../src/assets/images/ship/ship_quick_start_hero.svg';
import ShipTele from '../../../src/assets/images/ship/ship_tele.svg';

import ProductTemplate from './ProductTemplate';

const props = {
  heroDescription:
    'With Ambassador Labs’ Argo, you can ship your products and monitor your rollouts easily. Argo’s event-driven workflow automation takes the pain out of deployments with advanced metrics for rollouts, and the ability to seamlessly rollback deployments if any issues arise.',
  titleFirstWord: 'Ship',
  titleRest: 'with Argo',
  heroImg: ShipHero,
  overview:
    'This guide provides an overview of the key ideas behind Argo, as well as the instructions you need to get Argo up and running in your environment quickly.',
  cards: [
    {
      title: 'Quick start guide',
      img: ShipQuickStart,
      description:
        'Visit the quick start guide to create a basic rollout in a demo environment.',
    },
    {
      title: 'Argo overview',
      img: ShipTele,
      description:
        'Run through the installation guide and get Argo up and running in your own environment.',
    },
    {
      title: 'Advanced Argo documentation',
      img: ShipDocTele,
      description:
        'View the full user guide to learn advanced techniques to further tailor Argo to your needs.',
    },
  ],
};

const Ship = () => <ProductTemplate {...props} />;

export default Ship;
