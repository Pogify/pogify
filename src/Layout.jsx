import React from "react";
import PropTypes from 'prop-types';

const Layout = (props) => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "linear-gradient(to right, #7f53ac 0, #657ced 100%)"
      }}
    >
      <div
        style={{
          background: "white",
          color: "#2C3A3A",
          padding: "2rem",
          borderRadius: "12.5px",
          boxShadow: "0px 3px 15px rgba(0,0,0,0.2)",
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.element.isRequired
};

export default Layout;
