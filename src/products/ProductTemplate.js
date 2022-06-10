import { Link } from 'gatsby';
import React from 'react';

import Icon from '../../../src/components/Icon';

const Card = ({ img, title, description, link }) => (
  <div className="docs__quickStart-card">
    <img src={img} className="docs__quickStart-card--img" alt={title} />
    <h2 className="docs__quickStart-card--title">
      <a href={link}>{title}</a>
    </h2>
    <p className="docs__quickStart-card--description">{description}</p>
    <div className="docs__quickStart-card--button-get-started">
      <Link to={link} className="docs__button-secondary docs__m-bottom-50">
        Get Started{' '}
        <Icon name="right-arrow" className="docs__button-secondary--arrow" />
      </Link>
    </div>
  </div>
);

const ProductTemplate = ({
  titleFirstWord,
  titleRest,
  heroDescription,
  heroImg,
  heroImgDescription = 'Image description',
  overview,
  cards,
  getStartedLink,
}) => {
  return (
    <section className="docs__quickStart-container">
      <div className="docs__quickStart-hero">
        <div className="docs__quickStart-text">
          <h1 className="docs__quickStart-title">
            <span className={`docs__quickStart-${titleFirstWord}`}>
              {titleFirstWord}
            </span>{' '}
            {titleRest}
          </h1>
          <p className="docs__quickStart-description">{heroDescription}</p>
        </div>
        <div className="docs__quickStart-img--container">
          <img
            className="docs__quickStart-img"
            src={heroImg}
            alt={heroImgDescription}
          />
        </div>
      </div>
      <div className="docs__quickStart-button-get-started">
        <Link
          to={getStartedLink}
          className="docs__button-secondary docs__m-bottom-50"
        >
          Get Started{' '}
          <Icon
            name="right-arrow"
            mask={true}
            className="docs__button-secondary--arrow"
          />
        </Link>
      </div>
      <hr className="docs__separator docs__quickStart-separator" />
      <p className="docs__quickStart-overview">{overview}</p>
      <div className="docs__quickStart-cards">
        {cards.map((card) => (
          <Card
            title={card.title}
            img={card.img}
            description={card.description}
            link={card.link}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductTemplate;
