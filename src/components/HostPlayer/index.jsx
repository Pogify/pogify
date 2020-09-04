import React from "react";
import { observer } from "mobx-react";
import { reaction } from "mobx";

import * as SessionManager from "../../utils/sessionManager";
import { playerStore } from "../../stores";

import debounce from "lodash/debounce";

import { Layout } from "../../layouts";

import Player from "../Player";
import PoweredBySpotify from "../utils/PoweredBySpotify";
import Donations from "../utils/Donations";
import CopyLink from "../utils/CopyLink";

import styles from "./index.module.css";

/**
 * HostPlayer handles logic for Pogify Host
 */
class HostPlayer extends React.Component {
  // static contextType = storesContext;
  // lastUpdate property keeps track the data sent in the last publish update
  lastUpdate = {
    uri: "",
    playing: undefined,
    position: 0,
    time: Date.now(),
  };
  state = {
    loading: false,
    pso: undefined,
  };

  /**
   * Sets interval for token refresh
   */
  setTokenRefreshInterval = () => {
    // refresh token
    this.refreshInterval = setInterval(
      SessionManager.refreshToken,
      30 * 60 * 1000,
      [window.localStorage.getItem("pogify:token")]
    );
  };

  /**
   * Initializes spotify player in the player store as host
   */
  initializePlayer = async () => {
    this.setState({
      loading: true,
    });

    const playerDeviceId = await playerStore.initializePlayer("Pogify Host");
    playerStore.connectToPlayer(playerDeviceId).catch((err) => {
      if (err.message !== "Bad refresh token") {
        console.error(err);
      }
    });

    this.updateReactionDisposer = reaction(
      (r) => ({
        uri: playerStore.uri,
        playing: playerStore.playing,
        diff: playerStore.diff,
      }),
      debounce(({ uri, playing }) => {
        SessionManager.publishUpdate(
          uri,
          playerStore.position,
          playing,
          playerStore.track_window
        );
      }, 400),
      {
        equals: (a, b) => {
          if (
            a.uri !== b.uri ||
            // if document is hidden setInterval gets throttled to once per sec. raise difference threshold in that case
            b.diff > (document.hidden ? 2000 : 1000) ||
            a.playing !== b.playing
          ) {
            return false;
          }
          return true;
        },
      }
    );

    window.onbeforeunload = () => {
      // publish empty string uri on disconnect. Empty string uri means host disconnected
      SessionManager.publishUpdate(
        "",
        playerStore.position.value,
        false,
        playerStore.track_window
      );
    };
    this.setState({ loading: false });
  };

  handleData = debounce(
    (data) => {
      // debounce incoming data.
      let uri, position, playing;
      if (data) {
        uri = playerStore.uri;
        position = data.position;
        playing = !data.paused;
        // check that uri or playing changed
      } else {
        uri = "";
        position = playerStore.position;
        playing = false;
      }
      SessionManager.publishUpdate(uri, position, playing);
      this.lastUpdate = {
        uri,
        playing,
        position,
        time: Date.now(),
      };
      // it seems 400 is about a good sweet spot for debounce.
      // Hesitant to raise it anymore because it would increase latency to listener
    },
    400,
    { leading: true }
  );

  componentDidMount() {
    // set the token refresh interval
    this.setTokenRefreshInterval();
  }

  async componentWillUnmount() {
    if (playerStore.player) {
      // publish unload update when unmounting player
      if (playerStore.position !== undefined) {
        await SessionManager.publishUpdate(
          "",
          playerStore.position,
          false,
          playerStore.track_window
        );
      }
      playerStore.disconnectPlayer();
    }
    // remove onbeforeunload handler
    window.onbeforeunload = null;
    if (typeof this.updateReactionDisposer === "function") {
      this.updateReactionDisposer();
    }
    // clear refresh interval
    clearInterval(this.refreshInterval);
  }

  render() {
    // loading
    if (this.state.loading && this.state.pso) {
      return (
        <Layout>
          <div>Loading</div>
        </Layout>
      );
    }

    // check that there exists a refresh token
    if (!window.localStorage.getItem("spotify:refresh_token")) {
      return (
        <Layout>
          <div className="textAlignCenter">
            <button onClick={this.initializePlayer}>Login with Spotify</button>
            <p>
              You'll be redirected to Spotify to login. After that, you'll
              automatically be connected to your room.
            </p>
          </div>
        </Layout>
      );
    }
    // if the token is not valid, show the login screen
    if (playerStore.needsRefreshToken) {
      return (
        <Layout>
          <div className="textAlignCenter">
            <button onClick={this.initializePlayer}>Login with Spotify</button>
            <p>
              You've been disconnected from Spotify. Click on the button to
              login again.
            </p>
          </div>
        </Layout>
      );
    }

    // check that player is mounted in playerStore
    if (!playerStore.player) {
      return (
        <Layout>
          <button onClick={this.initializePlayer}>Start Session</button>
        </Layout>
      );
    }

    // return <div>done</div>
    return (
      <Layout noBackground>
        <div className={styles.container}>
          <div className={styles.titleBar}>
            <h1>Session</h1>
            <div className={styles.linkWrapper}>
              <p>{window.location.href}</p>
            </div>
          </div>
          
          <div className={styles.player}>
            <div className={styles.playerInfoBar}>
            <img src="https://www.rhino.com/sites/rhino.com/files/styles/article_image/public/2019-06/a-ha%20Hunting%20High%20and%20Low_v1_current.jpg?itok=lDDbuYtL" className={styles.albumArt} />
              <div className={styles.songInfo}>
              
                <span className={styles.infoBold}>Take on Me</span>
                <br />
                a-ha • Hunting High and Low
              </div>
              <div className={styles.listenerInfo}>
                <span className={styles.infoBold}>152</span>
                <br />
                Listeners
              </div>
            </div>
            <div className={styles.playerBar}>
            </div>
          </div>
         
          <div className={styles.infoBar}>
            <div className={styles.info}>
              <span className={styles.infoBold}>Please do not close this tab.</span>
              <br />
              You can continue using Spotify as you normally would. The music is playing through this browser tab, you
              can open this tab in a new window to exclude it from OBS.
            </div>
            <div className={`${styles.donations} ${styles.info}`}>
              Do you like what we're doing? Help us our with a donation to keep our dev servers running! Even just one dollar will help.
              <Donations noText />
            </div>
          </div>
        </div>
        {/*<Player isHost />
          <div className={`${styles.textWrapper} textAlignCenter`}>
            <h2>Hosting {SessionManager.SessionCount.get()} listeners.</h2>
            <p className="textAlignLeft">
              You can continue using Spotify as you normally would. The music is
              playing through this browser tab, you can open this tab in a new
              window to exclude it from OBS.
              <br></br>
              <b>Please do not close this tab.</b>
            </p>
            <div className={styles.shareExplanations}>
              Share the URL below to listen with others:
              <br />
              <CopyLink
                href={window.location.href}
                className={styles.shareLink}
                title="Click to copy and share to your audience"
              >
                {window.location.href}
              </CopyLink>
            </div>
            <PoweredBySpotify />
            <Donations large />
          </div>*/}
      </Layout>
    );
  }
}

export default observer(HostPlayer);
