import { Link, navigate } from 'gatsby';
import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';

import Layout from '../../../../src/components/Layout';

import ContactBlock from '../../../../src/components/ContactBlock';
import Dropdown from '../../../../src/components/Dropdown';
import template from '../../../../src/utils/template';
import getDate from '../../../src/utils/getDate';

import ContentTable from '../ContentTable';
import DocsFooter from '../DocsFooter';
import ReleaseNotes from './index';
import SearchBox from '../SearchBox';
import Sidebar from '../Sidebar';
import { products, archivedDocsUrl, siteUrl } from '../../config';
import '../../style.less';

const releaseNotes = ({ data, location, pageContext }) => {
  const PRODUCT_NAME = 2;
  const PRODUCT_VERSION = 3;
  const slug = pageContext.slug.split('/');
  const initialProduct = useMemo(
    () => products.find((p) => p.slug === slug[PRODUCT_NAME]) || products[0],
    [slug],
  );

  const initialVersion = useMemo(
    () =>
      initialProduct.version.filter((v) => v.id === slug[PRODUCT_VERSION])[0] ||
      {},
    [initialProduct, slug],
  );

  const canonicalUrl = `https://www.getambassador.io/docs/${slug[PRODUCT_NAME]}/latest/release-notes`;

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
    switch (slug[PRODUCT_NAME]) {
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

      if (newVersion.archived) {
        return navigate(
          `${archivedDocsUrl}/docs/${product.slug}/${newVersion.link}`,
        );
      }

      setVersion(newVersion);
      const slugPath = slug.slice(4).join('/') || '';

      const newVersionLinksContent = (
        await import(`../../../docs/${product.slug}/${newVersion.id}/doc-links.yml`)
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

  const getContentTableData = (data) => {
    const items = data.map((item) => ({
      url: item.version ? `#${item.version}` : `#${item.date}`,
      title: item.version ? `Version ${item.version}` : getDate(item.date),
    }));

    return [
      {
        items,
      },
    ];
  };

  let docsVersion = versions?.docsVersion;
  if (!docsVersion) {
    const docsMatch = versions?.version?.match(/\d+.\d+/g);
    docsVersion = docsMatch?.length > 0 && docsMatch[0];
  }

  const footer = (
    <>
      <div className="docs__footer-principal-container">
        <div className="docs__footer-contact-container">
          <hr className="docs__separator-footer-release" />
          <section className="docs__contact">
            <ContactBlock />
          </section>
        </div>
        <div className="docs__doc-body-container__article docs__doc-body-container__article-toc"></div>
      </div>
      <div className="docs__doc-footer-container">
        <DocsFooter product={product.slug} version={docsVersion} />
      </div>
    </>
  );

  const content = useMemo(() => {
    const changelogUrl = data.releaseNotes.changelog
      ? template(data.releaseNotes.changelog, versions)
      : '';

    const toc = getContentTableData(data.releaseNotes.versions);

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
          <div className="docs__content_container">
            <div className="docs__doc-body-container__article flex-toc">
              <div className="docs__doc-body doc-body">
                <ReleaseNotes
                  changelog={changelogUrl}
                  releases={data.releaseNotes?.versions}
                  versions={versions}
                  product={slug[PRODUCT_NAME]}
                  handleViewMore={handleViewMore}
                />
              </div>
            </div>
            <div className="docs__doc-body-container__article docs__doc-body-container__article-toc">
              <div className="docs__doc-body-container__table-content">
                <p>ON THIS PAGE</p>
                <ContentTable items={toc} />
              </div>
            </div>
          </div>
          <div className="docs__doc-body-container__article-footer">
            {footer}
          </div>
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
            <div className="docs__nav__content">
              <div className="docs__links-content docs__dekstop">
                <ul className="docs__products-list">
                  {products.map((item) => {
                    const linkContent = version.archived ? (
                      <a href={`${siteUrl}${item.link}`}>{item.name}</a>
                    ) : (
                      <Link to={item.link}>{item.name}</Link>
                    );
                    return (
                      <li
                        className={`${product.slug === item.slug ? 'docs__selected' : ''
                          }`}
                        key={item.name}
                        onClick={claenStorage}
                      >
                        {linkContent}
                      </li>
                    );
                  }
                  )}
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
          </div>
        </nav>
        <div className="docs__body">{content}</div>
      </div>
    </Layout>
  );
};

export default releaseNotes;
