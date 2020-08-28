import React from "react";
import { Link } from "react-router-dom";

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
        <div className={styles.pogifyLogoWrapper}>
          <img alt="" className={styles.pogifyLogoImage} src="/logo192.png"></img>
          <h1 className={styles.pogifyLogoText}>POGIFY</h1>
        </div>
        <p className={styles.pogifyCatchline}>Listen to music with your live audience without getting DMCA-striked!</p>
        <div className={styles.actionWrapper}>
          <Link to="/session">
            <button>
              Join a Session
            </button>
          </Link>
          <Link to="/create">
            <button>
              Start a session
            </button>
          </Link>
        </div>
        <div className={styles.donationsWrapper}>
          <p>Do you like what we're doing? Help us out with a donation to keep our dev servers running! Even just one dollar will help.</p>
          <Donations />
        </div>

      </Layout>
    );
  }
}
