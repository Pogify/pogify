import React from "react";
import * as auth from "../utils/spotifyAuth";
import axios from "axios";
import { Player } from ".";
import { Layout } from "../layouts";
import { Donations } from "./Donations";

export default class ListenerPlayer extends React.Component {
  playReq = false;
  state = {
    hostConnected: false,
    subConnected: false,
    spotConnected: false,
    loading: true,
    artists: [],
    position: 0,
    uri: "",
    duration: 0,
    volume: 0.2,
    playing: false,
    title: "",
    album: "",
    connections: 0,
  };

  play = (uri, pos_ms) => {
    if (this.playReq) {
      return;
    } else {
      this.playReq = true;
    }

    console.log("play??", uri, pos_ms);
    return axios
      .put(
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
      )
      .then(() => {
        setTimeout(() => {
          this.playReq = false;
        }, 1000);
      });
  };

  setListenerListeners = () => {
    console.log(process.env.REACT_APP_SUB);
    this.eventListener = new EventSource(
      process.env.REACT_APP_SUB + "/sub/" + this.props.sessionId + ".b1"
    );

    this.eventListener.onopen = () => {
      this.setState({
        subConnected: true,
      });
    };

    this.eventListener.onmessage = (event) => {
      console.log(event.data);
      let { timestamp, uri, position, playing } = JSON.parse(event.data);
      console.log(event.data);
      if (this.state.uri && !uri) {
        this.setState({
          playing: false,
        });
        alert("Host disconnected. Playback Paused");
        return;
      } else if (!uri) {
        this.setState({
          hostConnected: false,
        });
        return;
      }

      this.setState((prevState) => {
        // if the incoming timestamp is older than the set timestamp, it is stale. ignore it
        if (prevState.timestamp && timestamp < prevState.timestamp) {
          return {};
        }
        // if spotify is doing the divide by 1000 bug don't do anything
        // if (Math.abs(prevState.timestamp / 1000 - timestamp) > 2) {
        //   return {};
        // }

        // if this is playing connect calc position if is playing
        let calcPos = playing ? position + Date.now() - timestamp : position;
        return {
          timestamp,
          uri,
          position: calcPos,
          playing,
          hostConnected: true,
        };
      });
    };

    this.eventListener.onerror = console.error;

    this.player.addListener("player_state_changed", (data) => {
      console.log("player_state_changed");
      if (data === null) return;

      this.setState({
        pso: data,
        uri: data.uri,
        position: data.position,
        duration: data.duration,
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

      if (
        (prevState.uri !== this.state.uri ||
          this.state.uri !== this.state.pso.uri) &&
        this.state.uri
      ) {
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
        console.log("connect");
        this.setState({
          device_id: e.device_id,
          spotConnected: true,
        });
      });
    });

    this.player.connect().then(console.log);
  };

  componentWillUnmount() {
    if (this.eventListener) {
      this.eventListener.close();
    }
    if (this.player) {
      this.player.disconnect();
    }
  }

  initializePlayer = () => {
    window.spotifyReady = true;
    this.player = auth.getPlayer("Pogify Listener");
    this.setState({ loading: false });
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
      return (
        <Layout>
          <button onClick={this.connect}>Login with Spotify</button>
        </Layout>
      );
    }

    // if loading sdk show loading
    if (this.state.loading) {
      return (
        <Layout>
          <div>Loading...</div>
        </Layout>
      );
    }
    // if any are false allow join
    if (!this.state.spotConnected || !this.state.subConnected) {
      return (
        <Layout>
          <button onClick={this.connect}>Join Session</button>
        </Layout>
      );
    }

    if (!this.state.hostConnected) {
      return (
        <Layout>
          <h2>Waiting for Host...</h2>{" "}
          <p>Session Code: {this.props.sessionId}</p>
        </Layout>
      );
    }

    if (!this.state.pso) {
      return (
        <Layout>
          <h2>Pogify Disconnected</h2> <p>Return to home screen</p>
        </Layout>
      );
    }
    let { paused, duration } = this.state.pso;
    let volume = this.state.volume;
    let position = this.state.position;
    let coverArtURL = this.state.pso.track_window.current_track.album.images[0]
      .url;
    let {
      name: album,
      uri: albumURI,
    } = this.state.pso.track_window.current_track.album;
    let artists = this.state.pso.track_window.current_track.artists;
    let {
      name: title,
      uri: titleURI,
    } = this.state.pso.track_window.current_track;

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
              You are listening to session: {this.props.sessionId}. Your
              playback is controlled by the host. Pressing pause will pause
              playback locally only. On resume, playback will resynchronise with
              the host. Controlling Spotify will not work ass long as you are
              connected to "Pogify Listener". The music is playing through the
              browser, <b> please do not close this tab.</b>
            </p>
            <p style={{ marginTop: 40 }}>
              Share the url below to listen with others:
              <br />
              {window.location.href}
            </p>
            <p style={{ marginBottom: 5 }}>Playback powered by</p>
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
