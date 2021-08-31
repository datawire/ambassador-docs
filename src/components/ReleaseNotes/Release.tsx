import React, { useMemo } from 'react';

import Note from './Note';
import styles from './releaseNotes.module.less';

const month = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const Release = ({ release, handleViewMore, versions }) => {
  const formattedDate = useMemo(() => {
    if (release.date) {
      const [yyyy, mm, dd] = release.date.split('-');
      if (yyyy && mm && dd) {
        return `${month[Number(mm - 1)]} ${dd}, ${yyyy}`;
      }
    }
    return '';
  }, [release.date]);

  return (
    <div className={styles.release}>
      <h2>
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
