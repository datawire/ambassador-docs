import React from 'react';
import { graphql } from 'gatsby';
import Home from './components/Home'

const index = ({ data, location, pageContext }) => {
  return (
    <Home
      data={data}
      location={location}
      pageContext={pageContext}
    />
  )
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
