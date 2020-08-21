import React from "react";
import { Link } from "react-router-dom";
import "../styles/Layout.css";
export const Layout = (props) => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
      <p
        style={{
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
        }}
      >
        ©{" "}
        <a href="https://www.pogify.net/" style={{ color: "white" }}>
          Pogify
        </a>{" "}
        2020 |{" "}
        <Link to="/tos" style={{ color: "white" }}>
          Terms of Service
        </Link>{" "}
        |{" "}
        <Link to="/privacy" style={{ color: "white" }}>
          Privacy Policy
        </Link>
      </p>
    </div>
  );
};

// Layout.propTypes = {
//   children: PropTypes.element.isRequired
// };
