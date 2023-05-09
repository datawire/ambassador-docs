import { Script, ScriptStrategy } from 'gatsby';
import React from 'react';
import { Helmet } from 'react-helmet';

import SearchIcon from './search.inline.svg';

export default function SearchBox(props) {
  const inputSelector = props.selector || 'doc-search';

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
          apiKey: process.env.GATSBY_ALGOLIA_API_KEY,
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
      <Script
        id="doc-search-id"
        strategy={ScriptStrategy.idle}
        src="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.js"
      />
      <Helmet>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.css"
          type="text/css"
          media="print"
          onload="this.media='all'"
        />
      </Helmet>
      <SearchIcon loading="lazy" />
      <input
        name="search"
        type="text"
        placeholder="Search documentation"
        id={inputSelector}
      />
    </div>
  );
}
