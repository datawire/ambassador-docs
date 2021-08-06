import React, { useState, useEffect } from 'react';
import template from '../../../src/utils/template';


export interface IItems {
  url: string;
  title: string;
  items: IItems[]
}
interface IContentTable {
  items: IItems[];
  versions: IVersion;

}
interface IVersion {
  AESproductName: string;
  AESproductNamePlural: string;
  OSSproductName: string;
  OSSproductNamePlural: string;
  aproVersion: string;
  branch: string;
  docsVersion: string;
  productName: string;
  productNamePlural: string;
  qotmVersion: number;
  quoteVersion: string;
  version: string;
}


const ContentTable: React.FC<IContentTable> = ({
  items,
  versions,
}): JSX.Element => {

  const formatString = (title) => {
    title = title.replace(/<\/?[^>]+(>|$)/g, "");
    return template(title, versions);
  }

  let previousY = 0;
  let previousRatio = 0;

  let contentItems = [];

  const [currentElement, setCurrentElement] = useState("");

  const callback = (entries) => {
    entries.forEach(entry => {
      const currentY = entry.boundingClientRect.y
      const currentRatio = entry.intersectionRatio
      if (entry.isIntersecting) {
        if (currentY < previousY && currentRatio < previousRatio) {
          setCurrentElement(entry.target.id);
        }
        else if (currentY > previousY && currentRatio > previousRatio) {
          const index = contentItems.indexOf(entry.target.id);
          setCurrentElement(contentItems[index > 0 ? index - 1 : 0]);
        }
      }
      previousY = currentY;
      previousRatio = currentRatio;
    })
  }

  const thresholdArray = steps => Array(steps + 1)
    .fill(0)
    .map((_, index) => index / steps || 0)

  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold: thresholdArray(20),
    });
    const observe = (id: string) => {
      id = id.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        contentItems.push(id);
      }
    }
    const addObserverToItem = (Items: IItems[]) => {
      Items?.forEach(e => {
        observe(e.url);
        addObserverToItem(e.items);
      });
    }
    addObserverToItem(items);
  }, []);


  const showItems = (Items) => {
    return (
      <ul>
        {Items?.map(e => {
          const id = e.url.replace("#", "");
          return <>
            <li key={"ct-" + id}>
              <a href={e.url} onClick={() => setCurrentElement(id)} style={currentElement === id ? { color: "green" } : null}>{formatString(e.title)}</a>
            </li>
            {showItems(e.items)}
          </>
        })}
      </ul>
    );
  }

  return showItems(items);
};

export default ContentTable;