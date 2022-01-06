import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import React from 'react';

import * as styles from './styles.module.less';
import * as allTabs from './tabs';

let publicTabs = { ...allTabs };
delete publicTabs.AbstractTab;
delete publicTabs.UnknownTab;

function detectUserOS(window) {
  // Ordering here isn't too important, but for sanity it should
  // probably be stable.
  const tabs = Object.values(publicTabs).sort((a, b) => {
    return a.order - b.order;
  });
  for (const tab of tabs) {
    if (tab.detect(window)) {
      return tab.slug;
    }
  }
  return allTabs.UnknownTab.slug;
}

function isValidTab(element) {
  return (
    React.isValidElement(element) &&
    element.type.prototype instanceof allTabs.AbstractTab
  );
}

const Context = React.createContext();

function Provider({ children, ...props }) {
  const [state, setState] = React.useState({
    curTab: null,
    setTab: null,
    doAutoDetect: true,
  });
  if (!state.setTab) {
    state.setTab = (newTab) => {
      window.history.replaceState(
        null,
        '',
        `?os=${newTab}${window.location.hash}`,
      );
      setState({
        curTab: newTab,
        doAutoDetect: false,
      });
    };
  }

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (
      Object.values(publicTabs)
        .map((cls) => cls.slug)
        .includes(query.get('os'))
    ) {
      if (state.doAutoDetect || state.curTab !== query.get('os')) {
        setState({
          curTab: query.get('os'),
          doAutoDetect: false,
        });
      }
    } else if (state.doAutoDetect) {
      const newTab = detectUserOS(window);
      if (newTab !== state.curTab) {
        setState({ curTab: newTab });
      }
    }
  }, [state, setState]);

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

function TabGroup({ children, ...props }) {
  // Do some preliminary input validation.
  if (children.length < 1) {
    console.error('Platform.TabGroup: Must have at least 1 child tab');
    throw new Error('Platform.TabGroup: Must have at least 1 child tab');
  }
  const badChild = children.find((child) => !isValidTab(child));
  if (badChild) {
    console.error('Platform.TabGroup: Illegal child', badChild);
    throw new Error('Platform.TabGroup: Illegal child');
  }
  const slugs = new Set(children.map((child) => child.type.slug));
  if (slugs.size < children.length) {
    throw new Error(
      'Platform.TabGroup: Has multiple children of the same type',
    );
  }

  // OK, now actually do the work.

  const sortedChildren = [...children].sort((a, b) => {
    return a.type.order - b.type.order;
  });

  let { curTab, setTab } = React.useContext(Context);

  if (!curTab) {
    // This is essentially the noscript case, which is important to
    // support because of the broken link checker.
    return (
      <div className={styles.TabGroup}>
        {sortedChildren.map((child) => {
          const Icon = child.type.icon;
          return (
            <details key={child.type.slug}>
              <summary className={styles.TabHead}>
                <Icon />
                {child.type.label}
              </summary>
              <div className="TabBody">{child.props.children}</div>
            </details>
          );
        })}
      </div>
    );
  }

  if (!slugs.has(curTab)) {
    const defaultChild = [...children].sort(
      (a, b) => b.type.priority - a.type.priority,
    )[0];
    curTab = defaultChild.type.slug;
  }

  const handleChange = (ev, newTab) => {
    setTab(newTab);
  };

  return (
    <div className={styles.TabGroup}>
      <TabContext value={curTab}>
        <AppBar elevation={0} position="static" className={styles.TabBar}>
          <TabList onChange={handleChange} aria-label="operating system tabs">
            {sortedChildren.map((child) => {
              const Icon = child.type.icon;
              return (
                <Tab
                  key={child.type.slug}
                  value={child.type.slug}
                  icon={<Icon />}
                  label={child.type.label}
                  className={styles.TabHead}
                />
              );
            })}
          </TabList>
        </AppBar>
        {sortedChildren.map((child) => {
          return (
            <TabPanel
              key={child.type.slug}
              value={child.type.slug}
              className="TabBody"
            >
              {child.props.children}
            </TabPanel>
          );
        })}
      </TabContext>
    </div>
  );
}

export default {
  Provider,
  TabGroup,
  ...publicTabs,
};
