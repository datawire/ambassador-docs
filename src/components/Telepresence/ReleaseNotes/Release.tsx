import React from 'react';
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

const Release = ({ release }) => {
  const formattedDate = (() => {
    if (release.date) {
      const [yyyy, mm, dd] = release.date.split('-');
      if (yyyy && mm && dd) {
        return `${month[Number(mm - 1)]} ${dd}, ${yyyy}`;
      }
    }
    return '';
  })();

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
          <Note key={index} note={note} />
        ))}
      </div>
    </div>
  );
};

export default Release;
