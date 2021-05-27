import React, { useMemo } from 'react';
import { Link } from 'gatsby';
import Release from './Release';

const getChangeLogUrl = (product) => {
  switch (product) {
    case 'edge-stack':
      return 'https://github.com/datawire/ambassador/blob/master/CHANGELOG.md';
    case 'telepresence':
      return 'https://github.com/telepresenceio/telepresence/blob/release/v2/CHANGELOG.md';
    case 'argo':
    case 'cloud':
    default:
      return null;
  }
};

const ReleaseNotes = ({ releases, images, product }) => {
  const title = useMemo(() => {
    switch (product) {
      case 'edge-stack':
        return 'Edge Stack Release Notes';
      case 'telepresence':
        return 'Telepresence Release Notes';
      case 'argo':
        return 'Argo Release Notes';
      case 'cloud':
        return 'Cloud Release Notes';
      default:
        return 'Release Notes';
    }
  }, [product]);

  const changelog = useMemo(() => {
    const commonText = `For a detailed list of all the changes in these releases, please consult the`;
    const url = getChangeLogUrl(product);

    if (url) {
      return (
        <>
          {commonText} <Link to={url}>CHANGELOG.</Link>
        </>
      );
    }

    return null;
  }, [product]);

  return (
    <>
      <h1>{title}</h1>
      <p>{changelog}</p>
      <div>
        {releases.map((release) => (
          <Release key={release.version} release={release} images={images} />
        ))}
      </div>
    </>
  );
};

export default ReleaseNotes;
