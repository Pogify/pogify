import React from "react";
import * as SessionManager from "../../utils/sessionManager";
import { debounce } from "../../utils/debounce";
import { playerStore } from "../../stores";

import { Layout } from "../../layouts";

import { Player, Donations } from "../";
import NewTabLink from "../utils/NewTabLink";
import PoweredBySpotify from "../utils/PoweredBySpotify";

import styles from "./index.module.css";

/**
 * HostPlayer handles logic for Pogify Host
 */
export default class HostPlayer extends React.Component {
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
    await playerStore.initializePlayer("Pogify Host");

    playerStore.player.on(
      "player_state_changed",
      this.handleData.bind(this)
    );
    this.setState({ loading: false });
  };

  handleData = debounce((data) => {
    // debounce incoming data.
    let uri, position, playing;
    if (data) {
      uri = data.track_window.current_track.uri;
      position = data.position;
      playing = !data.paused;
      // check that uri or playing changed
      if (this.lastUpdate.uri !== uri || this.lastUpdate.playing !== playing) {
        SessionManager.publishUpdate(uri, position, playing);
      } else {
        // if uri and playing didn't change then,
        // check that difference is beyond threshold to update
        // changes smaller than 1000 are considered stutters and changes greater than 1000 are considered seeks
        console.log(
          Math.abs(
            position -
            (this.lastUpdate.position + (Date.now() - this.lastUpdate.time))
          ),
          position,
          this.lastUpdate.position,
          Date.now() - this.lastUpdate.time
        );
        if (
          Math.abs(
            position -
            (this.lastUpdate.position + (Date.now() - this.lastUpdate.time))
          ) > 1000
        ) {
          SessionManager.publishUpdate(uri, position, playing);
        }
      }
    } else {
      uri = "";
      position = playerStore.position;
      playing = false;
      SessionManager.publishUpdate(uri, position, playing);
    }
    this.lastUpdate = {
      uri,
      playing,
      position,
      time: Date.now(),
    };
    // it seems 400 is about a good sweet spot for debounce.
    // Hesitant to raise it anymore because it would increase latency to listener
  }, 400);

  copyLink(evt) {
    evt.preventDefault();
    if (navigator.clipboard.writeText) {
      navigator.clipboard.writeText(evt.target.href);
    }
  }

  componentDidMount() {
    window.onbeforeunload = () => {
      // publish empty string uri on disconnect. Empty string uri means host disconnected
      this.publishUpdate("", this.state.position, false);
    };
    // set the token refresh interval
    this.setTokenRefreshInterval();
  }

  componentWillUnmount() {
    // remove listener on unmount. prevents host disconnected alert
    // DEFUNCT: should replace it with something else
    playerStore.player.disconnect();
    // publish unload update when unmounting player
    // TODO: cleanup when all logic is moved to stores
    // this.publishUpdate("", this.state.position, false);
    // remove listener
    window.onbeforeunload = null;
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
          <button onClick={this.initializePlayer}>Login with Spotify</button>
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
      <Layout>
        <div className="flexContainer">
          <Player isHost />
          <div className={`${styles.textWrapper} textAlignCenter`}>
            <h2>Hosting to {this.state.connections} listeners.</h2>
            <p className="textAlignLeft">
              You can continue using Spotify as you normally would. The music is
              playing through this browser tab, you can open this tab in a new
              window to exclude it from OBS.
              <br></br>
              <b>Please do not close this tab.</b>
            </p>
            <p className={styles.shareExplanations}>
              Share the url below to listen with others:
              <br />
              <NewTabLink
                href={window.location.href}
                className={styles.shareLink}
                onClick={this.copyLink}
                title="Click to copy and share to your audience"
              >
                {window.location.href}
              </NewTabLink>
            </p>
            <PoweredBySpotify />
            <Donations />
          </div>
        </div>
      </Layout>
    );
  }
}
