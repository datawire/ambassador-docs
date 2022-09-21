import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import { useLocation } from '@reach/router';
import { nanoid } from 'nanoid';
import React, { useEffect } from 'react';

import {
  useAppState,
  useAppDispatch,
  setFeatureFlags,
} from '../../../../src/context';

const growthbook = new GrowthBook({
  trackingCallback: (experiment, result) => {
    dataLayer.push({
      event: 'experiment_viewed',
      event_category: 'experiment',
      event_label: result.variationId,
      event_action: experiment.key,
      dimension1: experiment.key + ':' + result.variationId,
    });
    console.log('AQUI=>12334', dataLayer);
  },
});

const allowedPathNames = ['/'];

const GrowthBookProviderWrapper = ({ userId, children }) => {
  const dispatch = useAppDispatch();
  const DAYS_TO_EXPIRE = 30;
  const fetchFeatures = () => {
    fetch('https://cdn.growthbook.io/api/features/key_prod_6bfe1855be94f2e5')
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
export { allowedPathNames };
export default GrowthBookProviderWrapper;
