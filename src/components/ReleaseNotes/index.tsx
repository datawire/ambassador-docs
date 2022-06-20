import React, { useMemo } from 'react';

import Link from '../../../../src/components/Link';
import Release from './Release';

const ReleaseNotes = ({
  releases,
  product,
  handleViewMore,
  changelog: changelogURL,
  versions,
}) => {
  const title = useMemo(() => {
    if (versions.productName) {
      return `${versions.productName} Release Notes`;
    }

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
    const commonText = `For a detailed list of all the changes in past releases, please consult the`;

    if (changelogURL) {
      return (
        <>
          {commonText} <Link to={changelogURL}>CHANGELOG.</Link>
        </>
      );
    }

    return null;
  }, [product]);

  return (
    <>
      <h1>{title}</h1>
      <div>
        {releases.map((release) => (
          <Release
            key={release.version}
            release={release}
            handleViewMore={handleViewMore}
            versions={versions}
          />
        ))}
      </div>
      <p>{changelog}</p>
    </>
  );
};

export default ReleaseNotes;
