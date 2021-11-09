import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';
import isAesPage from '../utils/isAesPage';

import '../style.less';




const ShowAesPage = (props) => {


  const [showAesPage, setShowAesPage] = useState('');

  useEffect(() => {
    isAesPage(props.initialProduct, props.slug, props.initialVersion).then((result) => 
      setShowAesPage(result)
      );
      console.log("here", showAesPage)
  }, [props.initialProduct, props.initialVersion, props.slug]);
  
  return (
    <>
      {showAesPage !== undefined && showAesPage &&
       <Link className="doc-tag aes" to="/editions">
        Ambassador Edge Stack
      </Link>}
    </>
  );
};

export default ShowAesPage;