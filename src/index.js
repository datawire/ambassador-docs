import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { graphql, Link, navigate } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

import Layout from '../../src/components/Layout';
import template from '../../src/utils/template';
import Search from './images/search.inline.svg';
import { products, metaData, learningJourneys, archivedVersionsLink, siteUrl } from './config';
import DocsHome from './components/DocsHome';
import Dropdown from '../../src/components/Dropdown';
import DocsFooter from './components/DocsFooter';
import isAesPage from './utils/isAesPage';
import getPrevNext from './utils/getPrevNext';
import Argo from './products/Argo';
import Cloud from './products/Cloud';
import EdgeStack from './products/EdgeStack';
import Emissary from './products/Emissary';
import Telepresence from './products/Telepresence';
import Kubernetes from './products/Kubernetes';
import AllVersions from './components/AllVersions';
import ContactBlock from '../../src/components/ContactBlock';
import ReadingTime from '../../src/components/ReadingTime';
import Icon from '../../src/components/Icon';
import LearningJourneyImg from './images/learning-journe-prev-next.svg';
import SidebarContent from './components/SidebarContent';
import ContentTable from "./components/ContentTable";
import './style.less';

export default ({ data, location }) => {

    const page = data.mdx || {};
    const slug = page.fields.slug.split('/');
    const isHome = page.fields.slug === '/docs/';
    const initialProduct = isHome
        ? products[0]
        : products.filter((p) => p.slug === slug[2])[0] || products[0];
    const isArchivedVersions = slug[3] === archivedVersionsLink.link;
    const tempVersion = isHome || isArchivedVersions
        ? {}
        : initialProduct.version.filter((v) => v.id === slug[3])[0] || {};
    const isProduct = initialProduct.slug !== products[0].slug;
    const isProductHome = isProduct && !isArchivedVersions && !!!tempVersion.id;
    const canonicalUrl = isHome
        ? 'https://www.getambassador.io/docs/'
        : `https://www.getambassador.io/docs/${slug[2]}/latest/${slug
            .slice(4)
            .join('/')}`;

    const initialVersion = !isProductHome ? tempVersion : initialProduct.version.filter(v => v.id === "latest")[0];
    function createEdgissaryDevPrevMsg(newVer, newProduct) {
      if ((newVer.id === "2.0" || newVer.id === "pre-release") || (newProduct.slug !== "emissary" && newProduct.slug !== "edge-stack")) {
        return "";
      }
      return <a href={`/docs/${newProduct.slug}/2.0/tutorials/getting-started/`}>{`${newProduct.name} 2.0 is now available for Developer Preview!`}</a>;

    }
    const initialEdgissaryDPNotificationMsg = createEdgissaryDevPrevMsg(initialVersion, initialProduct);

    const learningJourneyName = new URLSearchParams(location.search).get('learning-journey');
    const learningPath = learningJourneyName ? `?learning-journey=${learningJourneyName}` : '';
    const isInLearnings = learningJourneys.includes(learningJourneyName);
    const learningJourneyData = isInLearnings ? data.allLearningjourney.nodes.filter(node => node.slug.indexOf('/') > -1 && node.slug.indexOf('.') > -1 && node.slug.split('/')[1].split('.')[0] === learningJourneyName) : [];
    const { title: learningTitle, description: learningDescription, readingTime: learningReadingTime, topics } = isInLearnings ? JSON.parse(learningJourneyData[0].content)[0] : {};
    const { previous: prevLearning, next: nextLearning, isInTopics } = isInLearnings ? getPrevNext(topics, page.fields.slug) : {};
    const isLearning = isInLearnings && isInTopics;
    const learningParseTopics = isLearning ? topics.map(topic => {
        const items = topic.items.map(item => {
            const readingTimeTopic = data.allMdx.edges.filter(i => i.node.fields.slug === `/docs/${item.link}`);
            const { slug, readingTime } = readingTimeTopic[0] ? readingTimeTopic[0].node.fields : {};
            const { reading_time_text, hide_reading_time, reading_time } = readingTimeTopic[0] ? readingTimeTopic[0].node.frontmatter : {};
            return {
                ...item,
                slug,
                readingTimeMinutes: Math.ceil(readingTime ? readingTime.minutes : 0),
                readingTimeText: reading_time_text,
                hideReadingTime: hide_reading_time,
                readingTimeFront: reading_time
            }
        });

        return {
            ...topic,
            items
        }
    }) : [];

    const [product, setProduct] = useState(initialProduct);
    const [version, setVersion] = useState(initialVersion);
    const [showVersion, setShowVersion] = useState(!isHome && isProduct && !isProductHome && !isArchivedVersions);
    const [versionList, setVersionList] = useState(initialProduct.version);
    const [showAesPage, setShowAesPage] = useState(false);
    const [edgissaryDPMessage, setEdgissaryDPMessage] = useState(initialEdgissaryDPNotificationMsg);
    const isMobile = useMemo(() => {
        return typeof window !== 'undefined' ? window.innerWidth <= 800 : true
    }, []);

    useEffect(() => {
      const loadJS = () => {
        if (!isMobile) {
          if (window.docsearch) {
            window.docsearch({
              apiKey: '8f887d5b28fbb0aeb4b98fd3c4350cbd',
              indexName: 'getambassador',
              inputSelector: '#doc-search',
              debug: true,
            });
          } else {
            setTimeout(() => {
              loadJS();
            }, 500);
          }
        }
      };
      loadJS();
      isAesPage(initialProduct.slug, slug, initialVersion.id).then(result => setShowAesPage(result))
    }, [initialProduct.slug, initialVersion.id, isMobile, slug]);

    const versions = useMemo(() => {
        if (!data.versions?.content) {
            return {};
        }
        const versions = data.versions?.content;
        return JSON.parse(versions);
    }, [data.versions]);

    const menuLinks = useMemo(() => {
        if (!data.linkentries?.content) {
            return [];
        }
        return JSON.parse(template(data.linkentries?.content, versions));
    }, [data.linkentries, versions]);

    const metadata = useMemo(() => {
        let metaDescription;
        let metaTitle;
        if (isHome) {
            metaTitle = metaData['home'].title;
            metaDescription = metaData['home'].description;
        } else if (isProductHome) {
            metaTitle = metaData[initialProduct.slug].title;
            metaDescription = metaData[initialProduct.slug].description;
        } else {
            metaTitle = (page.headings && page.headings[0] ? page.headings[0].value : 'Docs') + ' | Ambassador';
            metaDescription = page.frontmatter && page.frontmatter.description ? page.frontmatter.description : page.excerpt;
        }
        return {
            metaDescription: template(metaDescription, versions), metaTitle: template(metaTitle, versions)
        };
    }, [isHome, isProductHome, versions, initialProduct.slug, page.headings, page.frontmatter, page.excerpt]);

    const claenStorage = () => sessionStorage.removeItem('expandedItems');

    const handleProductChange = (e, name = null) => {
        const value = name ? name : e.target.value;
        const selectedProduct = products.filter((p) => p.slug === value)[0];
        setProduct(selectedProduct);
        setShowVersion(false);
        if (selectedProduct.slug === 'home') {
            navigate(`/docs/`);
            return;
        }
        setVersionList(selectedProduct.version);
        const newVersion = selectedProduct.version.filter(v => v.id === "latest")[0] || selectedProduct.version[0];
        setVersion(newVersion);
        const newEdgissaryAnnouncement = createEdgissaryDevPrevMsg(newVersion, selectedProduct);
        setEdgissaryDPMessage(newEdgissaryAnnouncement);
        navigate(selectedProduct.link);
    };

    const handleVersionChange = useCallback(async (e, value = null) => {
        const path = version.archived ? siteUrl : '';
        if (value === archivedVersionsLink.id) {
            navigate(`${path}/docs/${product.slug}/${archivedVersionsLink.link}`);
            return;
        }

        const newValue = value ? value : e.target.value;
        const newVersion = versionList.filter((v) => v.id === newValue)[0];
        setVersion(newVersion);
        const slugPath = slug.slice(4).join('/') || '';
        const newEdgissaryAnnouncement = createEdgissaryDevPrevMsg(newVersion, product);
        setEdgissaryDPMessage(newEdgissaryAnnouncement);

        const newVersionLinksContent = (await import(`../docs/${product.slug}/${newVersion.id}/doc-links.yml`)).default;
        const links = [];

        function createArrayLinks(el) {
            el.forEach(i => {
                i.link && links.push(i.link.replace(/\//g, ''));
                i.items && createArrayLinks(i.items);
            });
        }

        createArrayLinks(newVersionLinksContent);

        claenStorage();

        if (links.includes(slugPath.replace(/\//g, ''))) {
            navigate(`${path}/docs/${product.slug}/${newVersion.id}/${slugPath}`);
        } else {
            navigate(`${path}/docs/${product.slug}/${newVersion.link}/`);
        }
    }, [product, slug, version.archived, versionList]);


    const getProductHome = (product) => {
        switch (product) {
            case 'edge-stack':
                return <EdgeStack />;
            case 'emissary':
                return <Emissary />;
            case 'telepresence':
                return <Telepresence />;
            case 'cloud':
                return <Cloud />;
            case 'argo':
                return <Argo />;
            case 'kubernetes':
                return <Kubernetes />;
            default:
                return <EdgeStack />;
        }
    }

    const MainContainer = ({children}) =>(
        <div className="docs__container-doc">
            <SidebarContent
                title={learningTitle}
                description={learningDescription}
                readingTime={learningReadingTime}
                sidebarTopicList={learningParseTopics}
                path={learningPath}
                onVersionChanged={handleVersionChange}
                version={version}
                versionList={versionList}
                topicList={menuLinks}
                slug={page.fields.slug}
                location={location}
                isInTopics={isInTopics}
                isLearning={isLearning}
                />
                <div className="docs__doc-body-container">
                    <div className="docs__doc-body-container__article">
                        <div className="docs__doc-body-container__article flex-toc">
                            {children}
                        </div>
                        <div className="docs__doc-body-container__article docs__doc-body-container__article-toc">
                            { page?.contentTable?.items &&  page.contentTable.items[0].items?.length > 1 &&
                            <div className="docs__doc-body-container__table-content">
                                <p>ON THIS PAGE</p>
                                <ContentTable items={page.contentTable.items} versions={versions}/>
                            </div>
                            }   
                        </div>
                    </div>
                    <div className="docs__doc-body-container__article-footer">
                        {footer}
                    </div>
                </div>
        </div>
    )

    const footer = (
        <div>
            <section className="docs__contact docs__container">
                <hr className="docs__separator" />
                <ContactBlock />
            </section>
            {!isHome && !isProductHome && isProduct && (
                <DocsFooter page={page} product={product.slug} version={versions.docsVersion} />
            )}
        </div>
    );

    const content = useMemo(() => {
        if (isHome) {
            return <>
                <DocsHome />
                {footer}
            </>
        } else if (isProductHome) {
            return <MainContainer>
                    {getProductHome(initialProduct.slug)}
                </MainContainer>;
        } else if (isArchivedVersions) {
            return <AllVersions product={initialProduct} />
        }
        return <MainContainer>
                <div className="docs__doc-body doc-body">
                            <div className="doc-tags">
                                {showAesPage && (
                                    <Link className="doc-tag aes" to="/editions">
                                        Ambassador Edge Stack
                                    </Link>
                                )}
                            </div>
                            <ReadingTime
                                slug={page.fields.slug}
                                hideReadingTime={page.frontmatter.hide_reading_time}
                                readingTimeMinutes={page.fields.readingTime.minutes}
                                readingTimeFront={page.frontmatter.reading_time}
                                readingTimeText={page.frontmatter.reading_time_text}
                                itemClassName="docs__reading-time"
                            />
                            <MDXRenderer slug={page.fields.slug} readingTime={page.fields.readingTime.minutes}>
                                {template(page.body, versions)}
                            </MDXRenderer>
                            {isLearning && (
                                <div className="docs__next-previous">
                                    <span className="docs__next-previous__title">Continue your learning journey</span>
                                    <div className="docs__next-previous__content">
                                        <div className="docs__next-previous__previous">
                                            {prevLearning &&
                                                <>
                                                    <Link to={`/docs/${prevLearning.link}${learningPath}`} className="docs__next-previous__button"><Icon name="right-arrow" /> Previous</Link>
                                                    <span className="docs__next-previous__text">{prevLearning.title}</span>
                                                </>
                                            }
                                        </div>
                                        <div className="docs__next-previous__learning-journey">
                                            <img src={LearningJourneyImg} alt="Learning Journey" />
                                        </div>
                                        <div className="docs__next-previous__next">
                                            {nextLearning &&
                                                <>
                                                    <Link to={`/docs/${nextLearning.link}${learningPath}`} className="docs__next-previous__button">Next <Icon name="right-arrow" /></Link>
                                                    <span className="docs__next-previous__text">{nextLearning.title}</span>
                                                </>
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                </MainContainer>;
    }, [footer, initialProduct, isArchivedVersions, isHome, isLearning, isProductHome, learningPath, nextLearning, page.body, page.fields.readingTime.minutes, page.fields.slug, page.frontmatter.hide_reading_time, page.frontmatter.reading_time, page.frontmatter.reading_time_text, prevLearning, showAesPage, versions]);

    return (
        <Layout location={location} customAnnouncement={edgissaryDPMessage}>
            <Helmet>
                <title>{metadata.metaTitle}</title>
                <meta name="og:title" content={metadata.metaTitle} />
                <meta name="og:type" content="article" />
                <link rel="canonical" href={canonicalUrl} />
                <meta name="description" content={metadata.metaDescription} />
                {!isMobile &&
                    <link
                        rel="stylesheet"
                        href="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.css" type="text/css" media="all"
                    />}
                {!isMobile && <script defer src="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.js"></script>}
            </Helmet>
            <div className="docs">
                <nav>
                    <div className="docs__nav">
                        <div className="docs__links-content docs__dekstop">
                            <ul className="docs__products-list">
                                {products.map((item) => {
                                    const linkContent = version.archived ? <a href={`${siteUrl}${item.link}`}>{item.name}</a> : <Link to={item.link}>{item.name}</Link>;
                                    return (
                                        <li
                                            className={`${product.slug === item.slug ? 'docs__selected' : ''
                                                }`}
                                            key={item.name}
                                            onClick={claenStorage}
                                        >
                                            {linkContent}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div
                            className={`docs__dropdown-container docs__mobile${showVersion && versionList.length > 1 ? ' docs__dropdown-version' : ''
                                }`}
                        >
                            <Dropdown
                                label={product.name}
                                handleOnChange={handleProductChange}
                                value={product.slug}
                                options={products.map((i) => ({ id: i.slug, name: i.name }))}
                            />
                            {showVersion && versionList.length > 1 && (
                                <Dropdown
                                    label={`Version: ${version.name}`}
                                    handleOnChange={handleVersionChange}
                                    value={version.id}
                                    options={versionList.filter(v => !v.archived)}
                                />
                            )}
                        </div>
                        <div className="docs__search-box">
                            <Search />
                            <input
                                name="search"
                                type="text"
                                placeholder="Search documentation"
                                id="doc-search"
                            />
                        </div>
                    </div>
                </nav>
                <div className="docs__body">
                    {content}
                </div>
            </div>
        </Layout >
    );
};

export const query = graphql`
  query($linksslug: String, $slug: String!, $learningSlugs: [String]) {
    mdx(fields: { slug: { eq: $slug } }) {
      body
      fields {
        slug
        linksslug
        readingTime {
            minutes
        }
      }
      excerpt(pruneLength: 150, truncate: true)
      headings(depth: h1) {
        value
      }
      contentTable: tableOfContents
      frontmatter {
        description
        reading_time
        hide_reading_time
        reading_time_text
      }
      parent {
        ... on File {
          relativePath
        }
      }
    }
    linkentries(slug: { eq: $linksslug }) {
      id
      content
    }
    versions(slug: { eq: $linksslug }) {
      id
      content
    }
    allLearningjourney {
        nodes {
          content
          slug
        }
    }
    allMdx ( filter: { fields: { slug: { in:  $learningSlugs } } }) {
        edges {
          node {
            fields {
              slug,
              readingTime {
                minutes
              }
            }
            frontmatter {
              reading_time
              hide_reading_time
              reading_time_text
            }
          }
        }
    }
  }
`;
