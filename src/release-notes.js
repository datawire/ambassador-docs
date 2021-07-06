import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { graphql, Link, navigate } from 'gatsby';
import Layout from '../../src/components/Layout';
import Search from './images/search.inline.svg';
import { products, oldStructure } from './config';
import ReleaseNotes from './components/ReleaseNotes';
import Sidebar from './components/Sidebar';
import Dropdown from '../../src/components/Dropdown';
import DocsFooter from './components/DocsFooter';
import ContactBlock from '../../src/components/ContactBlock';
import template from '../../src/utils/template';
import './style.less';

export default ({ data, location, pageContext }) => {
  const slug = pageContext.slug.split('/');
  const initialProduct = useMemo(
    () => products.find((p) => p.slug === slug[2]) || products[0],
    [slug, products],
  );

  const initialVersion = useMemo(
    () => initialProduct.version.filter((v) => v.id === slug[3])[0] || {},
    [initialProduct, slug],
  );

  const canonicalUrl = `https://www.getambassador.io/docs/${slug[2]}/latest/release-notes`;

  const [product, setProduct] = useState(initialProduct);
  const [version, setVersion] = useState(initialVersion);
  const [versionList, setVersionList] = useState(initialProduct.version);
  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 800 : true;
  }, []);
  useEffect(() => {
    loadJS();
  }, [isMobile]);

  const parseLinksByVersion = useCallback((vers, links) => {
    if (oldStructure.includes(vers)) {
      return links;
    }
    return links[1].items[0].items;
  }, [oldStructure]);

  const versions = useMemo(() => {
    if (!data.versions?.content) {
      return {};
    }
    const versions = data.versions?.content;
    return JSON.parse(versions);
  }, [data.versions?.content]);

  const menuLinks = useMemo(() => {
    if (!data.linkentries?.content) {
      return [];
    }
    const linksJson = JSON.parse(template(data.linkentries?.content, versions) || []);
    return parseLinksByVersion(slug[3], linksJson);
  }, [data.linkentries, slug]);

  const getMetaDescription = () => {
    switch (slug[2]) {
      case 'edge-stack':
        return 'Release notes for Ambassador Edge Stack, a comprehensive, self-service edge stack for Kubernetes applications built on the open source Ambassador API Gateway and Envoy Proxy.';
      case 'telepresence':
        return 'Release notes for Telepresence by Ambassador Labs, a CNCF project that enables developers to iterate rapidly on Kubernetes microservices by arming them with infinite-scale development environments, access to instantaneous feedback loops, and highly customizable development environments.';
      case 'argo':
        return 'Release notes for Argo, a CNCF project for building and managing continuous delivery workflows on Kubernetes.';
      case 'cloud':
        return 'Release notes for Ambassador Cloud, a central dashboard for your favorite Ambassador Labs tools including Service Catalog, a real-time portal for Kubernetes application developers.';
      default:
        return '';
    }
  };

  const getMetaData = () => {
    const metaTitle = `${versions.productName} Release Notes | Ambassador`;
    const metaDescription = getMetaDescription();
    return { metaDescription, metaTitle };
  };

  const claenStorage = () => sessionStorage.removeItem('expandedItems');

  const handleProductChange = (e, name = null) => {
    const value = name ? name : e.target.value;
    const selectedProduct = products.filter((p) => p.slug === value)[0];
    setProduct(selectedProduct);
    if (selectedProduct.slug === 'home') {
      navigate(`/docs/`);
      return;
    }
    setVersionList(selectedProduct.version);
    const newVersion =
      selectedProduct.version.filter((v) => v.id === 'latest')[0] ||
      selectedProduct.version[0];
    setVersion(newVersion);
    navigate(selectedProduct.link);
  };

  const handleVersionChange = async (e, value = null) => {
    const newValue = value ? value : e.target.value;
    const newVersion = versionList.filter((v) => v.id === newValue)[0];
    setVersion(newVersion);
    const slugPath = slug.slice(4).join('/') || '';

    const newVersionLinks = await import(
      `../docs/${product.slug}/${newVersion.id}/doc-links.yml`
    );

    const newVersionLinksContent = parseLinksByVersion(
      newVersion.id,
      newVersionLinks.default,
    );
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
      navigate(`/docs/${product.slug}/${newVersion.id}/${slugPath}`);
    } else {
      navigate(`/docs/${product.slug}/${newVersion.link}/`);
    }
  };

  const handleViewMore = ({ docs }) => {
    if (docs) {
      if (docs.indexOf('http://') === 0 || docs.indexOf('https://') === 0) {
        window.location = docs;
      } else {
        navigate(`/docs/${product.slug}/${version.id}/${docs}`);
      }
    }
  };

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

  const footer = (
    <div>
      <hr className="docs__separator docs__container" />
      <section className="docs__contact docs__container">
        <ContactBlock />
      </section>
      <DocsFooter product={product.slug} version={versions.docsVersion} />
    </div>
  );

  const content = useMemo(() => {
    const changelogUrl = data.releaseNotes.changelog
      ? template(data.releaseNotes.changelog, versions)
      : '';

    return (
      <div className="docs__container-doc">
        <Sidebar
          onVersionChanged={handleVersionChange}
          version={version}
          versionList={versionList}
          topicList={menuLinks}
          slug={pageContext.slug}
        />
        <div className="docs__doc-body-container">
          <div className="docs__doc-body doc-body">
            <ReleaseNotes
              changelog={changelogUrl}
              releases={data.releaseNotes?.versions}
              versions={versions}
              images={data.images?.nodes}
              product={slug[2]}
              handleViewMore={handleViewMore}
            />
          </div>
          {footer}
        </div>
      </div>
    );
  }, [data.releaseNotes]);

  return (
    <Layout location={location}>
      <Helmet>
        <title>{getMetaData().metaTitle}</title>
        <meta name="og:title" content={getMetaData().metaTitle} />
        <meta name="og:type" content="article" />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={getMetaData().metaDescription} />
        {!isMobile && (
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.css"
            type="text/css"
            media="all"
          />
        )}
        {!isMobile && (
          <script
            defer
            src="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.js"
          ></script>
        )}
      </Helmet>
      <div className="docs">
        <nav>
          <div className="docs__nav">
            <div className="docs__links-content docs__dekstop">
              <ul className="docs__products-list">
                {products.map((item) => (
                  <li
                    className={`${
                      product.slug === item.slug ? 'docs__selected' : ''
                    }`}
                    key={item.name}
                    onClick={claenStorage}
                  >
                    <Link to={item.link}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={`docs__dropdown-container docs__mobile${
                versionList.length > 1 ? ' docs__dropdown-version' : ''
              }`}
            >
              <Dropdown
                label={product.name}
                handleOnChange={handleProductChange}
                value={product.slug}
                options={products.map((i) => ({ id: i.slug, name: i.name }))}
              />
              {versionList.length > 1 && (
                <Dropdown
                  label={`Version: ${version.name}`}
                  handleOnChange={handleVersionChange}
                  value={version.id}
                  options={versionList}
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
        <div className="docs__body">{content}</div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query($releaseNotesSlug: String, $linksSlug: String) {
    linkentries(slug: { eq: $linksSlug }) {
      id
      content
    }
    versions(slug: { eq: $linksSlug }) {
      id
      content
    }
    releaseNotes: releases(slug: { eq: $releaseNotesSlug }) {
      id
      changelog
      versions {
        version
        date
        notes {
          body
          title
          image
          docs
          type
        }
      }
      slug
    }
    images: allFile(filter: { relativeDirectory: { eq: "public" } }) {
      nodes {
        publicURL
        name
        relativeDirectory
        relativePath
      }
    }
  }
`;
