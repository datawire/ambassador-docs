export default async function (product, slugs = []) {
  if (product !== 'cloud') {
    return '';
  }
  const features = await import(`../../docs/cloud/latest/cloud-features.yml`);
  if (!Array.isArray(features.default)) {
    return '';
  }
  const path = `/${slugs.filter(Boolean).join('/')}`;
  const feature = features.default.find(item => item.path === path)?.feature;
  return feature ?? '';
}