import React, { useMemo } from 'react';

import Note from './Note';
import * as styles from './releaseNotes.module.less';
import getDate from '../../utils/getDate';

const Release = ({ release, handleViewMore, versions }) => {
  const formattedDate = useMemo(() => {
    return release.date ? getDate(release.date) : ''
  }, [release.date]);

  return (
    <div className={styles.release}>
      <h2 id={release.version || release.date}>
        {release.version && (
          <>
            Version {release.version}{' '}
            {formattedDate && (
              <span className={styles.release__date}>({formattedDate})</span>
            )}
          </>
        )}
        {!release.version && formattedDate}
      </h2>
      <div>
        {release.notes.map((note, index) => (
          <Note
            note={note}
            key={index}
            onViewMore={() => handleViewMore(note)}
            versions={versions}
          />
        ))}
      </div>
    </div>
  );
};

export default Release;
