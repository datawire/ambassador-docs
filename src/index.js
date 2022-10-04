import { graphql } from 'gatsby';
import React from 'react';

import Home from './components/Home';
import DocPage from './components/Telepresence/doc-page';

const index = ({ data, location, pageContext }) => {
  if (data.mdx.fields.linksslug === '/telepresence/1.0/') return <DocPage location={location} data={data} pageContext={pageContext} />
  return <Home data={data} location={location} pageContext={pageContext} />;
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
        title
        description
        reading_time
        hide_reading_time
        reading_time_text
        indexable
        title
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
