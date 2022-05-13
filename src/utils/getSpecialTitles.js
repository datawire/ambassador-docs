export default function(data, canonicalUrl) {
  
  const edgeStackTitle = data.replace('| Ambassador', '| Edge Stack');
  const telepresenceTitle = data.concat(' Telepresence');
  const argoTitle = data.concat(' Argo');
  const cloudTitle1 = data.replace(
    'Quick start',
    'Visualize API - Quick start',
  );
  const cloudTitle2 = data.replace(
    'Quick start',
    'Service Catalog - Quick start',
  );
  const specialTitleEmissary = data.replace(
    'The Ambassador operating model:',
    'Operating model:',
  );
  const specialTitleEdgeStack = data.replace(
    'The Ambassador operating model: GitOps and continuous delivery | Ambassador',
    'Operating model: GitOps and continuous delivery | Edge Stack',
  );

  if (
    canonicalUrl.includes('edge-stack') &&
    canonicalUrl.includes('/concepts/gitops-continuous-delivery/')
  ) {
    return specialTitleEdgeStack;
  }
  if (canonicalUrl.includes('edge-stack')) {
    return edgeStackTitle;
  }
  if (canonicalUrl.includes('telepresence')) {
    return telepresenceTitle;
  }
  if (canonicalUrl.includes('argo')) {
    return argoTitle;
  }
  if (
    canonicalUrl.includes('cloud') &&
    canonicalUrl.includes('visualize-api')
  ) {
    return cloudTitle1;
  }
  if (
    canonicalUrl.includes('cloud') &&
    canonicalUrl.includes('service-catalog')
  ) {
    return cloudTitle2;
  }
  if (canonicalUrl.includes('/concepts/gitops-continuous-delivery/')) {
    return specialTitleEmissary;
  }
  return data;
};
