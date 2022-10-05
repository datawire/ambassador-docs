import React from 'react';
import { graphql, navigate } from 'gatsby';
import { Helmet } from 'react-helmet';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import jsYAML from 'js-yaml';
import url from 'url';

import Layout from './Layout';
import Release from './ReleaseNotes/Release';
import GithubIcon from './images/github-icon.inline.svg';
import { components } from './Markdown';
import template from '../../../../src/utils/template';
import Link from '../../../../src/components/Link';

import './doc-page.less';

const LinkList = ({ rooturl, items, className }) => {
  console.log('items ---->', items)
  if (!items) return null;

  return (
    <ul className={className}>
      {
        items.length ? items.map((item, i) => (
          <li key={i}>
            {item.link ? <Link to={url.resolve(rooturl, item.link)}>{item.title}</Link> : item.title}
            {item.items && <LinkList rooturl={rooturl} items={item.items} />}
          </li>
        )) : items.link ? <Link to={url.resolve(rooturl, items.link)}>{items.title}</Link> : items.title
      }
    </ul>
  )
}

const MarkdownContent = ({
  mdxNode,
  variables,
  siteTitle,
  maybeShowReadingTime,
}) => {
  const title = mdxNode.frontmatter.title ||
    mdxNode.headings[0]?.value ||
    "Docs";
  const description = mdxNode.frontmatter.description ||
    mdxNode.excerpt;
  const readingTime = mdxNode.frontmatter.reading_time ||
    mdxNode.fields.readingTime.text;

  const showReadingTime = maybeShowReadingTime &&
    !mdxNode.frontmatter.hide_reading_time;

  return (
    <>
      <Helmet>
        <title>{title} | {siteTitle}</title>
        <meta name="og:title" content={title + " | " + siteTitle} />
        <meta name="description" content={description} />
      </Helmet>
      {showReadingTime ? <span className="docs_telepresence_archive__reading-time">{readingTime}</span> : ''}
      <MDXProvider components={components}>
        <MDXRenderer>
          {template(mdxNode.body, variables)}
        </MDXRenderer>
      </MDXProvider>
    </>
  );
};

const ReleaseNotesContent = ({
  fileNode,
  variables,
  siteTitle,
}) => {
  const content = jsYAML.safeLoad(template(fileNode.internal.content, variables))

  return (
    <>
      <Helmet>
        <title>{content.docTitle} | {siteTitle}</title>
        <meta name="og:title" content={content.docTitle + " | " + siteTitle} />
        <meta name="description" content={content.docDescription} />
      </Helmet>
      <h1>{content.docTitle}</h1>
      {
        content.items.map((release) => (
          <Release key={release.version}
            release={release} />
        ))
      }
      {
        content.changelog &&
        <p>For a detailed list of all the changes in past releases, please
          consult the <a href={content.changelog}>CHANGELOG</a>.</p>
      }
    </>
  );
};

export default function DocPage({ location, data, pageContext }) {
  const page = data.mdx || {};
  const canonicalUrl = pageContext.canonical.url;
  const rawVersions = data.versions?.content;
  const rawLinks = data.linkentries?.content;
  const versions = JSON.parse(rawVersions);
  const linkItems = JSON.parse(template(rawLinks, versions));
  const slug = page.fields.slug;

  return (
    <Layout location={location}>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="og:type" content="article" />
      </Helmet>
      <div className="docs_telepresence_archive">
        <nav className="docs_telepresence_archive__sidebar">
          <LinkList
            className="docs_telepresence_archive__sidebar_toc"
            rooturl='/docs/telepresence/1.0/'
            items={linkItems}
          />
        </nav>
        <main className="docs_telepresence_archive__main">
          {
            page
              ? <MarkdownContent
                mdxNode={page}
                variables={versions}
                siteTitle={'A TITLE'}
                maybeShowReadingTime={page.frontmatter.hide_reading_time}
              />
              : <></>
          }
        </main>
        <footer className="docs_telepresence_archive__footer">
          <a
            href={`https://github.com/telepresenceio/telepresence.io/tree/master/docs/v1`}
            className="github"
            target="_blank"
            rel="noreferrer"
          >
            <GithubIcon />
            Edit this page on GitHub
          </a>
        </footer>
      </div>
    </Layout>
  )
}
