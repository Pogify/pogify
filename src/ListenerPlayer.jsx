import React from "react";
import * as auth from "./auth";
import axios from "axios";
import { Player } from "./Player";
import Layout from "./Layout";

export default class HostPlayer extends React.Component {
  state = {
    hostConnected: false,
    connected: false,
    artists: [],
    position: 0,
    uri: "",
    duration: 0,
    volume: 0.2,
    playing: false,
    coverArtURL: "#",
    title: "",
    album: "",
    connections: 0,
  };

  play = (uri, pos_ms) => {
    console.log("play??", uri, pos_ms);
    return axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.state.device_id}`,
      {
        uris: [uri],
        position_ms: pos_ms,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.sessionStorage.getItem(
            "access_token"
          )}`,
        },
      }
    );
  };

  setListenerListeners = () => {
    this.props.socket.on("HOST_DISCONNECT", () => {
      this.player.pause();
      alert("Host disconnected. Playback Paused");
    });

    this.props.socket.once("INITIAL", (data) => {
      if (data) {
        let { uri, position, playing, when } = data;
        let calcPos = playing ? position + Date.now() - when : position;
        console.log("intial", uri, position, calcPos, playing, when);
        this.setState({
          uri,
          position: calcPos,
          playing,
          hostConnected: true,
          connected: true,
        });
      } else {
        this.setState({
          connected: true,
        });
      }
    });
    this.props.socket.on("UPDATE", (uri, position, playing) => {
      console.log("update", uri, position, playing);
      this.setState({
        uri,
        position,
        playing,
        hostConnected: true,
      });
    });

    this.props.socket.on("HOST_CONNECTED", (uri, position, playing) => {
      console.log("host_connected");
      this.setState({
        uri,
        position,
        playing,
        hostConnected: true,
      });
    });

    this.player.addListener("player_state_changed", (data) => {
      console.log("player_state_changed");
      if (data === null) return;

      this.setState({
        pso: data,
      });
    });
  };

  async componentDidUpdate(_prevProps, prevState) {
    if (this.state.hostConnected && this.state.pso) {
      if (this.state.playing !== !this.state.pso.paused) {
        if (this.state.playing) {
          this.player.resume();
          if (!this.tick) {
            this.tick = setInterval(() => {
              this.setState({
                position: this.state.position + 100,
              });
            }, 100);
          }
        } else {
          clearInterval(this.tick);
          delete this.tick;
          this.player.pause();
          this.setState({
            pso: await this.player.getCurrentState(),
          });
        }
      }
      if (Math.abs(this.state.position - prevState.position) > 200) {
        this.player.seek(this.state.position);
      }

      if (prevState.uri !== this.state.uri) {
        console.log("setTrack", this.state.uri, this.state.position);
        this.play(this.state.uri, this.state.position);
      }
    }
  }

  connect = () => {
    console.log("once");
    this.player.addListener("ready", (e) => {
      console.log(e);
      this.setListenerListeners();

      this.connectToPlayer(e.device_id).then(() => {
        this.props.socket.emit("INITIAL");
      });
      this.setState({
        device_id: e.device_id,
      });
    });
    this.player.on("player_state_changed", console.log);
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
    this.player.connect().then(console.log);
    console.log("connect");
  };

  componentWillUnmount() {
    if (this.player) {
      this.player.disconnect();
    }
  }

  initializePlayer = () => {
    this.player = new window.Spotify.Player({
      volume: 0.2,
      name: "Pogify Listener",
      getOAuthToken: (callback) => {
        let token = window.sessionStorage.getItem("access_token");
        let refreshToken = window.sessionStorage.getItem("refresh_token");
        let expire = window.sessionStorage.getItem("expires_at");
        if (Date.now() > expire && refreshToken) {
          return auth
            .refreshToken(refreshToken)
            .then((data) => {
              callback(data.access_token);
            })
            .catch((e) => {
              window.sessionStorage.removeItem("refresh_token");
              window.sessionStorage.removeItem("access_token");
              auth.goAuth(this.props.sessionId);
            });
        }

        if (token) {
          return callback(token);
        }
        let code = window.sessionStorage.getItem("code");
        if (code) {
          auth
            .getToken(code)
            .then((data) => {
              window.sessionStorage.removeItem("code");
              console.log(data);
              callback(data.access_token);
            })
            .catch(() => {
              auth.goAuth(this.props.sessionId);
            });
        } else {
          auth.goAuth(this.props.sessionId);
        }
      },
    });
    window.player = this.player;
    this.props.socket.on("CONNECTION_COUNT", (number) => {
      console.log(number, "connections");
      this.setState({
        connections: number,
      });
    });
  };

  componentDidMount() {
    if (window.spotifyReady) {
      this.initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = this.initializePlayer;
    }
  }

  connectToPlayer = (device_id) => {
    return axios.put(
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
    );
  };

  changeVolume = (e) => {
    this.player.setVolume(e.target.value);
    this.setState({
      volume: e.target.value,
    });
  };

  render() {
    if (Date.now() > window.sessionStorage.getItem("expires_at")) {
      return <Layout><button onClick={this.connect}>Login with Spotify</button></Layout>;
    }

    if (!this.state.connected) {
      return <Layout><button onClick={this.connect}>Join Session</button></Layout>;
    }

    if (!this.state.hostConnected) {
      return <Layout><h2>Waiting for Host...</h2> <p>Session Code: {this.props.sessionId}</p></Layout>;
    }

    if (!this.state.pso) {
      return <Layout><h2>Pogify Disconnected</h2> <p>Return to home screen</p></Layout>;
    }
    let { paused, duration } = this.state.pso;
    let volume = this.state.volume;
    let position = this.state.position;
    let coverArtURL = this.state.pso.track_window.current_track.album.images[0]
      .url;
    let album = this.state.pso.track_window.current_track.album.name;
    let artists = this.state.pso.track_window.current_track.artists;
    let title = this.state.pso.track_window.current_track.name;

    return (
      <Layout>
        <div>
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
              borderRadius: 10,
              padding: 30,
              marginTop: 10,
            }}
          >
            You are listening to session {this.props.sessionId}. <br />
            Playback is controlled by the host. <br />
            Pressing pause will pause playback locally only. On resume, playback
            will resyncronize with the host. <br />
            {this.state.connections} in this session.
          </div>
        </div>
      </Layout>
    );
  }
}
