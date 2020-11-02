import React, { useState } from "react";
import { observer } from "mobx-react";
import { reaction, autorun } from "mobx";

import * as SessionManager from "../../utils/sessionManager";
import { playerStore, queueStore } from "../../stores";

import debounce from "lodash/debounce";

import { Layout } from "../../layouts";

import Player from "../Player";
import Donations from "../utils/Donations";
import CopyLink from "../utils/CopyLink";

import { FontAwesomeIcon as FAI } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";

import styles from "./index.module.css";
import { PlaylistList } from "./components/PlaylistList";
import { QueueList } from "./QueueList";

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
    tab: "playlists",
  };

  /**
   * Sets interval for token refresh
   */
  setTokenRefreshInterval = () => {
    // refresh token
    this.refreshInterval = setInterval(
      SessionManager.refreshToken,
      30 * 60 * 1000
    );
  };

  /**
   * Initializes spotify player in the player store as host
   */
  initializePlayer = async () => {
    this.setState({
      loading: true,
    });

    this.nextTrackDisposer = autorun(() => {
      if (
        playerStore.ended ||
        playerStore.error === 150 ||
        playerStore.error === 101 ||
        playerStore.error === 100
      ) {
        let nextVideo = queueStore.nextVideo();
        if (nextVideo) {
          playerStore.newVideo(nextVideo.id, 0, true);
        }
      }
    });

    this.updateReactionDisposer = reaction(
      () => {
        let { queue, currentIndex } = queueStore;
        let queueSlice = (currentIndex
          ? [queue[currentIndex - 1].snippet]
          : []
        ).concat(
          queue
            .slice(currentIndex, currentIndex + 5)
            .map((item) => item.snippet)
        );

        return {
          videoId: playerStore.videoId,
          playing: playerStore.playing,
          seeking: playerStore.seeking,
          queueSlice,
        };
      },
      debounce(({ videoId, playing, queueSlice }) => {
        SessionManager.publishUpdate(
          videoId,
          playerStore.position.value,
          playing,
          queueSlice
        );
      }, 400),
      {
        equals: () => {
          return (
            playerStore.ended ||
            playerStore.unstarted ||
            playerStore.buffering ||
            playerStore.seeking ||
            playerStore.error
          );
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

  componentDidMount() {
    this.initializePlayer();
    // set the token refresh interval
    this.setTokenRefreshInterval();
  }

  async componentWillUnmount() {
    if (playerStore.player) {
      // publish unload update when unmounting player
      await SessionManager.publishUpdate("", playerStore.position, false);
    }
    // remove onbeforeunload handler
    window.onbeforeunload = null;
    if (typeof this.updateReactionDisposer === "function") {
      this.updateReactionDisposer();
      this.nextTrackDisposer();
    }
    // clear refresh interval
    clearInterval(this.refreshInterval);
  }
  Buttons = (
    <div>
      <button onClick={() => this.setState({ tab: "queueItems" })}>
        Queue
      </button>
      <button onClick={() => this.setState({ tab: "playlists" })}>
        Playlists
      </button>
      <button onClick={() => this.setState({ tab: "requests" })}>
        Requests
      </button>
      <button>
        <FAI icon={faSearch} />
      </button>
      <button onClick={() => this.setState({ tab: "plus" })}>
        <FAI icon={faPlus} />
      </button>
    </div>
  );

  render() {
    // loading
    if (this.state.loading && this.state.pso) {
      return (
        <Layout>
          <div>Loading</div>
        </Layout>
      );
    }

    // return <div>done</div>
    return (
      <div className={styles.container}>
        <div className={styles.titleBar}>
          <h1>Session: {this.props.sessionId}</h1>
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

        <Player isHost />
        <div style={{ maxWidth: 1320 }}>
          {this.Buttons}
          <div className={styles.stuffContainer}>
            {this.state.tab === "plus" && <Plus />}
            {this.state.tab === "playlists" && (
              <>
                <PlaylistList />
              </>
            )}
            {this.state.tab === "queueItems" && <QueueList />}
          </div>

          <div className={styles.shareExplanations}>
            Share the URL below to listen with others:
            <br />
            You can continue using Spotify as you normally would. The music is
            playing through this browser tab, you can open this tab in a new
            window to exclude it from OBS.
          </div>
          <div className={`${styles.donations} ${styles.info}`}>
            Do you like what we're doing? Help us our with a donation to keep
            our dev servers running! Even just one dollar will help.
            <Donations noText />
          </div>
          <Donations large />
        </div>
      </div>
    );
  }
}

export default observer(HostPlayer);

const Plus = () => {
  const [videoId, setVideoId] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        playerStore.newVideo(videoId, undefined, true);
      }}
    >
      <div>
        <input
          type="text"
          placeholder="video id"
          onChange={(e) => {
            setVideoId(e.target.value);
          }}
        />
      </div>
      <div>
        <button type="submit">Load Video</button>
      </div>
    </form>
  );
};
