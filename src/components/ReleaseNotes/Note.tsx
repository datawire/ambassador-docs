import React, { useMemo } from 'react';

import Button from '../../../../src/components/Button/Button';
import Icon from '../../../../src/components/Icon/Icon';
import { isBrowser } from '../../../../src/utils/isBrowser';
import template from '../../../../src/utils/template';

import * as styles from './releaseNotes.module.less';

const titlePrefix = {
  bugfix: 'Bug Fix',
  change: 'Change',
  feature: 'Feature',
  security: 'Security Update',
};

const typeIcon = {
  bugfix: 'bug',
  change: 'change',
  feature: 'tada',
  security: 'security',
};

const Note = ({ note, onViewMore, versions }) => {
  const title = useMemo(() => {
    if (titlePrefix[note.type] && note.image) {
      return `${titlePrefix[note.type]}: ${note.title}`;
    }
    return note.title;
  }, [note.title, note.type, note.image]);

  return (
    <div className={styles.note}>
      <div className={styles.note__description}>
        <h3
          className={
            note.docs || note.href
              ? styles.note__title
              : styles.note__title_no_link
          }
          onClick={onViewMore}
        >
          {typeIcon[note.type] && (
            <Icon
              name={typeIcon[note.type]}
              className={styles.note__typeIcon}
            />
          )}
          <span>{title}</span>
        </h3>
        <div
          className={styles.note__body}
          dangerouslySetInnerHTML={{ __html: template(note.body, versions) }}
        />
        {note.image && (
          <div className={styles.note__image_xs}>
            <img
              alt={note.title}
              height="172"
              width="207"
              src={(isBrowser ? window.location : '') + '/' + note.image}
            />
          </div>
        )}
      </div>
      {note.image && (
        <div className={styles.note__image}>
          <img
            src={(isBrowser ? window.location : '') + '/' + note.image}
            alt={note.title}
            height="172"
            width="207"
          />
        </div>
      )}
    </div>
  );
};

export default Note;
