import { extendObservable, autorun, action, runInAction } from "mobx";
import { queueStore } from ".";

import * as gapiAuth from "../utils/gapiAuth";

export class PlaylistStore {
  constructor() {
    extendObservable(this, {
      signedIn: false,
      playlists: [],
      playlistsNextPageToken: "",
      playlistCache: {},
    });

    this.playlistGetterOnSigninAutorunDisposer = autorun((r) => {
      if (gapiAuth.gapiSignedIn.get()) {
        r.dispose();
        this.getUserPlaylists();
      }
    });
  }

  addPlaylistToQueue = async (playlistId) => {
    let playlistItems = await this.getPlaylistItems(playlistId);
    queueStore.addMultipleToQueue(playlistItems.items);
  };

  getPlaylistItems = async (playlistId, force) => {
    if (this.playlistCache[playlistId] && !force) {
      console.log("return cache");
      return this.playlistCache[playlistId];
    }
    if (force) {
      console.log("force getPlaylistItems");
    }

    let playlistItemsRes = await window.gapi.client.youtube.playlistItems.list({
      playlistId,
      maxResults: 50,
      part: "snippet",
    });
    this.playlistCache[playlistId] = {
      items: playlistItemsRes.result.items,
      nextPageToken: playlistItemsRes.result.nextPageToken,
    };
    return this.playlistCache[playlistId];
  };

  hasNextPage = (playlistId) => {
    return (
      this.playlistCache[playlistId] &&
      !this.playlistCache[playlistId].nextPageToken
    );
  };

  getNextPage = action(async (playlistId) => {
    if (!this.hasNextPage(playlistId)) return;

    let playlistItemsRes = await window.gapi.client.youtube.playlistItems.list({
      playlistId,
      maxResults: 50,
      part: "snippet",
      pageToken: this.playlistCache[playlistId].nextPageToken,
    });
    runInAction(() => {
      this.playlistCache[playlistId].items = this.playlistCache[
        playlistId
      ].items.concat(playlistItemsRes.result.items);
      this.playlistCache[playlistId].nextPageToken =
        playlistItemsRes.result.nextPageToken;
    });
  });

  getNextPlaylists = action(async () => {
    if (!this.playlistsNextPageToken) return;
    let nextPage = await window.gapi.client.youtube.playlists.items({
      part: "snippet",
      maxResults: 50,
      pageToken: this.playlistsNextPageToken,
    });

    this.playlistsNextPageToken = nextPage.result.nextPageToken;
    this.playlists = this.playlists.concat(nextPage.result.items);
  });

  getMixPlaylistFromVideo = action(async (videoId) => {
    // this is a hack someone found. monitor for changes
    let mixPlaylist = await this.getPlaylistItems("RD" + videoId);
  });

  getUserPlaylists = action(async () => {
    const playlists = await window.gapi.client.youtube.playlists.list({
      part: "snippet",
      mine: "true",
      maxResults: "50",
    });
    this.playlists.replace(playlists.result.items);
    this.playlistsNextPageToken = playlists.result.nextPageToken;
    console.log(this.playlists);
  });
}
