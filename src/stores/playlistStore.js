import { extendObservable, autorun, action, runInAction } from "mobx";
import { playerStore, queueStore } from ".";

export class PlaylistStore {
  constructor() {
    this.googleAuth = null;
    extendObservable(this, {
      signedIn: false,
      playlists: [],
      playlistsNextPageToken: "",
      gapiInit: false,
      playlistCache: {},
    });
    let signedInAutorunDisposer = autorun(async (r) => {
      console.log("this.signedIn", this.signedIn);
      if (this.signedIn) {
        r.dispose();
        this.getUserPlaylists();
      } else {
        this.playlists.replace([]);
      }
    });
    window.gapi.load("client:auth2", this.initClient);
  }

  initClient = async () => {
    console.log("init");
    await window.gapi.client.init({
      apiKey: process.env.REACT_APP_GAPI_KEY,
      clientId: process.env.REACT_APP_GAPI_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
      ],
    });
    this.googleAuth = window.gapi.auth2.getAuthInstance();
    this.signedIn = this.googleAuth.isSignedIn.get();
    this.googleAuth.isSignedIn.listen((isSignedIn) => {
      console.log("isslignedin", isSignedIn);
      this.signedIn = isSignedIn;
    });
    this.gapiInit = true;
  };

  signIn = () => {
    console.log("signin");

    this.googleAuth.signIn().then(() => {
      this.signedIn = true;
    });
  };

  addPlaylistToQueue = async (playlistId) => {
    let playlistItems = await this.getPlaylistItems(playlistId);
    console.log(playlistItems);
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
    // this is a hack someone found. monitor for changes)
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
