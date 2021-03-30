import React from 'react';
import { Link } from 'gatsby';

import AmbassadorCloud from '../images/ambassador-cloud.inline.svg';
import RightArrow from '../images/right-arrow.inline.svg';
import TelepresenceIcon from '../images/telepresence-icon.inline.svg';
import EdgeStackIcon from '../images/edge-stack-icon.inline.svg';
import {
    goToGetAmbassador, goToTelepresenceDocs, goToTutorialsGettingStarted, goToTelepresenceHowTo,
    goToTelepresenceEnv, goToTelepresenceOutbound, goToMappings, goToOauth, goToRateLimits
} from '../../../src/utils/routes';

const DocsHome = () => (
    <>
        <section className="docs__started docs__container">
            <h2 className="docs__heading-primary">Documentation</h2>
            <p className="docs__text-primary">Concepts, guides, and examples to using Ambassador.</p>
            <div className="docs__info">
                <div className="docs__info--first">
                    <span className="docs__heading-secondary">Ambassador Cloud</span>
                    <p>Adopt an integrated workflow for quickly coding, testing, and releasing microservices on Kubernetes.</p>
                    <Link to={goToGetAmbassador} className="docs__button-secondary">
                        Get Started <RightArrow className="docs__button-secondary--arrow" />
                    </Link>
                </div>
                <div className="docs__info--second">
                    <AmbassadorCloud className="docs__ambassador-cloud-image" />
                </div>
            </div>
        </section>

        <hr className="docs__separator docs__container" />

        <section className="docs__container">
            <span className="docs__heading-secondary">Explore Ambassador Products</span>
            <div className="docs__cards">
                <div className="docs__card">
                    <div className="docs__card--heading">
                        <TelepresenceIcon />
                        Telepresence
                    </div>
                    <p>Code and test microservices locally against a remote Kubernetes cluster.</p>
                    <Link to={goToTelepresenceDocs} className="docs__button-tertiary">Get Started <RightArrow className="docs__button-tertiary--arrow" /></Link>
                    <hr className="docs__card--separator" />
                    <span className="docs__heading-tertiary">Popular Tutorials</span>
                    <ul className="docs__popular-list">
                        <li><Link to={goToTelepresenceHowTo}>Collaborating with Preview URLs</Link></li>
                        <li><Link to={goToTelepresenceEnv}>Importing Environment Variables</Link></li>
                        <li><Link to={goToTelepresenceOutbound}>Outbound Sessions</Link></li>
                    </ul>
                </div>
                <div className="docs__card">
                    <div className="docs__card--heading">
                        <EdgeStackIcon />
                        Edge Stack
                    </div>
                    <p>Route and secure traffic to your cluster with a Kubernetes-native API Gateway.</p>
                    <Link to={goToTutorialsGettingStarted} className="docs__button-tertiary">Get Started <RightArrow className="docs__button-tertiary--arrow" /></Link>
                    <hr className="docs__card--separator" />
                    <span className="docs__heading-tertiary">Popular Tutorials</span>
                    <ul className="docs__popular-list">
                        <li><Link to={goToMappings}>Intro to Mappings</Link></li>
                        <li><Link to={goToOauth}>Single Sign-On Authentication</Link></li>
                        <li><Link to={goToRateLimits}>Rate Limiting</Link></li>
                    </ul>
                </div>
            </div>
        </section>
    </>
);

export default DocsHome;