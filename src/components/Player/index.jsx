import React from "react";
import { observer } from "mobx-react";
import * as SessionManager from "../../utils/sessionManager";
import { playerStore } from "../../stores";
import { secondsToTimeFormat } from "../../utils/formatters";
import { FontAwesomeIcon as FAI } from "@fortawesome/react-fontawesome";
import * as feather from "feather-icons";
import {
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";
import "semantic-ui-css/components/progress.min.css";

import { Progress } from "semantic-ui-react";

import NewTabLink from "../utils/NewTabLink";
import PoweredBySpotify from "../utils/PoweredBySpotify";

import styles from "./index.module.css";

// Allow MobX to optimize data that does not change regularly
const TrackMetadata = observer(() => {
  if (!playerStore.data.track_window) {
    return null;
  }
  const trackData = playerStore.data.track_window.current_track;

  return (
    <>
      <img
        src={trackData.album.images[0].url}
        className={styles.albumArt}
        alt=""
      />
      <div className={styles.songInfo}>
        <span className={styles.infoBold}>
          <NewTabLink
            href={trackData.uri}
            className={`${styles.spotifyLink} ${styles.title}`}
          >
            <div className={styles.overflowEllipses}>{trackData.name}</div>
          </NewTabLink>
        </span>
        <div className={styles.overflowEllipses}>
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
    </>
  );
});

// transform [0,1] => [-1,1]
const transform = (a) => a * 2 - 1;
// transform [-1.1] => [0,1]
const untransform = (b) => {
  return (b + 1) / 2;
};

// transform into sigmoid
const sig = (x) => 1 / (1 + Math.E ** -(5 * x));

// transform sigmoid back to linear
const invSig = (y) => Math.log(y / (1 - y)) / 5;

// transforms linear input volume to sigmoid if <0.5
const input = (vol) => {
  if (vol >= 0.5) {
    return transform(vol);
  } else if (vol === 0) {
    return -1;
  } else {
    return invSig(vol);
  }
};

// transforms sigmoid into linear
const output = (vol) => {
  if (vol === -1) {
    return 0;
  }
  return vol > 0 ? untransform(vol) : sig(vol);
};

/**
 * Player component
 */
export const Player = observer((props) => {
  // if playerStore doesn't have data then player not connected

  // deconstruct playerStore stuff
  const {
    volume,
    playing,
    data: { duration },
    device_connected,
  } = playerStore;

  // set volume handler
  const setVolume = (e) => {
    playerStore.setVolume(output(parseFloat(e.target.value)));
  };

  const seek = (e) => {
    if (props.isHost) {
      playerStore.seek(e.target.value * 1000);
    }
  };
  return (
    <div className={styles.player}>
      <div className={styles.playerInfoBar}>
        <TrackMetadata />
        <div className={styles.listenerInfo}>
          <span className={styles.infoBold}>
            {SessionManager.SessionCount.get()}
          </span>
          <br />
          Listeners
        </div>
      </div>
      <div className={styles.playerBar}>
        {!device_connected && (
          <div className={styles.connectSpotify}>
            <button
              onClick={() =>
                playerStore.connectToPlayer(playerStore.device_id, true)
              }
            >
              Click to connect Spotify
            </button>
          </div>
        )}
        {device_connected && (
          <>
            {props.isHost && (
              <div
                className={styles.playButtonWrapper}
                onClick={() => playerStore.togglePlay()}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: playing
                      ? feather.icons.pause.toSvg()
                      : feather.icons.play.toSvg(),
                  }}
                ></div>
              </div>
            )}
            <div className={styles.seekContainer}>
              {secondsToTimeFormat(playerStore.position / 1000)}
              <CustomSlider
                onChange={seek}
                canChange={props.isHost}
                min={0}
                max={duration / 1000}
                warn={props.warn}
                value={playerStore.position / 1000}
              />
              {secondsToTimeFormat(duration / 1000)}
            </div>
            <div className={styles.volumeContainer}>
              <div
                onClick={playerStore.setMute}
                dangerouslySetInnerHTML={{
                  __html:
                    volume === 0
                      ? feather.icons["volume-x"].toSvg()
                      : volume < 0.02
                      ? feather.icons["volume"].toSvg()
                      : volume < 0.5
                      ? feather.icons["volume-1"].toSvg()
                      : feather.icons["volume-2"].toSvg(),
                }}
              ></div>
              <CustomSlider
                value={input(parseFloat(volume))}
                onChange={setVolume}
                min={-1}
                max={1}
                step={0.01}
                canChange
              />
            </div>
          </>
        )}
        <PoweredBySpotify />
      </div>
    </div>
  );
  // return (
  //   <div className={styles.player}>
  //     <TrackMetadata />
  //     {props.children}
  //   </div>
  // );
});

const CustomSlider = (props) => (
  <div
    className={`${styles.progressBarContainer} ${
      props.canChange ? styles.canChange : ""
    }`}
  >
    <input
      type="range"
      name="position"
      id="position"
      value={props.value}
      onChange={props.onChange}
      min={props.min}
      step={props.step}
      max={props.max}
    />
    <Progress
      className={`${styles.progressBar} ${props.warn ? styles.warn : ""} ${
        props.canChange ? styles.canChange : ""
      }`}
      size="small"
      percent={((props.value - props.min) / (props.max - props.min)) * 100}
    />
  </div>
);

export default Player;
