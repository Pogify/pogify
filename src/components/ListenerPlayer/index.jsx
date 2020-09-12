import React from "react";
import { observer } from "mobx-react";
import { playerStore, modalStore } from "../../stores";

import { Layout } from "../../layouts";

import Player from "../Player";
import WarningModal from "../../modals/WarningModal";
import Donations from "../utils/Donations";
import CopyLink from "../utils/CopyLink";

import styles from "./index.module.css";
import { showReportDialog } from "@sentry/react";
import { reaction, autorun } from "mobx";

/**
 * ListenerPlayer handles logic for listeners
 */
class ListenerPlayer extends React.Component {
  eventListenerRetry = 0;
  syncing = false;
  state = {
    device_id: "",
    loading: false,
    lastTimestamp: 0,
    updateTimestamp: 0,
    subConnected: false,
    hostVideoId: "",
    hostConnected: false,
    hostPlaying: false,
    hostPosition: 0,
    // governs whether or not the player should play when host presses play.
    hostPausedWhileListenerListening: true,
    // governs whether or not players should start playing on connect
    firstPlay: false,
    synced: true,
    parked: false,
    changeSongCallback: null,
    // should always maintain sync toggle.
    strict: true,
  };

  /**
   * Sets event listeners from host
   */
  setListenerListeners = () => {
    // subscribe to events on backend
    this.setEventListener();

    // synchronization checker
    this.syncCheckDisposer = reaction(
      // only listen for these changes
      () => ({
        videoId: playerStore.videoId,
        diff: playerStore.diff,
        playing: playerStore.playing,
      }),
      // if listener player changed compare to host player
      ({ videoId, playing }) => {
        if (this.syncing) {
          console.log("sync check blocked...");
          return;
        }
        console.log("checking sync");
        const {
          hostVideoId,
          hostPosition,
          hostPlaying,
          hostTrackWindow,
          updateTimestamp,
        } = this.state;
        let calcPos = hostPlaying
          ? hostPosition + Date.now() - updateTimestamp
          : hostPosition;
        if (
          hostVideoId !== videoId ||
          Math.abs(calcPos - playerStore.position) > 1000 ||
          hostPlaying !== playing
        ) {
          console.log("not synced");
          this.setState(
            {
              synced: false,
            },
            async () => {
              let calcPos = hostPlaying
                ? hostPosition + Date.now() - updateTimestamp
                : hostPosition;
              // only update if player is in strict mode.
              // only update if host is connected
              // don't try and sync if host position goes past duration of the track
              if (
                this.state.hostConnected &&
                this.state.strict &&
                calcPos + 1 < playerStore.duration
              ) {
                await this.syncListener(
                  hostVideoId,
                  calcPos,
                  hostPlaying,
                  hostTrackWindow
                );
              }
            }
          );
        } else {
          console.log("synced");
          this.setState({
            synced: true,
          });
        }
      },
      {
        // only react if the listener player changed
        equals: (a, b) => {
          if (a.uri !== b.uri || b.diff > 1000 || a.playing !== b.playing) {
            return false;
          }
          return true;
        },
      }
    );
  };

  setEventListener = () => {
    if ("EventSource" in window) {
      this.eventListener = new EventSource(
        process.env.REACT_APP_SUB + "/sub/" + this.props.sessionId + ".b1"
      );
    } else {
      // TODO: replace to nginx endpoint/ env var
      this.eventListener = new WebSocket(
        "ws://localhost/sub/" + this.props.sessionId
      );
    }

    // update state on open
    this.eventListener.onopen = () => {
      this.eventListenerRetry = 11;
      this.setState({
        subConnected: true,
      });
    };

    // message Handler
    this.eventListener.onmessage = async (event) => {
      console.log(event.data);
      let { timestamp, videoId, position, playing } = JSON.parse(event.data);
      // if message timestamp is less than previously received timestamp it is stale. don't act on it
      if (this.state.lastTimestamp > timestamp) return;

      // if there is a hostUri before but this
      if (this.state.hostVideoId && !videoId) {
        this.setState({
          hostConnected: false,
        });
        modalStore.queue(
          <WarningModal
            title="Host disconnected."
            content="Playback has been paused"
          />
        );
        return;
      } else if (!videoId) {
        // if first event is empty then post waiting for host
        this.setState({
          hostConnected: false,
        });
        return;
      }

      // calculate hosts current position based on hosts timestamp and time now on client
      let calcPos = playing
        ? position + (Date.now() - timestamp) / 1000
        : position;

      this.setState(
        {
          lastTimestamp: timestamp,
          hostVideoId: videoId,
          hostPosition: calcPos,
          updateTimestamp: Date.now(),
          hostPlaying: playing,
          firstPlay: playing || this.state.firstPlay,
          hostConnected: true,
        },
        async () => {
          // must call in callback else causes race conditions
          await this.syncListener(videoId, calcPos, playing);
        }
      );
    };

    this.eventListener.onerror = (e) => {
      // if there is an error close connection and unset it
      this.eventListener = undefined;
      // if there are not many retries, increment counter then retry
      if (this.eventListenerRetry < 5) {
        this.eventListenerRetry++;
        setTimeout(() => {
          this.setEventListener();
        }, (this.eventListenerRetry / 5) ** 2 * 1000);
      } else {
        // if lots of retries show error modal.
        this.eventListenerRetry = 0;
        console.error(e);
        modalStore.queue(
          <WarningModal
            title="Failed to connect to Session"
            content={`Session ${this.props.sessionId} does not exist. Check that you have the proper session code and try again.`}
          >
            <div>
              <button onClick={showReportDialog}>Send an Error Report</button>
            </div>
          </WarningModal>
        );
      }
    };
  };

