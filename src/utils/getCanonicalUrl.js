const getCanonicalUrl =(slugs, currentSlug)=> {
  let regex = /(\/[^/]*\/[^/]*)\/[^/]*(\/.*)/;
  const match = regex.exec(currentSlug);
  let canonicalSlug = currentSlug;
  let latest = currentSlug.includes("/latest/"); 
  if(match && !latest){
    const version = slugs.reduce((acc, value) => {
      const current = value.node.fields.slug;
      if(current.startsWith(match[1]) && current.endsWith(match[2]))
      {
        if(!acc.latest){
          acc.latest = current.includes("/latest/");
        }
        acc.value = acc.value + 1;
      }
      return acc;
    }, {value: 0, latest: false});
    latest = version.latest;
    if(version.value>=2 && version.latest){
      canonicalSlug =  match[1]+ "/latest"+match[2];
    }
  }
  return {url: canonicalSlug, latest};
}

module.exports = {
  getCanonicalUrl
}