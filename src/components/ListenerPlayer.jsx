import React from "react";
import * as auth from "../utils/spotifyAuth";
import axios from "axios";
import { Player } from ".";
import { Layout } from "../layouts";
import { Donations } from "./Donations";

export default class ListenerPlayer extends React.Component {
  playReq = false;
  state = {
    volume: 0.2,
    device_id: "",
    loading: true,
    lastTimestamp: 0,
    subConnected: false,
    hostUri: "",
    hostConnected: false,
    hostPlaying: false,
    hostPosition: 0,
    listenerUri: "",
    listenerPosition: 0,
    listenerPlaying: false,
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
      if (this.state.hostUri && !uri) {
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
      let t0 = performance.now()
      this.setState(({lastTimestamp}) => {
        // if the incoming timestamp is older than the set timestamp, it is stale. ignore it
        if (timestamp < lastTimestamp) {
          return {};
        }

        // if this is playing connect calc position if is playing
        let calcPos = playing ? position + Date.now() - timestamp + performance.now() - t0: position;
        return {
          lastTimestamp: timestamp,
          hostUri: uri,
          hostPosition: calcPos,
          hostPlaying: playing,
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
        listenerUri: data.track_window.current_track.uri,
        listenerPosition: data.position,
      });
    });
  };


  async componentDidUpdate(_prevProps, prevState) {
    if (this.state.hostConnected && this.state.pso) {

      // if hostPosition and listenerPosition are far apart then seek to host Position
      if (Math.abs(this.state.hostPosition - this.state.listenerPosition) > 200 && this.state.listenerPlaying) {
        console.log("stutter",this.state.hostPosition, this.state.listenerPosition,this.state.hostPosition - this.state.listenerPosition)
        this.setState(({hostPosition})=> {
          this.player.seek(hostPosition)
          this.l_p0 = hostPosition
          this.l_t0 = performance.now()
          this.h_p0 = hostPosition
          this.h_t0 = performance.now()

        })
      }

      // if host is paused           and listener is paused         but is player is playing then pause
      if (!this.state.hostPlaying && !this.state.listenerPlaying && !this.state.pso.paused) {
        this.player.pause()
      }

      // local var for if listener should play.
      // since state doesn't change within function set a var and change it 
      let shouldListenerPlay = this.state.listenerPlaying

      // if  host starts playing then set tick
      if (this.state.hostPlaying && !this.hostTick) {
        // if listener is also playing then 
        if (this.state.listenerPlaying) {
          this.player.resume()
        }
        this.h_t0 = performance.now()
        this.h_p0 = this.state.hostPosition
        this.hostTick = setInterval(()=>{
          window.requestAnimationFrame((time)=>{
            this.setState({
              hostPosition: time - this.h_t0 + this.h_p0
            })
          })
        }, 100)
      } else if (!this.state.hostPlaying) {
        clearInterval(this.hostTick)
        clearInterval(this.listenerTick)
        this.player.pause()
        shouldListenerPlay = false
        this.hostTick = undefined
        this.listenerTick = undefined
      }

      if (this.state.hostUri !== this.state.listenerUri) {
        this.play(this.state.hostUri, this.state.hostPosition)
      }

      // if the listener is listening then set tick for listener
      if (shouldListenerPlay && !this.listenerTick) {
        this.player.resume()
        this.l_t0 = performance.now()
        this.l_p0 = this.state.listenerPosition
        this.listenerTick = setInterval(()=>{
          window.requestAnimationFrame(time=>{
            this.setState({
              listenerPosition: time - this.l_t0 + this.l_p0
            })
          })
        }, 100)
      } else if (!shouldListenerPlay) {
        this.player.pause()
        clearInterval(this.listenerTick)
        this.listenerTick = undefined
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
    window.player = this.player
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
    let { duration } = this.state.pso;
    let volume = this.state.volume;
    let position = this.state.listenerPosition;
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
            togglePlay={() => this.setState({
              listenerPlaying: !this.state.listenerPlaying
            })}
            playing={this.state.listenerPlaying}
            volume={volume}
            changeVolume={this.changeVolume}
          >
            <div>
              {!this.state.hostPlaying && "Paused by host"}
              {this.state.hostPlaying && <div style={{height:"1rem"}}/>}
            </div>
          </Player>

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
