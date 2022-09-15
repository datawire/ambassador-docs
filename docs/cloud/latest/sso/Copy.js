import React from 'react';
import CopyButton from '../../../../../src/components/CodeBlock/CopyButton';

// XXX: All the hardcoded styling should be cleaned up by someone who knows how to reuse the
//      existing system values and/or better factor between here and the CopyButton from CodeBlock.

const noop = (content) => {};

const Copy = ({content, validator = noop}) => {
  const validate = (e) => {
    var msg = validator(content);
    if (typeof msg === 'string' && msg.length > 0) {
      alert(msg);
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <span onClickCapture={validate} style={{display: "inline-block", "background-color": "#e8e8e8",
                                            "border-radius": "3px", padding: "3px 6px", margin: "1px"}}>{content}
      <span style={{position: "relative", display: "inline-block", width: "30px", right: "-8px", top: "-24px"}}>
        <CopyButton content={content}/>
      </span>
    </span>
  );
};

export default Copy;
