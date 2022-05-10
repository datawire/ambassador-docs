import React from 'react';

import CodeHeroImg from '../../../src/assets/images/code/Code_Hero.svg';
import CodeQuickstartImg from '../../../src/assets/images/code/Quick_Start_Code.svg';
import TelepresenceDocsImg from '../../../src/assets/images/code/Telepresence_Doc.svg';
import TelepresenceOverviewImg from '../../../src/assets/images/code/Telepresence_Overview.svg';
import {
  goToCodeDocsQuickStart,
  goToCodeDocsOverview,
  goToCodeDocsAdvancedDocs,
} from '../../../src/utils/routes';

import ProductTemplate from './ProductTemplate';

const props = {
  heroDescription:
    'Ambassador Labs helps make it easier to code with Telepresence. Set up your ideal development environment for Kubernetes in seconds with Telepresence. Use Telepresence’s intercepts and make continuous integration and team collaboration an easy and efficient part of your Kubernetes coding process.',
  titleFirstWord: 'Code',
  titleRest: 'with Telepresence',
  heroImg: CodeHeroImg,
  heroImgDescription: 'Code easy and efficient',
  overview:
    ' This guide provides an overview of the key ideas behind Telepresence, as well as the instructions you need to get Telepresence up and running in your environment quickly.',
  getStartedLink: goToCodeDocsQuickStart,
  cards: [
    {
      title: 'Quick start guide',
      img: CodeQuickstartImg,
      description:
        'Visit the quick start guide to see how easily Telepresence works in a demo environment.',
      link: goToCodeDocsQuickStart,
    },
    {
      title: 'Telepresence overview',
      img: TelepresenceOverviewImg,
      description:
        'Run through the installation guide and create an intercept in your own environment to share with coworkers to see how easy coding collaboration is with Telepresence as a foundation to your Kubernetes development cycle.',
      link: goToCodeDocsOverview,
    },
    {
      title: 'Advanced Telepresence documentation',
      img: TelepresenceDocsImg,
      description:
        'View the full user guide to learn advanced techniques to make your continuous integration even more powerful.',
      link: goToCodeDocsAdvancedDocs,
    },
  ],
};

const Code = () => <ProductTemplate {...props} />;

export default Code;
