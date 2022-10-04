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

import './doc-page.less';

// Given a content string and a dict of variables, expand $variables$ in the string.
//
// https://github.com/gatsbyjs/gatsby/issues/10174#issuecomment-442513501
const template = (content, vars) => {
  return content.replace(/\$(\S+)\$/g, (match, key) => {
    const value = vars[key];
    if (typeof value !== 'undefined') {
      return value;
    }
    return match; // guards against some unintentional prefix
  });
}

const LinkList = ({ rooturl, items, className }) => {
  if (!items) {
    return null;
  }
  return (
    <ul className={className}>
      {
        items.map((item, i) => (
          <li key={i}>
            {item.link ? <a href={url.resolve(rooturl, item.link)}>{item.title}</a> : item.title}
            <LinkList rooturl={rooturl} items={item.items} />
          </li>
        ))
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
    !mdxNode.frontmatter.frontmatter.hide_reading_time;

  return (
    <>
      <Helmet>
        <title>{title} | {siteTitle}</title>
        <meta name="og:title" content={title + " | " + siteTitle} />
        <meta name="description" content={description} />
      </Helmet>
      {showReadingTime ? <span className="docs__reading-time">{readingTime}</span> : ''}
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

const handleVersionChange = (event) => {
  if (event.target.value) {
    navigate(event.target.value);
  }
};

export default function DocPage({ location, data, pageContext }) {
  //  const variables = jsYAML.safeLoad(data.variablesFile.internal.content);
  const canonicalUrl = pageContext.canonical.url;

  return (
    <Layout location={location}>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="og:type" content="article" />
      </Helmet>
    </Layout>
  )
}
