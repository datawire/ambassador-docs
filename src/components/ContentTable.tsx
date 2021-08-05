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

  const showItems = (Items) => {
    return (
      <ul>
        {Items?.map(e => {
          return <>
            <li>
              <a href={e.url}>{formatString(e.title)}</a>
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