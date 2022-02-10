import React from 'react';

import CodeHero from '../../../src/assets/images/code/code_Hero.svg';
import CodeDocTele from '../../../src/assets/images/code/code_doc_tele.svg';
import CodeQuickStart from '../../../src/assets/images/code/code_quick_start_hero.svg';
import CodeTele from '../../../src/assets/images/code/code_tele.svg';

const Card = ({ img, title, description }) => (
  <div className="docs__quickStart-card">
    <img src={img} className="docs__quickStart-card--img" />
    <h2 className="docs__quickStart-card--title">{title}</h2>
    <p className="docs__quickStart-card--description">{description}</p>
  </div>
);

const Telepresence = () => {
  return (
    <section className="docs__quickStart-container">
      <div className="docs__quickStart-hero">
        <div className="docs__quickStart-text">
          <h1 className="docs__quickStart-title">
            <span className="docs__quickStart-code">Code</span> with
            Telepresence
          </h1>
          <p className="docs__quickStart-description">
            Ambassador Labs helps make it easier to code with Telepresence. Set
            up your ideal development environment for Kubernetes in seconds with
            Telepresence. Use Telepresence’s intercepts and make continuous
            integration and team collaboration an easy and efficient part of
            your Kubernetes coding process.
          </p>
        </div>
        <div className="docs__quickStart-img--container">
          <img className="docs__quickStart-img" src={CodeHero} />
        </div>
      </div>
      <hr className="docs__separator docs__quickStart-separator" />
      <p className="docs__quickStart-overview">
        This guide provides an overview of the key ideas behind Telepresence, as
        well as the instructions you need to get Telepresence up and running in
        your environment quickly.
      </p>
      <div className="docs__quickStart-cards">
        <Card
          title={'Quick start guide'}
          img={CodeQuickStart}
          description={
            'Visit the quick start guide to see how easily Telepresence works in a demo environment.'
          }
        />
        <Card
          title={'Telepresence overview'}
          img={CodeTele}
          description={
            'Run through the installation guide and create an intercept in your own environment to share with coworkers to see how easy coding collaboration is with Telepresence as a foundation to your Kubernetes development cycle.'
          }
        />
        <Card
          title={'Advanced Telepresence documentation'}
          img={CodeDocTele}
          description={
            'View the full user guide to learn advanced techniques to make your continuous integration even more powerful.'
          }
        />
      </div>
    </section>
  );
};

export default Telepresence;
