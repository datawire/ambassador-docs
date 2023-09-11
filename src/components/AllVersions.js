import { Link } from 'gatsby';
import React from 'react';

import { archivedDocsUrl } from '../config';

const AllVersions = ({ product }) => {
  const archivedVersions = product.version.filter((v) => v.archived);

  return (
    <div className="docs__container docs__all-versions">
      <h1 className="docs__heading-primary">
        {product.name} documentation by version
      </h1>
      <p>
        Some previous versions of the documentation remain available online. Use
        the list below to select a version to view.
      </p>
      <h2>Recent Versions</h2>
      <ul className="docs__all-versions-list">
        {product.version
          .filter((v) => !v.archived && !v.unlisted)
          .map((ver) => (
            <li key={ver.id}>
              <Link to={`/docs/${product.slug}/${ver.link}`}>
                {product.name} {ver.name}
              </Link>
            </li>
          ))}
      </ul>
      {archivedVersions.length > 0 && (
        <>
          <h2>Archived Versions</h2>
          <ul className="docs__all-versions-list">
            {product.version
              .filter((v) => v.archived)
              .map((ver) => (
                <li key={ver.id}>
                  <a
                    href={`${archivedDocsUrl}/docs/${product.slug}/${ver.link}`}
                  >
                    {product.name} {ver.name}
                  </a>
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AllVersions;
