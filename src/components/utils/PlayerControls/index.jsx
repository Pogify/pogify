import React from "react";

import { playerStore } from "../../../stores";
import { secondsToTimeFormat } from "../../../utils/formatters";

import { FontAwesomeIcon as FAI } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";
import { Progress } from "semantic-ui-react";

import styles from "./index.module.css";
import { observer } from "mobx-react";

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

export const PlayerControls = observer((props) => {
  // set volume handler
  const setVolume = (e) => {
    playerStore.setVolume(output(parseFloat(e.target.value)));
  };

  const seek = (e) => {
    if (props.isHost) {
      playerStore.seek(+e.target.value);
    }
  };

  const mouseDown = () => {
    console.log("mouseDown");
    playerStore.seeking = true;
  };
  const mouseUp = () => {
    console.log("mouseUp");
    playerStore.seeking = false;
  };
  return (
    <div>
      <div className={styles.seekContainer}>
        {secondsToTimeFormat(playerStore.position)}
        <CustomSlider
          onChange={seek}
          canChange={props.isHost}
          onMouseDown={mouseDown}
          onMouseUp={mouseUp}
          min={0}
          max={playerStore.duration}
          warn={props.warn}
          value={playerStore.position}
        />
        {secondsToTimeFormat(playerStore.duration)}
      </div>
      <div className={styles.volumeContainer}>
        <FAI
          icon={faVolumeMute}
          className={styles.muteButton}
          onClick={playerStore.setMute}
        />
        <CustomSlider
          value={input(parseFloat(playerStore.volume))}
          onChange={setVolume}
          min={-1}
          max={1}
          step={0.01}
          canChange
        />
        <FAI icon={faVolumeUp} />
      </div>
      {props.isHost && (
        <div
          className={styles.playButtonWrapper}
          onClick={playerStore.togglePlay}
        >
          {playerStore.playing ? <FAI icon={faPause} /> : <FAI icon={faPlay} />}
        </div>
      )}
    </div>
  );
});

const CustomSlider = (props) => (
  <div
    className={`${styles.progressBarContainer} ${
      props.canChange ? styles.canChange : ""
    }`}
  >
    <input
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
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
