import React, { useState} from 'react';
import template from '../../../src/utils/template';
import Scrollspy from "react-scrollspy";
import { useEffect } from 'react';

const ContentTable = ({
  items,
  versions,
}) => {

  const formatString = (title) => {
    if (title) {
    const formatedTitle = title.replace(/<\/?[^>]+(>|$)|\d../g, "");
    return template(formatedTitle, versions);
    }
  }

  const rootElement = ".docs__doc-body-container";
  const [active, setActive] = useState("");
  let content = items && items[0].items ? items[0].items : [];
  let ids = content.map(c => c["url"] && c["url"].substring(1));

  const onActive = id => {
    let value = "#" + id;
    setActive(value)
  }

  const onClick = (ev) => {
      ev.preventDefault();
      const frag = ev.target.id.substr(1);
      const target = document.getElementById(frag);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
        });
      }
    };

  return (
    <ScrollSpyWrapper items={ids} rootEl={rootElement} onUpdate={onActive}>
      {content.map(i => (
        <li key={i.url} className={active === i.url && "current"}>
          <a href={i.url} id={i.url} onClick={onClick}>{formatString(i.title)}</a>
        </li>
      ))}
    </ScrollSpyWrapper>
  )


};

const ScrollSpyWrapper = ({ children, onUpdate, ...rest }) => {
  return (
    <ul>
      <Scrollspy {...rest} onUpdate={e => e && onUpdate(e.getAttributeNode("id").value)} />
      {children}
    </ul>
  )
}


export default ContentTable;