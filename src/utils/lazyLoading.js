import React, { useEffect, lazy, useState, Suspense } from 'react';

const LazyLoading = ({ importPath, Fallback, ...rest }) => {
  const [Component, setComponent] = useState(null);
  const [ReactSuspense, setSuspense] = useState(null);

  useEffect(() => {
    const lazyComp = lazy(() => import(importPath));
    setComponent(lazyComp);
    setSuspense(Suspense);
  }, []);
  return (
    <>
      {Component && ReactSuspense ? (
        <ReactSuspense fallback={<FallBack />}>
          <Component {...rest} />
        </ReactSuspense>
      ) : (
        <FallBack />
      )}
    </>
  );
};

export default LazyLoading;
