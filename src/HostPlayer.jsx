import React from "react";
import * as auth from "./auth";
import axios from "axios";
import { Player } from "./Player";
import Layout from "./Layout";

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
    connections: 0,
    viewPlayer: false,
    psoCounter: 0,
    session_token: "",
  };

  setTokenRefreshInterval = () => {
    // refresh token
    this.refreshInterval = setInterval(() => {
      axios
        .get(
          "https://us-central1-pogify-database.cloudfunctions.net/refreshToken",
          {
            headers: {
              Authorization: "Bearer " + this.state.session_token,
            },
          }
        )
        .then((res) => {
          window.localStorage.setItem("pogify:token", res.data.token);
          window.localStorage.setItem(
            "pogify:expiresAt",
            res.data.expiresIn * 1000 + Date.now()
          );
          this.setState({
            session_token: res.data.token,
          });
        });
    }, 30 * 60 * 1000);
  };

  async publishUpdate(uri, position, playing) {
    try {
      await axios.post(
        "https://us-central1-pogify-database.cloudfunctions.net/postUpdate",
        {
          uri,
          position,
          playing,
          timestamp: Date.now(),
        },
        {
          headers: {
            Authorization: "Bearer " + this.state.session_token,
          },
        }
      );
    } catch (e) {
      // backoff implementation
    }
  }

  connect = () => {
    this.player.addListener("ready", (e) => {
      console.log(e);
      this.connectToPlayer(e.device_id);
      this.setTokenRefreshInterval();
      console.log(window.sessionStorage.getItem("expires_at"));

      this.setState({
        device_id: e.device_id,
      });
    });
    this.player.addListener("not_ready", console.log);
    this.player.on("initialization_error", ({ message }) => {
      console.error("Failed to initialize", message);
    });
    this.player.on("authentication_error", ({ message }) => {
      console.error("Failed to authenticate", message);
    });
    this.player.on("account_error", ({ message }) => {
      console.error("Failed to validate Spotify account", message);
    });
    this.player.on("playback_error", ({ message }) => {
      console.error("Failed to perform playback", message);
    });
    this.player.connect();
  };

  initializePlayer = () => {
    this.player = new window.Spotify.Player({
      volume: 0.2,
      name: "Pogify Host",
      getOAuthToken: (callback) => {
        let token = window.sessionStorage.getItem("access_token");
        let refreshToken = window.sessionStorage.getItem("refresh_token");
        let expire = window.sessionStorage.getItem("expires_at");
        if (Date.now() > expire && refreshToken) {
          return auth
            .refreshToken(refreshToken)
            .then((data) => {
              this.setState({
                loggedIn: true,
              });
              callback(data.access_token);
            })
            .catch((e) => {
              if ((e.error_description = "Refresh Token Revoked")) {
                window.sessionStorage.removeItem("refresh_token");
                window.sessionStorage.removeItem("access_token");
                auth.goAuth(this.props.match.params.id);
              }
            });
        }

        if (token) {
          this.setState({
            loggedIn: true,
          });
          return callback(token);
        }
        let code = window.sessionStorage.getItem("code");
        if (code) {
          auth.getToken(code).then((data) => {
            window.sessionStorage.removeItem("code");
            console.log(data);
            this.setState({
              loggedIn: true,
            });
            callback(data.access_token);
          });
        } else {
          auth.goAuth(this.props.match.params.id);
        }
      },
    });
    this.player.on("player_state_changed", (data) => {
      console.log(data);
      if (this.state.psoCounter && !data) {
        this.props.socket.emit("HOST_DISCONNECT");

        alert(
          "Spotify disconnected. Check that you are connected to the 'Michael Reeves Player' on Spotify"
        );
      }
      if (data) {
        console.log("alksdfe", data);
        this.setState({
          playbackStateObj: data,
          position: data.position,
          psoCounter: this.state.psoCounter + 1,
        });
      }
    });
  };

  componentDidMount() {
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
    this.player.removeListener("ready");
    this.props.socket.disconnect();
    this.player.disconnect();
    clearInterval(this.refreshInterval);
  }

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

  render() {
    if (Date.now() > window.sessionStorage.getItem("expires_at")) {
      return (
        <Layout>
          <button onClick={this.connect}>Login with Spotify</button>
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
    let album = this.state.playbackStateObj.track_window.current_track.album
      .name;
    let artists = this.state.playbackStateObj.track_window.current_track
      .artists;
    let title = this.state.playbackStateObj.track_window.current_track.name;

    return (
      <>
        <Player
          position={position / 1000}
          duration={duration / 1000}
          coverArtURL={coverArtURL}
          album={album}
          title={title}
          artists={artists}
          playing={!paused}
          volume={volume}
          changeVolume={this.changeVolume}
        />
        <div
          style={{
            width: 300,
            textAlign: "center",
            backgroundColor: "#424242",
            borderRadius: 10,
            padding: 30,
            marginTop: 10,
          }}
        >
          You are the host of this session. <br />
          Share the url below to listen with others:
          <div style={{ margin: 10 }}>
            <input type="text" readOnly value={window.location.href} />
          </div>
          Use Spotify as you usually would. <br />
          Your music is being played in this browser window. Don't close this
          window. <br />
          {this.state.connections} in this session.
        </div>
      </>
    );
  }
}
