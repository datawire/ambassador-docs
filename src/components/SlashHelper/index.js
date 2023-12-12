import { useLocation } from '@reach/router';
import { navigate } from 'gatsby';
import React from 'react';

// Putting a <SlashHelper/> in a page ensures that the page URL has a
// trailing slash.
export default function SlashHelper(props) {
  const location = useLocation();
  React.useEffect(() => {
    if (!location.pathname.endsWith('/')) {
      navigate(`${location.pathname}/${location.search}${location.hash}`, {
        replace: true,
      });
    }
  }, [location]);

  return <></>;
}
