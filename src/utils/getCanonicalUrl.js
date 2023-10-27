const { trimLastSlash } = require('../../../src/utils/trimUrl');
/*
  You need to add the URL in exceptions object without the version as a key and the value with the desired canonical URL
*/

const exceptions = {
  '/docs/cloud/service-catalog/howtos/complete-k8s/':
    '/docs/telepresence/latest/service-catalog/howtos/complete-k8s/',
};

const getCanonicalUrl = (slugs, currentSlug) => {
  let regex = /(\/[^/]*\/[^/]*)\/[^/]*(\/.*)/;
  const match = regex.exec(currentSlug);
  const slugWithoutVersion = match ? `${match[1]}${match[2]}` : '';
  let canonicalSlug = exceptions[slugWithoutVersion] ?? currentSlug;
  let latest = canonicalSlug.includes('/latest/');
  if (match && !latest && !exceptions[slugWithoutVersion]) {
    const version = slugs.reduce(
      (acc, value) => {
        const current = value.node.fields.slug;
        if (current.startsWith(match[1]) && current.endsWith(match[2])) {
          if (!acc.latest) {
            acc.latest = current.includes('/latest/');
          }
          acc.value = acc.value + 1;
        }
        return acc;
      },
      { value: 0, latest: false },
    );
    latest = version.latest;
    if (version.value >= 2 && version.latest) {
      canonicalSlug = match[1] + '/latest' + match[2];
    }
  }

  if(canonicalSlug.startsWith("/docs/telepresence-oss")) {
    canonicalSlug = canonicalSlug.replace("/docs/telepresence-oss","/docs/telepresence");
  }
  canonicalSlug = trimLastSlash(canonicalSlug);
  return { url: canonicalSlug, latest };
};

module.exports = {
  getCanonicalUrl,
};
