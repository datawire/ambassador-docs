const host = 'https://www.getambassador.io';

const descriptions = {
  '/docs/edge-stack/latest/topics/concepts/rate-limiting-at-the-edge':
    "Rate limiting concepts at the edge is a technique used to prevent a sudden or sustained increase in user traffic from breaking an API or underlying service'",
  '/docs/edge-stack/latest/topics/running/tls/cleartext-redirection':
    "Ambassador Edge Stack supports both forcing automatic redirection to HTTPS and serving cleartext traffic on a Host. While most modern web applications choose to'",
};

export default function (description, canonicalUrl) {
  const url = canonicalUrl.replace(host, '');
  return descriptions[url] || description;
}
