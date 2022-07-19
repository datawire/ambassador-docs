import React from 'react';
import { graphql } from 'gatsby';
import ReleaseNotesTemplate from './components/ReleaseNotes/release-notes';

const releaseNotesArchive = ({ data, location, pageContext }) => {
  return (
    <ReleaseNotesTemplate 
      data={data}
      location={location}
      pageContext={pageContext}
    />
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
          type
        }
      }
      slug
    }
  }
`;

export default releaseNotesArchive;