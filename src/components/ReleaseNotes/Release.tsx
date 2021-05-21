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

const Release = ({ release, images }) => {
  const formattedDate = useMemo(() => {
    const date = new Date(release.date);
    const year = date.getFullYear();
    const dt = date.getDate();
    return `${month[date.getMonth()]} ${dt}, ${year}`;
  }, [release.date]);

  return (
    <div className={styles.release}>
      <h2>
        {release.version && (
          <>
            Version {release.version}{' '}
            <span className={styles.release__date}>({formattedDate})</span>
          </>
        )}
        {!release.version && formattedDate}
      </h2>
      <div>
        {release.notes.map((note, index) => (
          <Note note={note} key={index} images={images} />
        ))}
      </div>
    </div>
  );
};

export default Release;
