import React from 'react';

import GithubIcon from '../images/github-icon.inline.svg';

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
      dstUrl = `https://github.com/telepresenceio/docs/blob/release/v${version}/${restOfFilePath}`;
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

  return (
    <footer className="docs__footer">
      {product == 'telepresence' && Number(version) >= 2.7 ? null : (
        <a href={dstUrl} target="_blank" rel="noreferrer">
          <GithubIcon loading="lazy" />
          Edit this page on GitHub
        </a>
      )}
    </footer>
  );
};

export default DocsFooter;
