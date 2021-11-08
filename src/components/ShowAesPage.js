import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import isAesPage from '../utils/isAesPage';

import '../style.less';




const showAesPage = (props) => {


  const [showAesPage, setShowAesPage] = useState('');

  useEffect(() => {
    isAesPage(props.initialProduct, props.slug, props.initialVersion).then((result) => 
      setShowAesPage(result)
      );
  }, [props.initialProduct, props.initialVersion, props.slug]);
  
  return (
    <>
      {showAesPage !== undefined &&
       <Link className="doc-tag aes" to="/editions">
        Ambassador Edge Stack
      </Link>}
    </>
  );
};

export default showAesPage;