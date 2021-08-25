import React from 'react';
import { Helmet } from 'react-helmet';

import SearchIcon from './search.inline.svg';

export default function SearchBox(props) {
  const isMobile = React.useMemo(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 800 : true;
  }, []);

  React.useEffect(() => {
    const loadJS = () => {
      if (!isMobile) {
        if (window.docsearch) {
          window.docsearch({
            apiKey: '8f887d5b28fbb0aeb4b98fd3c4350cbd',
            indexName: 'getambassador',
            inputSelector: '#doc-search',
            debug: true,
          });
        } else {
          setTimeout(() => {
            loadJS();
          }, 500);
        }
      }
    };
    loadJS();
  }, [isMobile]);

  return (
    <div className="docs__search-box">
      <Helmet>
        {!isMobile && (
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.css"
            type="text/css"
            media="all"
          />
        )}
        {!isMobile && (
          <script
            defer
            src="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.js"
          ></script>
        )}
      </Helmet>
      <SearchIcon />
      <input
        name="search"
        type="text"
        placeholder="Search documentation"
        id="doc-search"
      />
    </div>
  );
}
