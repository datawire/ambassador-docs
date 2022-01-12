import { graphql, Link, navigate } from 'gatsby';
import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';

import Layout from '../../src/components/Layout';

import ContactBlock from '../../src/components/ContactBlock';
import Dropdown from '../../src/components/Dropdown';
import template from '../../src/utils/template';

import DocsFooter from './components/DocsFooter';
import ReleaseNotes from './components/ReleaseNotes';
import SearchBox from './components/SearchBox';
import Sidebar from './components/Sidebar';
import { products } from './config';
import './style.less';

export default ({ data, location, pageContext }) => {
  const slug = pageContext.slug.split('/');
  const initialProduct = useMemo(
    () => products.find((p) => p.slug === slug[2]) || products[0],
    [slug],
  );

  const initialVersion = useMemo(
    () => initialProduct.version.filter((v) => v.id === slug[3])[0] || {},
    [initialProduct, slug],
  );

  const canonicalUrl = `https://www.getambassador.io/docs/${slug[2]}/latest/release-notes`;

  const [product, setProduct] = useState(initialProduct);
  const [version, setVersion] = useState(initialVersion);
  const [versionList, setVersionList] = useState(initialProduct.version);

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

  const handleVersionChange = useCallback(
    async (e, value = null) => {
      const newValue = value ? value : e.target.value;
      const newVersion = versionList.filter((v) => v.id === newValue)[0];
      setVersion(newVersion);
      const slugPath = slug.slice(4).join('/') || '';

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
        navigate(`/docs/${product.slug}/${newVersion.id}/${slugPath}`);
      } else {
        navigate(`/docs/${product.slug}/${newVersion.link}/`);
      }
    },
    [product.slug, slug, versionList],
  );

  const handleViewMore = useCallback(
    ({ docs, href }) => {
      if (href) {
        navigate(href);
        return;
      }
      if (docs) {
        if (docs.indexOf('http://') === 0 || docs.indexOf('https://') === 0) {
          window.location = docs;
        } else {
          navigate(`/docs/${product.slug}/${version.id}/${docs}`);
        }
      }
    },
    [product.slug, version.id],
  );

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
              product={slug[2]}
              handleViewMore={handleViewMore}
            />
          </div>
          {footer}
        </div>
      </div>
    );
  }, [
    data.releaseNotes,
    footer,
    handleVersionChange,
    handleViewMore,
    menuLinks,
    pageContext.slug,
    slug,
    version,
    versionList,
    versions,
  ]);

  return (
    <Layout location={location}>
      <Helmet>
        <title>{getMetaData().metaTitle}</title>
        <meta name="og:title" content={getMetaData().metaTitle} />
        <meta name="og:type" content="article" />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={getMetaData().metaDescription} />
      </Helmet>
      <div className="docs">
        <nav>
          <div className="docs__nav">
            <div className="docs__links-content docs__dekstop">
              <ul className="docs__products-list">
                {products.map((item) => (
                  <li
                    className={`${product.slug === item.slug ? 'docs__selected' : ''
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
              className={`docs__dropdown-container docs__mobile${versionList.length > 1 ? ' docs__dropdown-version' : ''
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
            <SearchBox />
          </div>
        </nav>
        <div className="docs__body">{content}</div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query ($releaseNotesSlug: String, $linksSlug: String) {
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
          href
          type
        }
      }
      slug
    }
  }
`;
