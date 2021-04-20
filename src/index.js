import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, navigate } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

import Layout from '../../src/components/Layout';
import template from '../../src/utils/template';
import Search from './images/search.inline.svg';
import { products, oldStructure, metaData } from './config';
import DocsHome from './components/DocsHome';
import Sidebar from './components/Sidebar';
import Dropdown from '../../src/components/Dropdown';
import DocsFooter from './components/DocsFooter';
import isAesPage from './utils/isAesPage';
import Argo from './products/Argo';
import Cloud from './products/Cloud';
import EdgeStack from './products/EdgeStack';
import Telepresence from './products/Telepresence';
import Kubernetes from './products/Kubernetes';
import ContactBlock from '../../src/components/ContactBlock';
import './style.less';

export default ({ data, location }) => {
    const page = data.mdx || {};
    const slug = page.fields.slug.split('/');
    const isHome = page.fields.slug === '/docs/';
    const initialProduct = isHome
        ? products[0]
        : products.filter((p) => p.slug === slug[2])[0] || products[0];
    const initialVersion = isHome
        ? {}
        : initialProduct.version.filter((v) => v.id === slug[3])[0] || {};
    const isProduct = initialProduct.slug !== products[0].slug;
    const isProductHome = isProduct && !!!initialVersion.id;
    const canonicalUrl = isHome
        ? 'https://www.getambassador.io/docs/'
        : `https://www.getambassador.io/docs/${slug[2]}/latest/${slug
            .slice(4)
            .join('/')}`;

    const [product, setProduct] = useState(initialProduct);
    const [version, setVersion] = useState(initialVersion);
    const [showVersion, setShowVersion] = useState(!isHome && isProduct && !isProductHome);
    const [versionList, setVersionList] = useState(initialProduct.version);
    const [showAesPage, setShowAesPage] = useState(false);

    useEffect(() => {
        loadJS();
        isAesPage(initialProduct.slug, slug, initialVersion.id).then(result => setShowAesPage(result))
    }, []);

    const parseLinksByVersion = (vers, links) => {
        if (oldStructure.includes(vers)) {
            return links;
        }
        return links[1].items[0].items;
    }

    const getVersions = () => {
        if (!data.versions?.content) {
            return {};
        }
        const versions = data.versions?.content;
        return JSON.parse(versions);
    }

    const menuLinks = useMemo(() => {
        if (!data.linkentries?.content) {
            return [];
        }
        const linksJson = JSON.parse(data.linkentries?.content || []);
        return parseLinksByVersion(slug[3], linksJson);
    }, [data.linkentries, slug]);

    const getMetaData = () => {
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
        return { metaDescription, metaTitle };
    }

    const claenStorage = () => sessionStorage.removeItem('expandedItems');

    const handleProductChange = (e, name = null) => {
        const value = name ? name : e.target.value;
        const selectedProduct = products.filter((p) => p.slug === value)[0];
        setProduct(selectedProduct);
        setShowVersion(selectedProduct.version.length);
        if (selectedProduct.slug === 'home') {
            navigate(`/docs/`);
            return;
        }
        setVersionList(selectedProduct.version);
        const newVersion = selectedProduct.version.filter(v => v.id === "latest")[0] || selectedProduct.version[0];
        setVersion(newVersion);
        navigate(selectedProduct.link);
    };

    const handleVersionChange = async (e, value = null) => {
        const newValue = value ? value : e.target.value;
        const newVersion = versionList.filter((v) => v.id === newValue)[0];
        setVersion(newVersion);
        const slugPath = slug.slice(4).join('/') || '';

        const newVersionLinks = await import(`../docs/${product.slug}/${newVersion.id}/doc-links.yml`);

        const newVersionLinksContent = parseLinksByVersion(newVersion.id, newVersionLinks.default);
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
            navigate(`/docs/${product.slug}/${newVersion.id}/${slugPath}`);
        } else {
            navigate(`/docs/${product.slug}/${newVersion.link}/`);
        }

    };

    const loadJS = () => {
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
    };

    const getProductHome = (product) => {
        switch (product) {
            case 'edge-stack':
                return <EdgeStack />;
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

    const footer = (
        <div>
            <hr className="docs__separator docs__container" />
            <section className="docs__contact docs__container">
                <ContactBlock />
            </section>
            {!isHome && isProduct && (
                <DocsFooter page={page} product={product.slug} version={getVersions().docsVersion} />)
            }
        </div>
    );

    const content = useMemo(() => {
        if (isHome) {
            return <>
                <DocsHome />
                {footer}
            </>
        } else if (isProductHome) {
            return <>
                {getProductHome(initialProduct.slug)}
                {footer}
            </>
        }
        return (
            <div className="docs__container-doc">
                <Sidebar
                    onVersionChanged={handleVersionChange}
                    version={version}
                    versionList={versionList}
                    topicList={menuLinks}
                    slug={page.fields.slug}
                />
                <div className="docs__doc-body-container">
                    <div className="docs__doc-body doc-body">
                        <div className="doc-tags">
                            {showAesPage && (
                                <Link className="doc-tag aes" to="/editions">
                                    Ambassador Edge Stack
                                </Link>
                            )}
                        </div>
                        <MDXRenderer slug={page.fields.slug}>
                            {template(page.body, getVersions())}
                        </MDXRenderer>
                    </div>
                    {footer}
                </div>
            </div>
        );
    }, [isHome, isProductHome]);

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
                <div className="docs__body">
                    {content}
                </div>

            </div>
        </Layout>
    );
};

export const query = graphql`
  query($linksslug: String, $slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      body
      fields {
        slug
        linksslug
      }
      excerpt(pruneLength: 150, truncate: true)
      headings(depth: h1) {
        value
      }
      frontmatter {
        description
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
  }
`;