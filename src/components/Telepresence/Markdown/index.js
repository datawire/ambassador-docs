import React from 'react';
import { MDXProvider } from "@mdx-js/react"

import CodeBlock from '../../CodeBlock';
import Link from '../../../../../src/components/Link';

export const components = {
  // Override default markdown output.
  'pre': CodeBlock,
  'a': Link,

  // Add new custom components.
  // (none right now)
};

export default function Markdown({ children }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
