import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { Layout } from "../../layouts";

// import styles from "./index.module.css";

/**
 * 404 component
 */
export const FourOhFour = () => {
  return (
    <Layout>
      <Helmet>
        <title>Page not found - Pogify</title>
      </Helmet>
      <div className="textAlignCenter">
        <h1 className="noMargin">
          <div>404</div>
        </h1>
        <div>What you are looking for isn't here... What do you want to do?</div>
        <br></br><br></br>
        <button onClick={() => window.history.back()} title="">Go back</button>
        <br></br><br></br>
        <Link to="/"><button>Go home</button></Link>
      </div>
    </Layout>
  );
};
