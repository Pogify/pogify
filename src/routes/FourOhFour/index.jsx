import React from "react";
import { Layout } from "../../layouts";
import { Link } from "react-router-dom";

// import styles from "./index.module.css";

/**
 * 404 component
 */
export const FourOhFour = () => {
  return (
    <Layout>
      <div className="textAlignCenter">
        <h1 className="noMargin">
          <div>404</div>
        </h1>
        <div>What you are looking for ain't here</div>
        {/* TODO: go back button */}
        <Link to="/">Go home</Link>
      </div>
    </Layout>
  );
};
