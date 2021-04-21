import React, { useState, useEffect } from 'react';

import Icon from '../../../src/components/Icon';
import Flyout from '../../../src/components/Flyout';
import Item from './Item';

interface IVersion {
    id: string;
    name: string;
}

export interface ITopicItem {
    title: string;
    link?: string;
    items?: ITopicItem[];
}

interface ISidebarProps {
    onVersionChanged: (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        value?: string
    ) => void;
    version: IVersion;
    versionList: IVersion[];
    topicList: ITopicItem[];
    slug: string;
}

const Sidebar: React.FC<ISidebarProps> = ({
    onVersionChanged,
    version,
    versionList,
    topicList,
    slug
}): JSX.Element => {
    const [isVersionOpen, setIsVersionOpen] = useState<boolean>(false);
    const [height, setHeight] = useState<Number>(0);

    useEffect(() => {
        const updateHeight = () => {
            const newHeight = versionList.length > 1 ? window.innerHeight - 202 : window.innerHeight - 152;
            setHeight(newHeight);
        }

        updateHeight();
        window.addEventListener("resize", updateHeight);

        return () => window.removeEventListener("resize", updateHeight);

    }, []);

    const getLinkId = (item: ITopicItem) => item.link ? item.link : item.title.replace(/\s+/g, '-').toLowerCase();

    const refs = topicList.reduce((item, value) => {
        const link = getLinkId(value);
        item[link] = React.createRef();
        return item;
    }, {});

    const handleScrollTopic = link => {
        const refCurrent = refs[link].current as HTMLButtonElement;
        if (refCurrent) {
            refCurrent.scrollIntoView({
                behavior: "auto",
                block: "start"
            });
        }
    };

    const handleVersionClick = () => setIsVersionOpen(!isVersionOpen);

    const handleSelectVersion = (e, value) => {
        setIsVersionOpen(false);
        onVersionChanged(e, value);
    };

    const handleClose = (e) => setIsVersionOpen(false);

    return (
        <div className="docs__doc-sidebar docs__desktop">
            {versionList.length > 1 && <div className="docs__version">
                <label
                    className={
                        isVersionOpen
                            ? 'docs__version-title docs__version-title--active'
                            : 'docs__version-title'
                    }
                    onClick={handleVersionClick}
                >
                    <Icon
                        name="version-icon"
                        className="docs__version-title__version-icon"
                    />
          Version: {version.name}
                    <Icon
                        name="chevron-down"
                        className="docs__version-title__chevron-icon"
                    />
                </label>
                {isVersionOpen && (
                    <>
                        <div className="flyout__overlay" onClick={handleClose}></div>
                        <Flyout
                            options={versionList}
                            onSelect={handleSelectVersion}
                            selected={version.id}
                        />
                    </>
                )}
            </div>}
            <div className="docs__topic-list-content" style={{ height: `${height}px` }}>
                <ul className="docs__topic-list">
                    {topicList.map((topic) => (
                        <Item
                            item={topic}
                            key={topic.title}
                            slug={slug}
                            version={version.id}
                            scrollView={handleScrollTopic}
                            refs={refs[getLinkId(topic)]}
                            parentLink={getLinkId(topic)}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;