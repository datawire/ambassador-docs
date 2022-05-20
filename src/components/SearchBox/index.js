import React from 'react';
import { Helmet } from 'react-helmet';

import SearchIcon from './search.inline.svg';

export default function SearchBox(props) {
  const inputSelector = props.selector || "doc-search";

  const isMobile = React.useMemo(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 800 : true;
  }, []);

  React.useEffect(() => {
    const loadJS = () => {
      // Might fail if window.docsearch isn't set yet or if the DOM
      // hasn't been updated yet to include the #doc-search element.
      // If that happens, just back off and try again.
      try {
        window.docsearch({
          apiKey: '2d9b93b7b8cd30ed7cdb18683b8c5150',
          appId: 'HEP1UCV302',
          indexName: 'getambassador',
          inputSelector: `#${inputSelector}`,
          debug: true,
        });
      } catch {
        setTimeout(loadJS, 500);
      }
    };
    loadJS();
  }, [isMobile]);

  return (
    <div className="docs__search-box">
      <Helmet>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.css"
          type="text/css"
          media="all"
        />
        <script
          defer
          src="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.js"
        ></script>
      </Helmet>
      <SearchIcon loading='lazy'/>
      <input
        name="search"
        type="text"
        placeholder="Search documentation"
        id={inputSelector}
      />
    </div>
  );
}
