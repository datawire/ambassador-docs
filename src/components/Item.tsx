import React, { useState, useMemo, useEffect } from 'react';
import url from 'url';

import Icon from '../../../src/components/Icon';
import Link from '../../../src/components/Link';

import { ITopicItem } from './Sidebar';

interface IItemProp {
  item: ITopicItem;
  slug: string;
  version: string;
  scrollView: (link: string) => void;
  refs?: React.LegacyRef<HTMLButtonElement>;
  parentLink: string;
}

const Item: React.FC<IItemProp> = ({
  item,
  slug,
  version,
  scrollView,
  refs,
  parentLink,
}): JSX.Element => {
  const slugs = slug.split('/');
  const slugPath = slugs.slice(4).join('') || '';
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [itemRemoved, setItemRemoved] = useState<string>('');
  const [itemToClose, setItemToClose] = useState<string>('');

  const isActive = (link: string): boolean => {
    const linkPath = link || '';
    setIsExpanded(isExpandedInStorage(linkPath));
    return (
      linkPath !== '' &&
      slugPath.replace(/\//g, '') === linkPath.replace(/\//g, '')
    );
  };

  const isExpandedInStorage = (link: string): boolean => {
    if (typeof window !== 'undefined') {
      const links = JSON.parse(sessionStorage.getItem('expandedItems')) || [];
      return links.includes(link);
    }
  };

  const addToStorage = (link: string) => {
    if (link === itemRemoved || typeof window === 'undefined') {
      return;
    }
    const links = JSON.parse(sessionStorage.getItem('expandedItems')) || [];
    if (!links.includes(link)) {
      const newLinks = JSON.stringify([...links, link]);
      sessionStorage.setItem('expandedItems', newLinks);
    }
  };

  const removeFromStorage = (link: string) => {
    const links = JSON.parse(sessionStorage.getItem('expandedItems')) || [];
    const newLinks = JSON.stringify(links.filter((i) => i !== link));
    setItemRemoved(link);
    sessionStorage.setItem('expandedItems', newLinks);
  };

  const isChildActive = useMemo((): boolean => {
    let result = false;
    function checkChildActive(item: ITopicItem) {
      if (isActive(item.link)) {
        addToStorage(item.link);
        result = true;
      }
      !result &&
        item?.items?.length &&
        item.items.forEach((i) => {
          checkChildActive(i);
        });
    }
    item.link !== itemToClose && checkChildActive(item);
    return result;
  }, [item]);

  const [isOpen, setIsOpen] = useState<boolean>(isChildActive);

  useEffect(() => {
    scroll();
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    open: boolean,
    link: string,
  ) => {
    if (open) {
      removeFromStorage(link);
      link && setItemToClose(link);
    }
    setIsOpen(!open);
  };

  const handleClickLink = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    link: string,
  ) => {
    if (link.replace(/\//g, '') === slugPath) {
      e.preventDefault();
    }
  };

  const getLink = (link: string, linkContent: JSX.Element): JSX.Element => {
    if (link) {
      let cleanlink = link;

      // HACK: For backward-compatibility with existing docs,
      // ignore the leading slash, and treat it as relative
      if (cleanlink.startsWith('/')) {
        cleanlink = cleanlink.slice(1);
      }

      // Relative links are relative to `/docs/${product}/${version}/`,
      // rather than being relative to the current page.
      cleanlink = url.resolve(
        `/${slugs[1]}/${slugs[2]}/${version}/`,
        cleanlink,
      );

      // We want an onClick handler for internal links only.
      const onClick = cleanlink.startsWith('https://')
        ? null
        : (e) => handleClickLink(e, link);

      return (
        <Link to={cleanlink} onClick={onClick}>
          <div>{linkContent}</div>
        </Link>
      );
    }
    return linkContent;
  };

  const linkContent = item.items ? (
    !isOpen && !isExpanded ? (
      <>
        {item.title}
        <Icon name="carat-toc-item" className="docs__topic-item__icon" />
      </>
    ) : (
      <>
        {item.title}
        <Icon
          name="carat-toc-item"
          className="docs__topic-item__icon docs__topic-item__icon--open"
        />
      </>
    )
  ) : (
    <span className="docs__topic-item__no-icon">{item.title}</span>
  );

  const btnClasses = useMemo(() => {
    const classes = [];
    isOpen && classes.push('docs__topic-item--selected');
    isActive(item.link) && classes.push('docs__topic-item--current');
    return classes;
  }, [isOpen, item.link]);

  const scroll = () =>
    isActive(item.link) ? scrollView(parentLink) : undefined;

  return (
    <li className="docs__topic-item">
      <button
        onClick={(e) => handleClick(e, isOpen, item.link)}
        className={btnClasses.join(' ')}
        ref={refs}
      >
        {getLink(item.link, linkContent)}
      </button>
      {item.items && (isOpen || isExpanded) && (
        <div className="docs__topic-item_submenu">
          <>
            <div className="docs__topic-item_submenu_lineThickness" />
            <ul className="docs__topic-list">
              {item.items.map((i) => (
                <Item
                  item={i}
                  key={i.title}
                  slug={slug}
                  version={version}
                  scrollView={scrollView}
                  parentLink={parentLink}
                />
              ))}
            </ul>
          </>
        </div>
      )}
    </li>
  );
};

export default Item;
