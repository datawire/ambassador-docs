import { graphql, Link, navigate } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import React, { useState, useMemo, useCallback } from 'react';
import url from 'url';

import Layout from '../../src/components/Layout';

import { Breadcrumbs } from '../../src/components/Breadcrumbs/Breadcrumbs';
import Burger from '../../src/components/Burger/Burger';
import ContactBlock from '../../src/components/ContactBlock';
import DatawireMetaData from '../../src/components/DatawireMetaData';
import Dropdown from '../../src/components/Dropdown';
import Icon from '../../src/components/Icon';
import ReadingTime from '../../src/components/ReadingTime';
import SEO from '../../src/components/SEO/SEO';
import template from '../../src/utils/template';

import AllVersions from './components/AllVersions';
import ContentTable from './components/ContentTable';
import DocsFooter from './components/DocsFooter';
import DocsHome from './components/DocsHome/DocsHome';
import SearchBox from './components/SearchBox';
import IsAesPage from './components/ShowAesPage';
import SidebarContent from './components/SidebarContent';
import {
  products,
  metaData,
  learningJourneys,
  archivedVersionsLink,
  siteUrl,
  getSiteUrl,
} from './config';
import LearningJourneyImg from './images/learning-journe-prev-next.svg';
import Argo from './products/Argo';
import Cloud from './products/Cloud';
import Code from './products/Code';
import EdgeStack from './products/EdgeStack';
import Emissary from './products/Emissary';
import Kubernetes from './products/Kubernetes';
import Run from './products/Run';
import Ship from './products/Ship';
import Telepresence from './products/Telepresence';
import './style.less';
import getDocsActiveVersion from './utils/getDocsActiveVersion';
import getPrevNext from './utils/getPrevNext';
import { canonicalUrls } from './utils/getValueCanonicals';

