import React from "react";
import * as auth from "../utils/spotifyAuth";
import * as SessionManager from "../utils/sessionManager";
import {debounce} from "../utils/debounce"
import axios from "axios";
import { Player, Donations } from ".";
import { Layout } from "../layouts";


export default class HostPlayer extends React.Component {
  state = {
    position: 0,
    duration: 0,
    connected: false,
    uri: "",
    playing: false,
    coverArtURL: "",
    title: "",
    artists: [],
    album: "",
    device_id: "",
    volume: 0.2,
    hostConnected: false,
    loading: true,
    connections: "∞",
    viewPlayer: false,
    psoCounter: 0,
    session_token: "",
  };

  setTokenRefreshInterval = () => {
    // refresh token
    this.refreshInterval = setInterval(
      SessionManager.refreshToken,
      30 * 60 * 1000,
      [window.localStorage.getItem("pogify:token")]
    );
  };

  async publishUpdate(uri, position, playing) {
    SessionManager.publishUpdate(uri, position, playing);
  }

  connect = () => {
    this.player.addListener("ready", (e) => {
      console.log(e);
      this.connectToPlayer(e.device_id);
      this.setTokenRefreshInterval();
      console.log(window.sessionStorage.getItem("expires_at"));

      this.setState({
        device_id: e.device_id,
        loggedIn: true,
      });
    });
    this.player.connect();
  };

  initializePlayer = () => {
    window.spotifyReady = true;
    this.player = auth.getPlayer("Pogify Host");


    this.player.on("player_state_changed", debounce((data) => {
    // debounce incoming data. 
      if (this.state.psoCounter && !data) {
        // player has been played, but no data is coming from spotify
        // push disconnect update
        this.publishUpdate("", this.state.position, false);

        // show a modal and/or send a notification on disconnect
        alert(
          "Spotify disconnected. Check that you are connected to 'Pogify Host' on Spotify"
        );
      }
      if (data) {
        this.setState({
          playbackStateObj: data,
          position: data.position,
          psoCounter: this.state.psoCounter + 1,
        });
      }
      // it seems 300 is about a good sweet spot for debounce.
      // Hesitant to raise it anymore because it would increase latency to listener
    }, 300));
    this.setState({ loading: false });
  };

  connectToPlayer = (device_id) => {
    return axios
      .put(
        `https://api.spotify.com/v1/me/player`,
        {
          device_ids: [device_id || this.state.device_id],
          play: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.sessionStorage.getItem(
              "access_token"
            )}`,
          },
        }
      )
      .then(() => {
        this.setState({
          connected: true,
        });
      });
  };

  changeVolume = (e) => {
    this.player.setVolume(e.target.value);
    this.setState({
      volume: e.target.value,
    });
  };

  componentDidMount() {
    window.onbeforeunload = () => {
      this.publishUpdate("", this.state.position, false);
    };

    this.setState({
      session_token: window.localStorage.getItem("pogify:token"),
    });

    if (window.spotifyReady) {
      this.initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = this.initializePlayer;
    }
  }

  componentDidUpdate(
    _prevProps,
    { playbackStateObj: pPSO, psoCounter: ppsoC }
  ) {
    if (!pPSO) {
      return;
    }

    if (ppsoC !== this.state.psoCounter) {
      let {
        track_window: {
          current_track: { uri },
        },
        position,
        paused,
      } = this.state.playbackStateObj;
      this.publishUpdate(uri, position, !paused);

      if (pPSO.paused !== paused) {
        if (paused) {
          clearInterval(this.tickInterval);
        } else {
          this.tickInterval = setInterval(() => {
            this.setState({
              position: this.state.position + 1000,
            });
          }, 1000);
        }
      }
    }
  }

  componentWillUnmount() {
    this.player.removeListener("player_state_changed")
    // remove player_state_changed listener on unmount
    this.publishUpdate("", this.state.position, false);
    window.onbeforeunload = null;
    this.player.disconnect();
    clearInterval(this.refreshInterval);
  }

  render() {
    if (Date.now() > window.sessionStorage.getItem("expires_at")) {
      return (
        <Layout>
          <button onClick={this.connect}>Login with Spotify</button>
        </Layout>
      );
    }

    if (this.state.loading) {
      return (
        <Layout>
          <div>Loading</div>
        </Layout>
      );
    }

    if (!this.state.playbackStateObj) {
      return (
        <Layout>
          <button onClick={this.connect}>Start Session</button>
        </Layout>
      );
    }

    let { paused, duration } = this.state.playbackStateObj;
    let { volume } = this.state;
    let position = this.state.position;
    let coverArtURL = this.state.playbackStateObj.track_window.current_track
      .album.images[0].url;
    let {
      name: album,
      uri: albumURI,
    } = this.state.playbackStateObj.track_window.current_track.album;
    let artists = this.state.playbackStateObj.track_window.current_track
      .artists;
    let {
      name: title,
      uri: titleURI,
    } = this.state.playbackStateObj.track_window.current_track;

    return (
      <Layout>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Player
            uri={{ title: titleURI, album: albumURI }}
            position={position / 1000}
            duration={duration / 1000}
            coverArtURL={coverArtURL}
            album={album}
            title={title}
            artists={artists}
            togglePlay={() => this.player.togglePlay()}
            playing={!paused}
            volume={volume}
            changeVolume={this.changeVolume}
          />
          <div
            style={{
              width: 400,
              textAlign: "center",
              padding: 30,
            }}
          >
            <h2>Hosting to {this.state.connections} listeners.</h2>
            <p style={{ textAlign: "justify" }}>
              You can continue using Spotify as you normally would. The music is
              playing through this browser tab, you can open this tab in a new
              window to exclude it from OBS.
              <b> Please do not close this tab.</b>
            </p>
            <p style={{ marginTop: 40 }}>
              Share the url below to listen with others:
              <br />
              {window.location.href}
            </p>
            <p style={{ marginBottom: 0 }}>Playback powered by</p>
            <a href="https://www.spotify.com">
              <img
                alt="Spotify Logo"
                width="80px"
                height="24px"
                style={{ verticalAlign: "middle", padding: 12 }}
                src="/spotify-logo-green.png"
              />
            </a>
            <Donations />
          </div>
        </div>
      </Layout>
    );
  }
}
