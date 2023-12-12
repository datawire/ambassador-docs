import React from 'react';

import Link from '../../../src/components/Link';

const MarkdownLink = ({ children, ...props }) => {
  return (
    <Link fromDocs={true} {...props}>
      {children}
    </Link>
  );
};

export default MarkdownLink;
