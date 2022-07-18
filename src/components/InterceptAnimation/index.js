import React, { useEffect, lazy, useState, Suspense } from 'react';

function InterceptAnimationLazy(props) {
  const [Component, setComponent] = useState(null);
  const [ReactSuspense, setSuspense] = useState(null);

  const FallBack = () => <div>Loading...</div>;

  useEffect(() => {
    const lazyComp = lazy(() => import(`./InterceptsAnimation`));
    setComponent(lazyComp);
    setSuspense(Suspense);
  }, []);
  return (
    <>
      {Component && ReactSuspense ? (
        <ReactSuspense fallback={<FallBack />}>
          <Component {...props} />
        </ReactSuspense>
      ) : (
        <FallBack />
      )}
    </>
  );
}

export default InterceptAnimationLazy;
