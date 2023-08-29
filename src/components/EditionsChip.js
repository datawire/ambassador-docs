import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';

import '../style.less';
import isAesPage from '../utils/isAesPage';
import getCloudFeatures from '../utils/getCloudFeatures';

const EditionsChip = props => {
  const [showAesPage, setShowAesPage] = useState('');
  const [showCloudPage, setShowCloudPage] = useState({ show: false, label: '' });
  const title = showAesPage ? 'Ambassador Edge Stack' : showCloudPage.label;

  useEffect(() => {
    isAesPage(props.initialProduct, props.slug, props.initialVersion).then(result => setShowAesPage(result));
    getCloudFeatures(props.initialProduct, props.slug).then(
      label => label?.length > 0 && setShowCloudPage({ show: true, label })
    );
  }, [props.initialProduct, props.initialVersion, props.slug]);

  return (
    <>
      {((showAesPage !== undefined && showAesPage) || showCloudPage.show) && (
        <Link className="doc-tag aes" to="/editions">
          {title}
        </Link>
      )}
    </>
  );
};

export default EditionsChip;