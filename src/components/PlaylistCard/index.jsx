import React, { useEffect, useState } from "react";
import { playlistStore, queueStore, playerStore } from "../../stores";
import { FontAwesomeIcon as FAI } from "@fortawesome/react-fontawesome";
import { faPlay, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "./index.module.css";
import { numFormatter } from "../../utils/formatters";

const PlaylistItemList = (props) => {
  const [list, setList] = useState({});
  var getting = false;
  useEffect(() => {
    if (props.showList) {
      (async function () {
        getting = true;
        setList(await playlistStore.getPlaylistItems(props.id));
        getting = false;
      })();
      setTimeout(() => {
        if (!getting && list.items) {
          (async function () {
            setList(await playlistStore.getPlaylistItems(props.id));
            getting = false;
          })();
        }
      }, 1000);
    } else {
      setTimeout(() => {
        setList({});
      }, 400);
    }
  }, [props.showList]);

  return (
    <div className={styles.playlistItems}>
      <div style={{ overflow: "auto", height: "100%" }}>
        <h2>{props.title}</h2>
        {list.items &&
          list.items.map((item) => {
            return <PlaylistItem key={item.id} item={item} />;
          })}
        {!list.items && <div>loading </div>}
      </div>
    </div>
  );
};

export const PlaylistItem = (props) => {
  const {
    snippet: {
      title,
      channelTitle,
      thumbnails: {
        default: { url: thumbnailUrl },
      },
    },
    statistics: { viewCount },
  } = props.item;

  return (
    <div style={{ display: "flex" }}>
      <div>
        <img src={thumbnailUrl} alt={"thumbnail for " + title} />
      </div>
      <div>
        {title} | {channelTitle} | {numFormatter(viewCount)} Views
        <div>
          <button
            onClick={(e) => {
              e.preventDefault();
              queueStore.addNext(props.item);
            }}
          >
            Play Next
          </button>
          <button
            onClick={(e) => {
              queueStore.addToQueue(props.item);
            }}
          >
            Add to Queue
          </button>
        </div>
      </div>
    </div>
  );
};

export const PlaylistCard = (props) => {
  const [showList, setShow] = React.useState(false);

  return (
    <div
      className={styles.card}
      tabIndex={0}
      onFocus={() => {
        console.log("focus");
        setShow(true);
      }}
      // onBlur={() => {
      //   console.log("blur");
      //   setShow(false);
      // }}
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
      <PlaylistItemList
        showList={showList}
        title={props.title}
        id={props.id}
      ></PlaylistItemList>
    </div>
  );
};
