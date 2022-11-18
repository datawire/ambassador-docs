function trimLastSlash(originalUrl) {
  return originalUrl.endsWith('/') ? originalUrl.slice(0, -1) : originalUrl;
}

module.exports = {
  trimLastSlash,
};
