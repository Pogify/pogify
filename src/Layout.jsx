import React from "react";

const Layout = (props) => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "linear-gradient(to right, #7f53ac 0, #657ced 100%)",
      }}
    >
      <div
        style={{
          background: "white",
          color: "black",
          mixBlendMode: "screen",
          padding: "2rem",
          borderRadius: "12.5px",
          boxShadow: "10px 5px 5px black",
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

export default Layout;
