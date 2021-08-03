import { Link as GatsbyLink } from 'gatsby';
import React from 'react';

import { siteUrl } from '../config';


const isValidUrl =(urlString)=>{
  let url; 
  try{
    url = new URL(urlString);
  }catch(_){
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:" 
}

const MarkdownLink = ({ href="", ...rest }) => {

  // false-positive; 'rest' sets the special 'children' property.
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  const basicLink= url =><a href={url} {...rest}/>
  const gatsbyLink = url => <GatsbyLink to={url} {...rest} />

  const archiveLink=()=>{
    if(href.startsWith("..")||href.startsWith("#")){
      return gatsbyLink(href);
    }
    if(href.startsWith("/")){
      return basicLink(siteUrl+href);
    }
    if(isValidUrl(href)){
      return basicLink(href);
    }
    return gatsbyLink(href);
  }

  return archiveLink();
  
};
export default MarkdownLink;
