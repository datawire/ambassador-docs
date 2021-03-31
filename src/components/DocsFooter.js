import React from 'react';

import GithubIcon from '../images/github-icon.inline.svg';

const DocsFooter = ({ page, product, version }) => (
    <footer className="docs__footer">
        <a href={`https://github.com/datawire/ambassador-docs/blob/master/docs/${product}/${version}/${page ? page.parent.relativePath.replace(/^early-access\//, '').split("/").slice(3,).join("/") : ''}`} target="_blank">
            <GithubIcon />
            Edit this page on GitHub
        </a>
    </footer>
);

export default DocsFooter;