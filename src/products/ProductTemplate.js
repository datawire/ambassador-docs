import React from 'react';

const Card = ({ img, title, description }) => (
  <div className="docs__quickStart-card">
    <img src={img} className="docs__quickStart-card--img" />
    <h2 className="docs__quickStart-card--title">{title}</h2>
    <p className="docs__quickStart-card--description">{description}</p>
  </div>
);

const ProductTemplate = ({
  titleFirstWord,
  titleRest,
  heroDescription,
  heroImg,
  overview,
  cards,
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
          <img className="docs__quickStart-img" src={heroImg} />
        </div>
      </div>
      <hr className="docs__separator docs__quickStart-separator" />
      <p className="docs__quickStart-overview">{overview}</p>
      <div className="docs__quickStart-cards">
        {cards.map((card) => (
          <Card
            title={card.title}
            img={card.img}
            description={card.description}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductTemplate;
