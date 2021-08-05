import React, { useState, useEffect } from 'react';

export interface IItems {
  url: string;
  title: string;
  items: IItems[]
}

interface IContentTable {
  items: IItems[];
}

const ContentTable: React.FC<IContentTable> = ({
  items
}): JSX.Element => {

  const showItems = (Items) => {
    return (
      <ul>
        {Items?.map(e => {
          return <>
            <li>
              <a href={e.url}>{e.title}</a>
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