export default async function (product, path = [], version = 'latest') {
    if (product !== 'edge-stack') {
        return false;
    }
    const AesPages = await import(`../../docs/edge-stack/${version}/aes-pages.yml`);
    const AesList = Array.isArray(AesPages.default) ? AesPages.default : AesPages.default.split(' ');
    return AesList.find(p => p.replace(/\//g, '') === path.slice(4).join(''));
};