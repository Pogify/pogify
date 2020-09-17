import React from "react";
import { observer } from "mobx-react";
import * as SessionManager from "../../utils/sessionManager";
import { numFormatter } from "../../utils/formatters";
import { playerStore, queueStore } from "../../stores";

import "semantic-ui-css/components/progress.min.css";
import YouTube from "react-youtube";

import NewTabLink from "../utils/NewTabLink";
import PoweredBySpotify from "../utils/PoweredBySpotify";

import styles from "./index.module.css";
import { PlayerControls } from "../utils/PlayerControls";

// Allow MobX to optimize data that does not change regularly
const TrackMetadata = observer(() => {
  if (!playerStore.data.track_window) {
    return null;
  }
  const trackData = playerStore.data.track_window.current_track;

  return (
    <div className={styles.metadataWrapper}>
      <div className={styles.albumArt}>
        <img
          src={trackData.album.images[0].url}
          alt={`Cover art for ${trackData.album.name}`}
        />
      </div>
      <div>
        <h3 className={styles.titleContainer}>
          <NewTabLink
            href={trackData.uri}
            className={`${styles.spotifyLink} ${styles.title}`}
          >
            {trackData.name}
          </NewTabLink>
        </h3>
        <NewTabLink
          href={trackData.album.uri}
          className={`${styles.spotifyLink} ${styles.album}`}
        >
          {trackData.album.name}
        </NewTabLink>
        {trackData.artists.map(({ name, uri }, index) => (
          <React.Fragment key={uri}>
            <NewTabLink
              href={uri}
              className={`${styles.spotifyLink} ${styles.artist}`}
            >
              {name}
            </NewTabLink>
            {index !== trackData.artists.length - 1 && " / "}
          </React.Fragment>
        ))}
        •{" "}
        <NewTabLink
          href={trackData.album.uri}
          className={`${styles.spotifyLink} ${styles.album}`}
        >
          {trackData.album.name}
        </NewTabLink>
      </div>
    </div>
  );
});

/**
 * Player component
 */
export const Player = observer((props) => {
  return (
    <>
      <div style={{ display: Boolean(queueStore.currentVideo) ? "none" : "" }}>
        Init message
      </div>
      <div
        className={styles.playerDiv}
        style={{ display: Boolean(queueStore.currentVideo) ? "" : "none" }}
      >
        <YouTube
          className={styles.player}
          opts={{
            playerVars: {
              controls: props.showControls,
            },
          }}
          onReady={playerStore.onYoutubeReady}
          onStateChange={playerStore.handleEvents}
          onError={playerStore.handleErrors}
        />
        {/* <TrackMetadata /> */}
        <div className={styles.controlsDiv}>
          <PlayerControls isHost={props.isHost} />
          <div className={styles.videoDetailsDiv}>
            <div>
              <div>
                {queueStore.currentVideo &&
                  numFormatter(
                    queueStore.currentVideo.statistics.viewCount
                  )}{" "}
                views
              </div>
              <div>
                {queueStore.currentVideo &&
                  new Date(
                    queueStore.currentVideo.snippet.publishedAt
                  ).toDateString()}
              </div>
              <div>
                {queueStore.currentVideo &&
                  queueStore.currentVideo.snippet.description.substr(
                    0,
                    100
                  )}{" "}
                ...
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>{SessionManager.SessionCount.get()}</div>
              <div>listeners</div>
              <div>more &gt;</div>
            </div>
          </div>
        </div>
        {props.children}
      </div>
    </>
  );
});

export default Player;
