import React from "react";
import { observer } from "mobx-react";
import * as gapiAuth from "../../../utils/gapiAuth";
import { playlistStore } from "../../../stores";
import { PlaylistCard } from "../../PlaylistCard";

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
export const PlaylistList = observer(_PlaylistList);
