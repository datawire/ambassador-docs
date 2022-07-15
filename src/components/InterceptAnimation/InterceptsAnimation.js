import React from 'react';

import InterceptAnimationSVG from '../../assets/images/intercept-animation.inline.svg';

function Animation(props) {
  const el = React.useRef(null);
  React.useEffect(() => {
    const queueAnimation = () => {
      setTimeout(() => {
        el.current?.getAnimations({ subtree: true })?.forEach((anim) => {
          anim.finish();
          anim.play();
        });
        queueAnimation();
      }, 3000);
    };
    queueAnimation();
  }, el);
  return (
    <div ref={el} style={{ textAlign: 'center' }}>
      <InterceptAnimationSVG
        style={{ maxWidth: '700px' }}
        {...props}
        loading="lazy"
      />
    </div>
  );
}

export default Animation;
