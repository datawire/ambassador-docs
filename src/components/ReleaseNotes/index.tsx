import React from 'react';
import Release from './Release';

const ReleaseNotes = ({ releases, images }) => {
  return (
    <>
      <h1>Release Notes</h1>
      <div>
        {releases.map((release) => (
          <Release key={release.version} release={release} images={images}/>
        ))}
      </div>
    </>
  );
};

export default ReleaseNotes;
