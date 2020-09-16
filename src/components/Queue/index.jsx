import React from "react";

export default function Queue(props) {
  const len = props.items.length;
  return (
    <div>
      <div>
        <h3>Queue</h3>
      </div>
      {props.items.map((item, i) => {
        if (item.id === props.currentId) {
          return <QueueItem current {...item} />;
        }
        return <QueueItem {...item} />;
      })}
    </div>
  );
}

function QueueItem(props) {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {props.current && <div>Currently Playing</div>}
      <div>
        <img
          src={props.thumbnails.default.url}
          alt={"Thumbnail for" + props.title}
        />
      </div>
      <div>{props.title}</div>
    </div>
  );
}
