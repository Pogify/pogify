import React from "react";
import { FontAwesomeIcon as FAI } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { secondsToTimeFormat } from '../utils/formatters'
import { observer } from "mobx-react";
import { useStores } from "../hooks/useStores";

// inherit style from parents
const InheritA = styled.a`
  color: inherit;
  text-decoration: inherit;
  margin: 0 3px;

  &:hover {
    /* color: grey; */
    text-decoration: underline;
  }
`;

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
  const {playerStore} = useStores()

  // if playerStore doesn't have data then player not connected
  if (!Object.keys(playerStore.data).length) {
    return <div>Spotify not connected</div>
  }
  
  // deconstruct playerStore stuff
  const {
    volume,
    playing,
    data: {
      duration,
      track_window: {
        current_track
      },
    },
   
  } = playerStore


  // set volume handler
  const setVolume = (e) => {
    playerStore.setVolume( output(parseFloat(e.target.value)))

  };

  return (
    <div
      style={{
        width: 300,
        textAlign: "center",
        borderRadius: 10,
        padding: 30,
      }}
    >
      <div
        style={{
          height: 300,
          width: 300,
          overflow: "hidden",
        }}
      >
        <img src={current_track.album.images[0].url} alt={`Cover art for ${current_track.album.name}`} />
      </div>
      <div style={{ paddingBottom: 10 }}>
        <h3>
          <InheritA href={current_track.uri}>{current_track.name}</InheritA>
        </h3>
        {current_track.artists.map(({ name, uri }, i) => (
          <InheritA href={uri} key={i}>
            {name}
          </InheritA>
        ))}{" "}
        <br />
        <InheritA href={current_track.album.uri}>{current_track.album.name}</InheritA>
      </div>
      <div>
        {secondsToTimeFormat((playerStore.position)/1000)}
        <input
          style={{ width: "70%" }}
          type="range" 
          name="position"
          id="position"
          value={(playerStore.position)/1000}
          min={0}
          max={duration/1000}
          readOnly
        />
        {secondsToTimeFormat(duration/1000)}
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
        <div style={{ cursor: "pointer" }} onClick={()=>playerStore.togglePlay()}>
          {playing ? <FAI icon={faPause} /> : <FAI icon={faPlay} />}
        </div>
      )}
      {props.children}
    </div>
  );
})

