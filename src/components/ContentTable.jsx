import React, { useState } from 'react';
import Scrollspy from 'react-scrollspy';

import template from '../../../src/utils/template';

const ContentTable = ({ items, versions }) => {
  const formatString = (title) => {
    if (title) {
      const formatedTitle = title.replace(/<\/?[^>]+(>|$)|\d../g, '');
      return template(formatedTitle, versions);
    }
  };

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
      target.scrollIntoView({
        behavior: 'smooth',
      });
      if (window.location.hash !== ev.target.id) {
        window.history.pushState(null, '', ev.target.id);
      }
    }
  };

  return (
    <ScrollSpyWrapper items={ids} rootEl={rootElement} onUpdate={onActive}>
      {content.map((i) => (
        <li key={i.url} className={active === i.url ? 'current' : undefined}>
          <a href={i.url} id={i.url} onClick={onClick}>
            {formatString(i.title)}
          </a>
        </li>
      ))}
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
