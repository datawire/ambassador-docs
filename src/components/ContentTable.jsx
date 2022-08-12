import React, { useState } from 'react';
import Scrollspy from 'react-scrollspy';

const ContentTable = ({ items, location }) => {
  const rootElement = '.docs__doc-body-container';
  const [active, setActive] = useState('');
  let content = items && items[0].items ? items[0].items : [];
  let ids = content.map((c) => c['url'] && c['url'].substring(1));

  const onActive = (id) => {
    let value = '#' + id;
    setActive(value);
  };

  const onClick = (ev) => {
    const frag = ev.target.id.substr(1);
    const target = document.getElementById(frag);
    if (target) {
      ev.preventDefault();
      const position = target.getBoundingClientRect();
      const body = document.body.getBoundingClientRect();

      window.scroll({
        top: position.top - body.top - 140,
        behavior: 'smooth',
      });

      if (window.location.hash !== ev.target.id) {
        window.history.pushState(null, '', ev.target.id);
      }
    }
  };

  const selectProductUrl = (contentElement) => {
    if (contentElement.url.includes('productname')) {
      if (location.pathname.includes('edge-stack')) {
        contentElement.url = contentElement.url.replace(
          'productname',
          'ambassador-edge-stack',
        );
      }
      if (location.pathname.includes('emissary')) {
        contentElement.url = contentElement.url.replace(
          'productname',
          'emissary-ingress',
        );
      }
    }
  };

  const ContentMap = ({ content }) => {
    return content.map((contentElement) => {
      selectProductUrl(contentElement);
      return (
        <li
          key={contentElement.url}
          className={active === contentElement.url ? 'current' : undefined}
        >
          <a
            href={contentElement.url}
            id={contentElement.url}
            onClick={onClick}
          >
            {contentElement.title}
          </a>
        </li>
      );
    });
  };

  return (
    <ScrollSpyWrapper items={ids} rootEl={rootElement} onUpdate={onActive}>
      <ContentMap content={content} />
    </ScrollSpyWrapper>
  );
};

const ScrollSpyWrapper = ({ children, onUpdate, ...rest }) => {
  return (
    <ul>
      <Scrollspy
        {...rest}
        onUpdate={(e) => e && onUpdate(e.getAttributeNode('id').value)}
      />
      {children}
    </ul>
  );
};

export { ScrollSpyWrapper };

export default ContentTable;
