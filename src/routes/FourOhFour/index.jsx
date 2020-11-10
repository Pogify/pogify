import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { Layout } from "../../layouts";

import styles from "./index.module.css";

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
        <center>
          <div onClick={() => window.history.back()} title="">
            <div className={styles.backButton}>
              <div className={styles.backIcon}>
                <img src="/back-arrow.svg" alt=""/>
              </div>
              <div className={styles.backText}>
                Go Back
              </div>
            </div>
          </div>
          <br></br><br></br>
        </center>
      </div>
    </Layout>
  );
};
