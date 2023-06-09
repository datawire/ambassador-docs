import React from 'react';

import Icon from '../../../src/components/Icon';
import getEditOnPageUrls from '../utils/getEditOnpageUrls';

const DocsFooter = ({ page, product, version, edgeStackLinks }) => {
  // `page` is the `mdx` GraphQL node for this page.  I am not sure
  // under what conditions it may be unset.
  //
  // So, if `page` is set, then `page.parent.relativePath` is the
  // relative filepath under the `./ambassador-docs/` subtree.  So it
  // looks something like
  // `docs/${product}/${version}/{restOfFilePath}`.  Discard the
  // `docs/${product}/${version}/` prefix and re-add it later; the
  // version in .relativePath won't have the `latest` symlink
  // resolved, but our `version` parameter will.
  let restOfFilePath = page
    ? page.parent.relativePath.split('/').slice(3).join('/')
    : '';

  // Don't produce an edit link for generated files.
  if (restOfFilePath === 'licenses.md') {
    return <footer className="docs__footer"></footer>;
  }

  const teleDoc = page?.parent?.relativePath;
  let dstUrl;
  switch (product) {
    case 'telepresence':
      if (version === 'pre-release') {
        version = '2';
      }

      if (version === '0.109') version = '1';
      dstUrl = `https://github.com/datawire/ambassador-docs/blob/master/docs/${product}/${version}/${restOfFilePath}`;
      break;
    case 'edge-stack':
      const isValid = edgeStackLinks?.includes(
        `${product}/${version}/${restOfFilePath}`,
      );
      dstUrl = `https://github.com/datawire/ambassador-docs/blob/master/docs/${
        isValid ? product : 'emissary'
      }/${version}/${restOfFilePath}`;
      break;
    case 'code':
    case 'ship':
    case 'run':
      dstUrl = 'https://github.com/datawire/ambassador-docs/blob/master/docs';
      break;
    default:
      dstUrl = `https://github.com/datawire/ambassador-docs/blob/master/docs/${product}/${version}/${restOfFilePath}`;
      break;
  }

  switch (teleDoc) {
    case 'docs/telepresence/latest/extension/intro.md':
    case 'docs/telepresence/latest/extension/install.md':
    case 'docs/telepresence/latest/extension/intercept.md':
    case 'docs/telepresence/latest/extension/troubleshooting.md':
    case 'docs/telepresence/2.5/extension/intro.md':
    case 'docs/telepresence/2.5/extension/install.md':
    case 'docs/telepresence/2.5/extension/intercept.md':
    case 'docs/telepresence/2.5/extension/troubleshooting.md':
      dstUrl = `https://github.com/telepresenceio/telepresence.io/blob/master/docs/v${version}/${restOfFilePath}`;
      break;
  }

  const customLink = getEditOnPageUrls[page?.fields?.slug];
  dstUrl = customLink ? customLink : dstUrl;

  const showGitHubLink = (version)=>{
    const isGreaterThan = version.localeCompare("2.7", undefined, { numeric: true, sensitivity: 'base' });
    return isGreaterThan >= 0;
  }

  return (
    <footer className="docs__footer">
        <a href={dstUrl} target="_blank" rel="noreferrer">
          <Icon name="github" />
          Edit this page on GitHub
        </a>
    </footer>
  );
};

export default DocsFooter;
