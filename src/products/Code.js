import React from 'react';

import CodeHero from '../../../src/assets/images/code/code_Hero.svg';
import CodeDocTele from '../../../src/assets/images/code/code_doc_tele.svg';
import CodeQuickStart from '../../../src/assets/images/code/code_quick_start_hero.svg';
import CodeTele from '../../../src/assets/images/code/code_tele.svg';

import ProductTemplate from './ProductTemplate';

const props = {
  heroDescription:
    'Ambassador Labs helps make it easier to code with Telepresence. Set up your ideal development environment for Kubernetes in seconds with Telepresence. Use Telepresence’s intercepts and make continuous integration and team collaboration an easy and efficient part of your Kubernetes coding process.',
  titleFirstWord: 'Code',
  titleRest: 'with Telepresence',
  heroImg: CodeHero,
  overview:
    ' This guide provides an overview of the key ideas behind Telepresence, as well as the instructions you need to get Telepresence up and running in your environment quickly.',
  cards: [
    {
      title: 'Quick start guide',
      img: CodeQuickStart,
      description:
        'Visit the quick start guide to see how easily Telepresence works in a demo environment.',
    },
    {
      title: 'Telepresence overview',
      img: CodeTele,
      description:
        'Run through the installation guide and create an intercept in your own environment to share with coworkers to see how easy coding collaboration is with Telepresence as a foundation to your Kubernetes development cycle.',
    },
    {
      title: 'Advanced Telepresence documentation',
      img: CodeDocTele,
      description:
        'View the full user guide to learn advanced techniques to make your continuous integration even more powerful.',
    },
  ],
};

const Code = () => <ProductTemplate {...props} />;

export default Code;
