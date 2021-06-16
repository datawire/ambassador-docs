import React, { useMemo } from 'react';
import { Link } from 'gatsby';
import Release from './Release';

const ReleaseNotes = ({
  releases,
  images,
  product,
  handleViewMore,
  changelog: changelogURL,
  versions,
}) => {
  const title = useMemo(() => {
    return `${versions.productName} Release Notes`;
  }, [versions]);

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
      <p>{changelog}</p>
      <div>
        {releases.map((release) => (
          <Release
            key={release.version}
            release={release}
            images={images}
            handleViewMore={handleViewMore}
            versions={versions}
          />
        ))}
      </div>
    </>
  );
};

export default ReleaseNotes;