const index = ({ data, location, pageContext }) => {
  const page = data.mdx || {};
  const slug = page.fields.slug.split('/');
  const isHome = page.fields.slug === '/docs/';
  const initialProduct = isHome
    ? products[0]
    : products.filter((p) => p.slug === slug[2])[0] || products[0];
  const isArchivedVersions = slug[3] === archivedVersionsLink.link;
  const tempVersion =
    isHome || isArchivedVersions
      ? {}
      : initialProduct.version.filter((v) => v.id === slug[3])[0] || {};
  const isProduct = initialProduct.slug !== products[0].slug;
  const isProductHome = isProduct && !isArchivedVersions && !!!tempVersion.id;
  const realCanonicals = canonicalUrls[pageContext.canonical.url];
  let canonicalUrl = realCanonicals
    ? (pageContext.canonical.latest ? siteUrl : getSiteUrl()) + realCanonicals
    : (pageContext.canonical.latest ? siteUrl : getSiteUrl()) +
      pageContext.canonical.url;

  const initialVersion = !isProductHome
    ? tempVersion
    : initialProduct.version.filter((v) => v.id === 'latest')[0];
  function createEdgissaryDevPrevMsg(newVer, newProduct) {
    if (
      process.env.GATSBY_ARCHIVE_DOCS &&
      (newProduct.slug === 'emissary' ||
        newProduct.slug === 'edge-stack' ||
        newProduct.slug === 'telepresence')
    ) {
      return (
        <p>
          {`This document covers an unsupported and archived version of
                                            ${newProduct.name}. `}
          <a href={`https://www.getambassador.io/docs/${newProduct.slug}`}>
            Read the latest documentation to learn how to upgrade.
          </a>
        </p>
      );
    }
    if (
      newVer.id === '2.2' ||
      newVer.id === 'pre-release' ||
      newVer.id === 'latest' ||
      (newProduct.slug !== 'emissary' && newProduct.slug !== 'edge-stack')
    ) {
      return '';
    }
    return (
      <a
        href={`/docs/${newProduct.slug}/latest/tutorials/getting-started/`}
      >{`${newProduct.name} 2.2 is now available!`}</a>
    );
  }
  const initialEdgissaryDPNotificationMsg = createEdgissaryDevPrevMsg(
    initialVersion,
    initialProduct,
  );

  const learningJourneyName = new URLSearchParams(location.search).get(
    'learning-journey',
  );
  const learningPath = learningJourneyName
    ? `?learning-journey=${learningJourneyName}`
    : '';
  const isInLearnings = learningJourneys.includes(learningJourneyName);
  const learningJourneyData = isInLearnings
    ? data.allLearningjourney.nodes.filter(
        (node) =>
          node.slug.indexOf('/') > -1 &&
          node.slug.indexOf('.') > -1 &&
          node.slug.split('/')[1].split('.')[0] === learningJourneyName,
      )
    : [];
  const {
    title: learningTitle,
    description: learningDescription,
    readingTime: learningReadingTime,
    topics,
  } = isInLearnings ? JSON.parse(learningJourneyData[0].content)[0] : {};
  const {
    previous: prevLearning,
    next: nextLearning,
    isInTopics,
  } = isInLearnings ? getPrevNext(topics, page.fields.slug) : {};
  const isLearning = isInLearnings && isInTopics;
  const learningParseTopics = isLearning
    ? topics.map((topic) => {
        const items = topic.items.map((item) => {
          const readingTimeTopic = data.allMdx.edges.filter(
            (i) => i.node.fields.slug === `/docs/${item.link}`,
          );
          const { slug, readingTime } = readingTimeTopic[0]
            ? readingTimeTopic[0].node.fields
            : {};
          const { reading_time_text, hide_reading_time, reading_time } =
            readingTimeTopic[0] ? readingTimeTopic[0].node.frontmatter : {};
          return {
            ...item,
            slug,
            readingTimeMinutes: Math.ceil(
              readingTime ? readingTime.minutes : 0,
            ),
            readingTimeText: reading_time_text,
            hideReadingTime: hide_reading_time,
            readingTimeFront: reading_time,
          };
        });

        return {
          ...topic,
          items,
        };
      })
    : [];

  const burgerMenuInitialState = {
    title: '',
    header: {},
    menu: [],
    navigationTree: [],
  };

  const [product, setProduct] = useState(initialProduct);
  const [version, setVersion] = useState(initialVersion);
  const [burgerMenu, setBurgerMenu] = useState(burgerMenuInitialState);
  const [showVersion, setShowVersion] = useState(
    !isHome && isProduct && !isProductHome && !isArchivedVersions,
  );
  const [versionList, setVersionList] = useState(initialProduct.version);
  const [edgissaryDPMessage, setEdgissaryDPMessage] = useState(
    initialEdgissaryDPNotificationMsg,
  );

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
    let metaName;
    let metaRobots;

    if (isHome) {
      metaName = initialProduct.name;
      metaTitle = metaData['home'].title;
      metaDescription = metaData['home'].description;
    } else if (isProductHome) {
      metaName = initialProduct.name;
      metaTitle = metaData[initialProduct.slug].title;
      metaDescription = metaData[initialProduct.slug].description;
    } else {
      metaName =
        page.headings && page.headings[0] ? page.headings[0].value : 'Docs';
      metaTitle = metaName + ' | Ambassador';
      metaDescription =
        page.frontmatter && page.frontmatter.description
          ? page.frontmatter.description
          : page.excerpt;
      metaRobots =
        page.frontmatter && page.frontmatter.indexable === false
          ? 'noindex,nofollow'
          : null;
    }

    return {
      metaDescription: template(metaDescription, versions),
      metaTitle: template(metaTitle, versions),
      metaName: template(metaName, versions),
      metaRobots,
    };
  }, [
    isHome,
    isProductHome,
    versions,
    initialProduct.slug,
    page.headings,
    page.frontmatter,
    page.excerpt,
  ]);

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
    const newVersion =
      selectedProduct.version.filter((v) => v.id === 'latest')[0] ||
      selectedProduct.version[0];
    setVersion(newVersion);
    const newEdgissaryAnnouncement = createEdgissaryDevPrevMsg(
      newVersion,
      selectedProduct,
    );
    setEdgissaryDPMessage(newEdgissaryAnnouncement);
    navigate(selectedProduct.link);
  };

  const handleVersionChange = useCallback(
    async (e, value = null) => {
      const path = version.archived ? siteUrl : '';
      if (value === archivedVersionsLink.id) {
        navigate(`${path}/docs/${product.slug}/${archivedVersionsLink.link}`);
        return;
      }

      const newValue = value ? value : e.target.value;
      const newVersion = versionList.filter((v) => v.id === newValue)[0];
      setVersion(newVersion);
      const slugPath = slug.slice(4).join('/') || '';
      const newEdgissaryAnnouncement = createEdgissaryDevPrevMsg(
        newVersion,
        product,
      );
      setEdgissaryDPMessage(newEdgissaryAnnouncement);

      const newVersionLinksContent = (
        await import(`../docs/${product.slug}/${newVersion.id}/doc-links.yml`)
      ).default;
      const links = [];

      function createArrayLinks(el) {
        el.forEach((i) => {
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
    },
    [product, slug, version.archived, versionList],
  );

  const getProductHome = (product) => {
    const Product =
      {
        'edge-stack': EdgeStack,
        emissary: Emissary,
        telepresence: Telepresence,
        cloud: Cloud,
        argo: Argo,
        kubernetes: Kubernetes,
        code: Code,
        ship: Ship,
        run: Run,
      }[product] || EdgeStack;
    return <Product />;
  };

  const formatString = (title) => {
    if (title) {
      const formatedTitle = title.replace(/<\/?[^>]+(>|$)|\d../g, '');
      return template(formatedTitle, versions);
    }
  };

  let toc = [];

  if (
    page?.contentTable?.items &&
    page.contentTable.items[0].items?.length > 1
  ) {
    toc = page.contentTable.items[0].items.map((el) => ({
      ...el,
      title: formatString(el.title),
    }));
  }

  const MainContainer = ({ children }) => (
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
        <div className="docs__content_container">
          <div className="docs__doc-body-container__article flex-toc">
            {children}
          </div>
          <div
            className={
              page?.contentTable?.items &&
              page.contentTable.items[0].items?.length > 1
                ? 'docs__doc-body-container__article docs__doc-body-container__article-toc'
                : 'docs__doc-body-container__article-toc-none'
            }
          >
            {page?.contentTable?.items &&
              page.contentTable.items[0].items?.length > 1 && (
                <div className="docs__doc-body-container__table-content">
                  <p>ON THIS PAGE</p>
                  <ContentTable items={[{ items: toc }]} />
                </div>
              )}
          </div>
        </div>
        <div className="docs__doc-body-container__article-footer">{footer}</div>
      </div>
    </div>
  );

  const edgeStackLinks = data?.allFile.edges[0]?.node.internal.content;

  let docsVersion = versions?.docsVersion;
  if (!docsVersion) {
    const docsMatch = versions?.version?.match(/\d+.\d+/g);
    docsVersion = docsMatch?.length > 0 && docsMatch[0];
  }

  const footer = (
    <div
      className={product.slug === 'home' ? '' : 'docs__doc-footer-container'}
    >
      {product.slug === 'home' && (
        <hr className="docs__separator docs__container docs__container-home" />
      )}
      <section
        className={
          product.slug === 'home'
            ? 'docs__contact docs__container-home'
            : 'docs__contact docs__container'
        }
      >
        {product.slug !== 'home' && (
          <hr
            className={
              page?.contentTable?.items &&
              page.contentTable.items[0].items?.length > 1
                ? 'docs__separator docs__container docs__separator-footer'
                : 'docs__separator docs__container docs__separator-footer-no-article'
            }
          />
        )}
        <ContactBlock
          product={product.slug}
          page={
            page?.contentTable?.items &&
            page.contentTable.items[0].items?.length > 1
          }
        />
        {!isHome && !isProductHome && isProduct && (
          <DatawireMetaData
            page={page}
            edgeStackLinks={edgeStackLinks}
            product={product.slug}
            version={docsVersion}
            resources={page.exports}
          />
        )}
      </section>
      {!isHome && !isProductHome && isProduct && (
        <DocsFooter
          page={page}
          edgeStackLinks={edgeStackLinks}
          product={product.slug}
          version={docsVersion}
        />
      )}
    </div>
  );

  const content = useMemo(() => {
    if (isHome) {
      return (
        <>
          <DocsHome />
          {footer}
        </>
      );
    } else if (isProductHome) {
      return (
        <MainContainer>{getProductHome(initialProduct.slug)}</MainContainer>
      );
    } else if (isArchivedVersions) {
      return <AllVersions product={initialProduct} />;
    }
    return (
      <MainContainer>
        <div className="docs__doc-body doc-body">
          <div className="doc-tags">
            <IsAesPage
              initialProduct={initialProduct.slug}
              slug={slug}
              initialVersion={initialVersion.id}
            />
          </div>
          <ReadingTime
            slug={page.fields.slug}
            hideReadingTime={page.frontmatter.hide_reading_time}
            readingTimeMinutes={page.fields.readingTime.minutes}
            readingTimeFront={page.frontmatter.reading_time}
            readingTimeText={page.frontmatter.reading_time_text}
            itemClassName="docs__reading-time"
          />
          <MDXRenderer
            slug={page.fields.slug}
            readingTime={page.fields.readingTime.minutes}
          >
            {template(page.body, versions)}
          </MDXRenderer>
          {isLearning && (
            <div className="docs__next-previous">
              <span className="docs__next-previous__title">
                Continue your learning journey
              </span>
              <div className="docs__next-previous__content">
                <div className="docs__next-previous__previous">
                  {prevLearning && (
                    <>
                      <Link
                        to={`/docs/${prevLearning.link}${learningPath}`}
                        className="docs__next-previous__button"
                      >
                        <Icon name="right-arrow" /> Previous
                      </Link>
                      <span className="docs__next-previous__text">
                        {prevLearning.title}
                      </span>
                    </>
                  )}
                </div>
                <div className="docs__next-previous__learning-journey">
                  <img src={LearningJourneyImg} alt="Learning Journey" />
                </div>
                <div className="docs__next-previous__next">
                  {nextLearning && (
                    <>
                      <Link
                        to={`/docs/${nextLearning.link}${learningPath}`}
                        className="docs__next-previous__button"
                      >
                        Next <Icon name="right-arrow" />
                      </Link>
                      <span className="docs__next-previous__text">
                        {nextLearning.title}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </MainContainer>
    );
  }, [
    footer,
    initialProduct,
    initialVersion,
    slug,
    isArchivedVersions,
    isHome,
    isLearning,
    isProductHome,
    learningPath,
    nextLearning,
    page.body,
    page.fields.readingTime.minutes,
    page.fields.slug,
    page.frontmatter.hide_reading_time,
    page.frontmatter.reading_time,
    page.frontmatter.reading_time_text,
    prevLearning,
    versions,
  ]);

  const onClickMenuBurgerDetail = (item) => {
    if (item.isVersion) {
      handleVersionChange({}, item.id);
      return;
    }

    if (item.link && !item.items) {
      navigate(item.link);
      return;
    }

    if (item.title === 'Products') {
      const menu = {
        header: {
          title: 'Products',
          backAction: true,
        },
        menu: item.items,
        navigationTree: ['Products'],
      };

      setBurgerMenu(menu);
      return;
    }

    const items = getMenuContent(item.items);

    const menu = {
      ...burgerMenu,
      header: {
        title: item.title,
        backAction: true,
      },
      menu: getMenuContent(item.items),
      navigationTree: [
        ...burgerMenu.navigationTree,
        {
          title: item.title,
          items,
        },
      ],
    };

    setBurgerMenu(menu);
  };

  const onClickMenuBugerHeader = (item) => {
    if (burgerMenu.navigationTree.length === 0 && item !== 'Docs Home') {
      navigate(`/docs/`);
      return;
    }

    if (burgerMenu.navigationTree.length === 1) {
      setBurgerMenu(burgerMenuInitialState);
      return;
    }

    const navigationTree = [...burgerMenu.navigationTree];
    navigationTree.pop();
    const currentItem = navigationTree[navigationTree.length - 1];

    setBurgerMenu({
      ...burgerMenu,
      header: {
        backAction: true,
        title: currentItem.title,
      },
      menu: currentItem.items,
      navigationTree,
    });

    return;
  };

  const onCloseMenuBurger = () => setBurgerMenu(burgerMenuInitialState);

  const getBurgerMenuInitialItems = (items, page) => {
    return items.reduce(
      (previous, current) => {
        if (product.name === current.name) return previous;

        const item = {
          title: current.name,
          link: current.link,
          detail: !current.link,
        };

        !current.isProduct && current.name !== page
          ? previous.items.push(item)
          : previous.products.push(item);

        return previous;
      },
      { products: [], items: [] },
    );
  };

  const getMenuContent = (items) => {
    return items.map((item) => {
      const content = {
        title: item.title,
        link: getUrl(`/${slug[1]}/${slug[2]}/${version.id}/`, item.link),
        detail: item.link ? (item.items ? true : false) : true,
        isVersion: item.isVersion,
        id: item.id,
        items: item.items,
      };
      return {
        ...content,
      };
    });
  };

  const getUrl = (path, page) => {
    if (!page) return;

    let cleanLink = page;

    if (cleanLink.startsWith('/')) {
      cleanLink = cleanLink.slice(1);
    }

    return url.resolve(`${path}`, cleanLink);
  };

  const getBurgerMenuItems = (slug) => {
    if (slug === 'home') {
      return [
        ...initialItems.items,
        {
          title: 'Products',
          detail: true,
          items: initialItems.products,
        },
      ];
    }

    if (products.find((item) => item.slug === slug)) {
      return getMenuContent(menuLinks);
    }

    return [];
  };

  const initialItems = getBurgerMenuInitialItems(products, product.name);
  const initialHeader = {
    title: product.name,
    active: true,
    backAction: !(product.name === 'Docs Home'),
    onClick: () => onClickMenuBugerHeader(product.name),
  };

  let burgerMenuItems = getBurgerMenuItems(product.slug);
  const hasMultipleVersions = versionList.length > 1;

  if (hasMultipleVersions) {
    const versionsToShow = getDocsActiveVersion(versionList);
    const versionBurgerMenu = {
      title: `Version: ${version.name}`,
      detail: true,
      items: versionsToShow.map((version) => ({
        ...version,
        title: version.name,
        isVersion: true,
      })),
    };

    burgerMenuItems = [versionBurgerMenu, ...burgerMenuItems];
  }

  let burgerMenuTitle = metadata.metaName;
  let breadCrumb = [
    {
      label: 'Docs',
      url: '/docs',
    },
  ];

  if (!isProductHome && !isHome) {
    breadCrumb.push({
      label: product.name,
      url: product.link,
    });
  }

  if (!isHome && version.id && version?.id !== 'latest') {
    breadCrumb.push({
      label: version.name,
      url: getUrl(`/${slug[1]}/${slug[2]}/`, version.link),
    });

    if (isProductHome) {
      burgerMenuTitle = hasMultipleVersions
        ? `${burgerMenuTitle}: V.${version.name}`
        : burgerMenuTitle;
    }

    if (!isProductHome) {
      burgerMenuTitle = hasMultipleVersions
        ? `${product.name} V.${version.name}: ${burgerMenuTitle}`
        : `${product.name}: ${burgerMenuTitle}`;
    }
  }

  return (
    <Layout
      location={location}
      customAnnouncement={edgissaryDPMessage}
      customAnnouncementClass="docs-announcement-container"
    >
      <SEO
        title={metadata.metaTitle}
        type="article"
        canonicalUrl={canonicalUrl}
        description={metadata.metaDescription}
        robots={metadata.metaRobots}
      />

      <div
        className={`docs ${
          edgissaryDPMessage ? 'docs-margin-top-announcement' : ''
        }`}
      >
        <nav>
          <div className="docs__nav">
            <div className="docs__nav__content">
              <div className="docs__links-content docs__dekstop">
                <ul className="docs__products-list">
                  {products.map((item) => {
                    if (!item.isProduct) {
                      const linkContent = version.archived ? (
                        <a href={`${siteUrl}${item.link}`}>{item.name}</a>
                      ) : (
                        <Link to={item.link}>{item.name}</Link>
                      );
                      return (
                        <li
                          className={`${
                            product.slug === item.slug ? 'docs__selected' : ''
                          }`}
                          key={item.name}
                          onClick={claenStorage}
                        >
                          {linkContent}
                        </li>
                      );
                    }
                  })}

                  <li
                    className={`${
                      product.isProduct ? 'docs__selected__dropdown' : ''
                    }`}
                    key="products"
                  >
                    <Dropdown
                      label={`Products${
                        product.name == 'Docs Home' || !product.isProduct
                          ? ''
                          : ' - ' + product.name
                      }`}
                      className={'docs__nav-dropdown'}
                      handleOnChange={handleProductChange}
                      value={product.slug}
                      options={products
                        .filter((i) => i.isProduct)
                        .map((i) => ({ id: i.slug, name: i.name }))}
                    />
                  </li>
                </ul>
              </div>
              <div className={'docs__nav-burger'}>
                <Burger
                  title={burgerMenu.title || burgerMenuTitle}
                  header={
                    burgerMenu.header.title
                      ? {
                          ...burgerMenu.header,
                          onClick: () =>
                            onClickMenuBugerHeader({
                              title: metadata.metaName,
                            }),
                        }
                      : initialHeader
                  }
                  items={
                    burgerMenu.menu.length > 0
                      ? burgerMenu.menu
                      : burgerMenuItems
                  }
                  onClickItem={onClickMenuBurgerDetail}
                  onCloseMenu={onCloseMenuBurger}
                />
              </div>
              <SearchBox />
            </div>
          </div>
        </nav>
        <div className="docs__body">
          {product.name !== 'Docs Home' && (
            <div className="docs__body_bread-container">
              <Breadcrumbs
                style={{
                  margin: 'unset',
                  marginTop: '10px',
                  padding: '0px 20px',
                  width: '100%',
                }}
                title={burgerMenu.title || metadata.metaName}
                links={breadCrumb}
              />
            </div>
          )}
          {content}
        </div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query ($linksslug: String, $slug: String!, $learningSlugs: [String]) {
    mdx(fields: { slug: { eq: $slug } }) {
      body
      exports {
        metaData {
          name
          path
        }
      }
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
        indexable
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
    allMdx(filter: { fields: { slug: { in: $learningSlugs } } }) {
      edges {
        node {
          fields {
            slug
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
    allFile(filter: { relativePath: { eq: "checklist.md" } }) {
      edges {
        node {
          internal {
            content
          }
        }
      }
    }
  }
`;

export default index;
