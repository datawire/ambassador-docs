import React from "react";

const Table =({children, ...props})=>{
  return <div style={{overflowX: "auto", maxWidth: "100%"}}>
    <table {...props}>{children}</table>
  </div>
}

export default Table;