  /**
   * Initialize player as listener
   */
  connect = async () => {
    this.setState({ loading: true });

    this.setState({ loading: false, spotConnected: true });
    // set listener event listeners
    this.setListenerListeners();
  };

  /**
   * Method syncs listener to provided params
   *
   * @param {string} uri spotify track uri
   * @param {number} position position in milliseconds
   * @param {boolean} playing playing state
   */
  async syncListener(videoId, position, playing) {
    console.log("<<<< start sync");
    // because play/pause causes observable updates it triggers a run of the syncCheck reaction.
    // so set flag here until play/pause/newTrack is all encapsulated in an action.
    this.syncing = true;
    console.log(playing, position, playerStore.position.value);
    if (videoId !== playerStore.videoId) {
      await playerStore.newVideo(videoId, position, playing);
    } else {
      playerStore.seek(position);
      if (playing) {
        await playerStore.resume();
      } else {
        console.log("in");
        await playerStore.pause();
        console.log("out");
      }
    }
    this.setState(
      {
        synced: true,
      },
      () => {
        console.log(">>>> end sync");
        this.syncing = false;
      }
    );
  }

  // syncOnClick = () => {
  //   const { hostUri, hostPosition, hostPlaying, updateTimestamp } = this.state;
  //   const calcPos = hostPlaying
  //     ? hostPosition + Date.now() - updateTimestamp
  //     : hostPosition;
  //   this.syncListener(hostUri, calcPos, hostPlaying, true);
  // };

  componentDidMount() {
    this.connect();

    this.youtubeReadyAutorunDisposer = autorun((r) => {
      if (playerStore.youTubeReady) {
        console.log("youtube ready");
        r.dispose();
        const {
          hostPosition,
          hostPlaying,
          hostVideoId,
          updateTimestamp,
        } = this.state;
        let calcPos = hostPlaying
          ? hostPosition + (Date.now() - updateTimestamp) / 1000
          : hostPosition;
        this.syncListener(hostVideoId, calcPos, hostPlaying);
      }
    });
  }
  componentWillUnmount() {
    if (this.youtubeReadyAutorunDisposer) {
      this.youtubeReadyAutorunDisposer();
    }
    // close connection to sub server
    if (this.eventListener) {
      this.eventListener.close();
    }
    // disconnect current player
    if (playerStore.player) {
      playerStore.player.disconnect();
    }
    // dispose sync check
    if (typeof this.syncCheckDisposer === "function") {
      this.syncCheckDisposer();
    }
  }

  render() {
    // if loading
    if (this.state.loading) {
      return <div>Loading...</div>;
    }

    // // waiting for host view.
    // if (!this.state.hostConnected || !this.state.firstPlay) {
    //   return (
    //     <Layout>
    //       <h2 className={styles.h2}>Waiting for host to play music...</h2>{" "}
    //       <p>Session Code: {this.props.sessionId}</p>
    //       <input
    //         type="checkbox"
    //         name="dontPlay"
    //         id="dontPlay"
    //         value={!this.state.hostPausedWhileListenerListening}
    //         onChange={() =>
    //           this.setState({
    //             hostPausedWhileListenerListening: !this.state
    //               .hostPausedWhileListenerListening,
    //           })
    //         }
    //       />
    //       <label htmlFor="dontPlay">Don't Auto-play.</label>
    //     </Layout>
    //   );
    // }

    return (
      <div className={styles.container}>
        <div className={styles.titleBar}>
          <h1>Session</h1>
          <div className={styles.linkWrapper}>
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
          </div>
        </div>
        <Player showControls warn={!this.state.synced} />

        <div className={styles.infoBar}>
          <div className={`${styles.donations} ${styles.info}`}>
            Do you like what we're doing? Help us our with a donation to keep
            our dev servers running! Even just one dollar will help.
            <Donations noText />
          </div>
        </div>
      </div>
    );
  }
}

export default observer(ListenerPlayer);
