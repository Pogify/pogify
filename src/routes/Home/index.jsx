import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import { Layout } from "../../layouts";

import Donations from "../../components/utils/Donations";

import styles from "./index.module.css";

/**
 * Landing page
 */
export class Home extends React.Component {
  render() {
    return (
      <Layout>
        <Helmet>
          <title>Pogify</title>
        </Helmet>
        <div className={styles.pogifyLogoWrapper}>
          <img
            alt=""
            className={styles.pogifyLogoImage}
            src="/logo192.png"
          ></img>
          <h1 className={styles.pogifyLogoText}>POGIFY</h1>
        </div>
        <p className={styles.pogifyCatchline}>
          Listen to music with your live audience without getting DMCA-striked!
        </p>
        <div className={styles.actionWrapper}>
          <Link to="/session" style={{textDecoration: "none"}}>
            <div className={`${styles.actionButton} ${styles.joinButton}`}>
              <div className={styles.actionIcon}>
                <img src="headphones.svg" alt="" />
              </div>
              <span className={styles.actionText}>Join a Session</span>
              </div>
          </Link>
          <Link to="/create" style={{textDecoration: "none"}}>
            <div className={`${styles.actionButton} ${styles.hostButton}`}>
              <div className={styles.actionIcon}>
                <img src="play.svg" alt="" />
              </div>
              <span className={styles.actionText}>Host a session</span>
            </div>
          </Link>
        </div>
        <div className={`${styles.donations} donation-box`}>
          <p>Do you like what we're doing? Help us out to keep our servers running! Even just one dollar will help.</p>
          <Donations noText buttonStyle={{padding: "1rem"}}/>
        </div>

      </Layout>
    );
  }
}
