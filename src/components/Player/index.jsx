import React from "react";
import { observer } from "mobx-react";
import { playerStore } from "../../stores";
import { secondsToTimeFormat } from '../../utils/formatters'
import { FontAwesomeIcon as FAI } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";

import NewTabLink from "../utils/NewTabLink";

import styles from "./index.module.css";


// Allow MobX to optimize data that does not change regularly
const TrackMetadata = observer(() => {
  const trackData = playerStore.data.track_window.current_track
  return (
    <div className={styles.metadataWrapper}>
      <div
        className={styles.albumArt}
      >
        <img src={trackData.album.images[0].url} alt={`Cover art for ${trackData.album.name}`} />
      </div>
      <div>
        <h3>
          <NewTabLink href={trackData.uri} className={styles.spotifyLink}>{trackData.name}</NewTabLink>
        </h3>
        {trackData.artists.map(({ name, uri }) => (
          <NewTabLink href={uri} className={styles.spotifyLink} key={uri}>
            {name}
          </NewTabLink>
        ))}{" "}
        <br />
        <NewTabLink href={trackData.album.uri} className={styles.spotifyLink}>{trackData.album.name}</NewTabLink>
      </div>
    </div>
  )
})

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
  if (!Object.keys(playerStore.data).length) {
    return <div>Spotify not connected</div>
  }

  // deconstruct playerStore stuff
  const {
    volume,
    playing,
    data: {
      duration
    }
  } = playerStore


  // set volume handler
  const setVolume = (e) => {
    playerStore.setVolume(output(parseFloat(e.target.value)))
  };

  const seek = (e) => {
    if (props.isHost) {
      playerStore.seek(e.target.value * 1000)
    }
  }

  return (
    <div
      className={styles.player}
    >

      <TrackMetadata />
      <div>
        {secondsToTimeFormat((playerStore.position) / 1000)}
        <input
          className={styles.seekBar}
          type="range"
          name="position"
          id="position"
          value={(playerStore.position) / 1000}
          onChange={seek}
          min={0}
          max={duration / 1000}
          readOnly
        />
        {secondsToTimeFormat(duration / 1000)}
      </div>
      <div>
        <FAI icon={faVolumeMute} />
        <input
          type="range"
          name="volume"
          id="volume"
          value={input(parseFloat(volume))}
          onChange={setVolume}
          min={-1}
          max={1}
          step={0.01}
        />
        <FAI icon={faVolumeUp} />
      </div>
      {!props.dontShow && (
        <div className={styles.playButtonWrapper} onClick={() => playerStore.togglePlay()}>
          {playing ? <FAI icon={faPause} /> : <FAI icon={faPlay} />}
        </div>
      )}
      {props.children}
    </div>
  );
})

export default Player