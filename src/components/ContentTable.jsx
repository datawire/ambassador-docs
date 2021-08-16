import React, { useState, useRef } from 'react';
import template from '../../../src/utils/template';
import Scrollspy from "react-scrollspy";
import { useEffect } from 'react';

const ContentTable = ({
  items,
  versions,
}) => {

  const formatString = (title) => {
    if (title) {
    title = title.replace(/<\/?[^>]+(>|$)/g, "");
    return template(title, versions);
    }
  }

  const rootElement = ".docs__doc-body-container";
  const [active, setActive] = useState("");
  let content = items && items[0].items ? items[0].items : [];
  let ids = content.map(c => c["url"] && c["url"].substring(1));
  const down = useScrollDirection(rootElement);


  const onActive = id => {
    let value = "#" + id;
    if (!down) {
      const index = ids.indexOf(id);
      value = index > 0 ? ids[index - 1] : ids[0];
      value = "#" + value;
    }
    setActive(value)
  }

  return (
    <ScrollSpyWrapper items={ids} rootEl={rootElement} onUpdate={onActive}>
      {content.map(i => (
        <li key={i.url} className={active === i.url && "current"}>
          <a href={i.url}>{formatString(i.title)}</a>
        </li>
      ))}
    </ScrollSpyWrapper>
  )


};


const useScrollDirection = (element) => {
  const prevPositionY = useRef();
  const [down, setDown] = useState(true);

  useEffect(() => {
    const root = document.querySelector(element);
    prevPositionY.current = 0;
    root.addEventListener("scroll", handleDirection);
  }, []);

  const handleDirection = e => {
    const positionY = e.srcElement.scrollTop;
    setDown(positionY > prevPositionY.current);
    prevPositionY.current = positionY;
  }

  return down;
}

const ScrollSpyWrapper = ({ children, onUpdate, ...rest }) => {
  return (
    <ul>
      <Scrollspy {...rest} onUpdate={e => e && onUpdate(e.getAttributeNode("id").value)} />
      {children}
    </ul>
  )
}


export default ContentTable;