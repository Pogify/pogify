import React from "react";
import { observer } from "mobx-react";
import { reaction, autorun } from "mobx";

import * as SessionManager from "../../utils/sessionManager";
import * as gapiAuth from "../../utils/gapiAuth";
import { playerStore, playlistStore, queueStore } from "../../stores";

import debounce from "lodash/debounce";

import { Layout } from "../../layouts";

import Player from "../Player";
import Donations from "../utils/Donations";
import CopyLink from "../utils/CopyLink";

import { FontAwesomeIcon as FAI } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";

import styles from "./index.module.css";
import { PlaylistCard } from "../PlaylistCard";

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

  render() {
    const Buttons = (
      <div>
        <button>
          <FAI icon={faPlus} />
        </button>
        <button onClick={() => this.setState({ tab: "queueItems" })}>
          Queue
        </button>
        <button onClick={() => this.setState({ tab: "playlists" })}>
          Playlists
        </button>
        <button onClick={() => this.setState({ tab: "current" })}>
          now Playing
        </button>
        <button>
          <FAI icon={faSearch} />
        </button>
      </div>
    );
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
          {Buttons}
          {this.state.tab === "playlists" && <PlaylistList />}
          {this.state.tab === "queueItems" && (
            <pre style={{ textAlign: "left" }}>
              {JSON.stringify(
                queueStore.queue.map((e, i) => {
                  return queueStore.currentIndex === i
                    ? "-> " + e.snippet.title
                    : e.snippet.title;
                }),
                undefined,
                2
              )}
            </pre>
          )}
          {this.state.tab === "current" && (
            <pre style={{ textAlign: "left" }}>
              {JSON.stringify(
                queueStore.currentVideo.snippet.title,
                undefined,
                2
              )}
            </pre>
          )}

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

class _PlaylistList extends React.Component {
  state = {
    videoId: "",
  };
  render() {
    if (!gapiAuth.gapiSignedIn.get()) {
      return (
        <div>
          not logged in
          <button onClick={gapiAuth.signIn}>Sign In</button>
        </div>
      );
    }

    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            playerStore.newVideo(this.state.videoId, undefined, true);
          }}
        >
          <input
            type="text"
            placeholder="video id"
            onChange={(e) => {
              this.setState({ videoId: e.target.value });
            }}
          />
          <button type="submit">Load Video</button>
        </form>
        <div
          style={{
            overflow: "auto",
            display: "flex",
            flexFlow: "row wrap",
            position: "relative",
            justifyContent: "center",
          }}
        >
          {playlistStore.playlists.map((item) => {
            return (
              <PlaylistCard
                key={item.id}
                imgUrl={item.snippet.thumbnails.medium.url}
                title={item.snippet.title}
                channel={item.snippet.channelTitle}
                length={item.contentDetails.itemCount}
                id={item.id}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
const PlaylistList = observer(_PlaylistList);
