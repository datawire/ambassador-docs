import React from 'react';

import RunHero from '../../../src/assets/images/run/run_Hero.svg';
import RunDocTele from '../../../src/assets/images/run/run_doc_tele.svg';
import RunQuickStart from '../../../src/assets/images/run/run_quick_start_hero.svg';
import RunTele from '../../../src/assets/images/run/run_tele.svg';

import ProductTemplate from './ProductTemplate';

const props = {
  heroDescription:
    'Edge Stack is a powerful asset that keeps you in control of how you run your Kubernetes services. Advanced traffic management capabilities such as load balancing, rate limiting, and circuit breaking are key to ensure the availability and scalability of your microservices. Edge Stack makes is possible able to manage and respond quickly to production incidents in your workflow.',
  titleFirstWord: 'Run',
  titleRest: 'with Edge Stack',
  heroImg: RunHero,
  overview:
    'This guide provides an overview of the key ideas that Edge Stack is built to solve.',
  cards: [
    {
      title: 'Quick start guide',
      img: RunQuickStart,
      description:
        'Here you can find all the basic information you need to install Edge Stack in your environment.',
    },
    {
      title: 'Edge Stack overview',
      img: RunTele,
      description:
        'Find out how to install Edge Stack and see how it can help you manage routing, load balancing, rate limiting, and authentication if your Kubernetes environment.',
    },
    {
      title: 'Advanced Edge Stack documentation',
      img: RunDocTele,
      description:
        'View the full user guide to learn advanced techniques for maximizing Edge Stack’s capabilities for your needs.',
    },
  ],
};

const Run = () => <ProductTemplate {...props} />;

export default Run;
