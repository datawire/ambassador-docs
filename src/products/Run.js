import React from 'react';

import EdgeStackDocsImg from '../../../src/assets/images/run/Edge_Stack_Doc.svg';
import EdgeStackOverviewImg from '../../../src/assets/images/run/Edge_Stack_Overview.svg';
import RunQuickstartImg from '../../../src/assets/images/run/Quick_Start_Run.svg';
import RunHeroImg from '../../../src/assets/images/run/Run_Hero.svg';
import {
  goToRunDocs,
  goToRunDocsQuickStart,
  goToRunDocsOverview,
  goToRunDocsAdvancedDocs,
} from '../../../src/utils/routes';

import ProductTemplate from './ProductTemplate';

const props = {
  heroDescription:
    'Edge Stack is a powerful asset that keeps you in control of how you run your Kubernetes services. Advanced traffic management capabilities such as load balancing, rate limiting, and circuit breaking are key to ensure the availability and scalability of your microservices. Edge Stack makes is possible able to manage and respond quickly to production incidents in your workflow.',
  titleFirstWord: 'Run',
  titleRest: 'with Edge Stack',
  heroImg: RunHeroImg,
  heroImgDescription: 'Keeps you in control of how you run your Kubernetes services',
  overview:
    'This guide provides an overview of the key ideas that Edge Stack is built to solve.',
  getStartedLink: goToRunDocsQuickStart,
  cards: [
    {
      title: 'Quick start guide',
      img: RunQuickstartImg,
      description:
        'Here you can find all the basic information you need to install Edge Stack in your environment.',
      link: goToRunDocsQuickStart,
    },
    {
      title: 'Edge Stack overview',
      img: EdgeStackOverviewImg,
      description:
        'Find out how to install Edge Stack and see how it can help you manage routing, load balancing, rate limiting, and authentication if your Kubernetes environment.',
      link: goToRunDocsOverview,
    },
    {
      title: 'Advanced Edge Stack documentation',
      img: EdgeStackDocsImg,
      description:
        'View the full user guide to learn advanced techniques for maximizing Edge Stack’s capabilities for your needs.',
      link: goToRunDocsAdvancedDocs,
    },
  ],
};

const Run = () => <ProductTemplate {...props} />;

export default Run;
