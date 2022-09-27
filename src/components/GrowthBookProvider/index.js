import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import { useLocation } from '@reach/router';
import { nanoid } from 'nanoid';
import React, { useEffect } from 'react';

import { useAppDispatch, setFeatureFlags } from '../../../../src/context';

const sendEvent = ({ label, action, location }) => {
  dataLayer.push({
    event: 'experiment',
    event_category: 'experiment',
    event_label: label,
    event_action: action,
    location,
  });
};

const growthbook = new GrowthBook({
  trackingCallback: (experiment, result) => {
    //Custom tracking events
  },
});

const allowedPathNames = ['/', '/contact-us/'];

const GrowthBookProviderWrapper = ({ userId, children }) => {
  const dispatch = useAppDispatch();
  const DAYS_TO_EXPIRE = 30;
  const fetchFeatures = () => {
    console.log('Here fetchFeatures', process.env.GATSBY_GROWTHBOOK_URL);
    fetch(process.env.GATSBY_GROWTHBOOK_URL)
      .then((res) => res.json())
      .then((json) => {
        growthbook.setFeatures(json.features);
        setAttributes();
      })
      .catch((error) => {
        setFeatureFlags(dispatch, true);
        console.log(error);
      });
  };

  const setAttributes = () => {
    const deviceId = getDeviceId();
    growthbook.setAttributes({
      deviceId,
      id: userId ?? deviceId,
    });
    setFeatureFlags(dispatch, true);
  };

  const setLocalStorage = (now) => {
    const item = {
      id: `${nanoid()}${now.getTime()}`,
      expiry: now.getTime() + DAYS_TO_EXPIRE * 60000,
    };
    localStorage.setItem('gbId', JSON.stringify(item));
    return item.id;
  };

  const getDeviceId = () => {
    const itemStr = localStorage.getItem('gbId');
    const now = new Date();
    if (!itemStr) {
      return setLocalStorage(now);
    }
    const item = JSON.parse(itemStr);
    if (now.getTime() > item?.expiry) {
      return setLocalStorage(now);
    }
    return item.id;
  };

  const { pathname } = useLocation();

  useEffect(() => {
    const isValidPath = allowedPathNames.includes(pathname);
    console.log('Here useEffect', isValidPath, pathname);
    if (isValidPath) {
      fetchFeatures();
    } else {
      setFeatureFlags(dispatch, true);
    }
  }, []);

  return (
    <GrowthBookProvider growthbook={growthbook}>{children}</GrowthBookProvider>
  );
};
export { sendEvent };
export default GrowthBookProviderWrapper;
