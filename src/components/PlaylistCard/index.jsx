import React from "react";
import { playlistStore, queueStore, playerStore } from "../../stores";
import { FontAwesomeIcon as FAI } from "@fortawesome/react-fontawesome";
import { faPlay, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "./index.module.css";

export const PlaylistCard = (props) => {
  const [showList, setShow] = React.useState(false);

  return (
    <>
      <div
        className={styles.card}
        tabIndex={0}
        onFocus={() => {
          setShow(true);
        }}
        onBlur={() => {
          setShow(false);
        }}
        data-bottom="600px"
      >
        <div className={styles.thumbnail}>
          <div className={styles.queueControl}>
            <div
              data-hover="Play All"
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                queueStore.clearQueue();
                await playlistStore.addPlaylistToQueue(props.id, true);
              }}
              onFocus={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              tabIndex={0}
            >
              <FAI icon={faPlay} />
            </div>
            <div
              data-hover="Add to Queue"
              onClick={(e) => {
                e.stopPropagation();
                playlistStore.addPlaylistToQueue(props.id);
              }}
              onFocus={(e) => e.stopPropagation()}
              tabIndex={0}
            >
              <FAI icon={faPlus} />
            </div>
          </div>
          <img
            src={props.imgUrl}
            alt={`thumbnail for ${props.title}`}
            width="180px"
          />
        </div>
        <div>{props.title}</div>
        <div>
          {props.channel} - {props.length} videos
        </div>
        <div
          className={styles.playlistItems}
          style={{
            display: showList ? "" : "none",
          }}
        >
          <div></div>
          <h2>{props.title}</h2>
        </div>
      </div>
    </>
  );
};
