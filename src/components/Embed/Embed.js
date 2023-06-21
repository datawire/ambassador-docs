import classnames from 'classnames';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { YOUTUBE_LITE_URL } from '../../../../src/utils/urls';

import './lite-yt-embed.css';
import * as styles from './styles.module.less';

function isYoutubeVideo(url) {
  return (
    url?.includes('https://www.youtube.com/embed/') ||
    url?.includes('https://www.youtube-nocookie.com/embed/')
  );
}

const addScript = () => {
  const script = document.createElement('script');
  script.setAttribute('src', YOUTUBE_LITE_URL);
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('async', true);
  document.body.appendChild(script);
};

export default ({ code }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  useEffect(() => {
    addScript();
  }, []);

  if (!code) {
    return null;
  }

  const iFrameSrcRegEx = new RegExp(/src="([^"]*)"|src='([^']*)'/g);
  const [, url] = iFrameSrcRegEx.exec(code) || [];
  const baseClass = classnames(styles.wrapper, 'contained', 'contained_lg');
  // Treat YouTube embeds in a special way
  if (isYoutubeVideo(url)) {
    const urlArr = url.split('/');
    const youtubeId = urlArr[urlArr.length - 1];

    return (
      <div ref={ref} className={classnames(baseClass, styles.sixteenByNine)}>
        {inView && (
          <lite-youtube
            videoid={youtubeId}
            params="controls=1&modestbranding=2&rel=0&enablejsapi=1"
          />
        )}
      </div>
    );
  }
  return (
    <div
      ref={ref}
      className={baseClass}
      dangerouslySetInnerHTML={{ __html: inView && code }}
    ></div>
  );
};
