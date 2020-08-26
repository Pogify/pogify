import React from "react";
import * as auth from "../utils/spotifyAuth";
import axios from "axios";
import { Player } from ".";
import { Layout } from "../layouts";
import { Donations } from "./Donations";
import { storesContext } from "../contexts";
import { autorun } from "mobx"

export default class ListenerPlayer extends React.Component {
  static contextType = storesContext
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
    // governs whether or not the player should play when host presses play.
    hostPausedWhileListenerListening: false,
    // governs whether or not players should start playing on connect 
    playImmediate: false, 
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
      this.setState(({lastTimestamp,hostPausedWhileListenerListening,firstPlay}) => {
        // if the incoming timestamp is older than the set timestamp, it is stale. ignore it
        if (timestamp < lastTimestamp) {
          return {};
        }

        // if this is playing connect calc position if is playing
        let calcPos = playing ? position + Date.now() - timestamp + performance.now() - t0: position;
        return {
          lastTimestamp: timestamp,
          // this value should only be set when host pauses. if playing then inherit from last state.
          hostPausedWhileListenerListening: !playing? this.context.playerStore.playing : hostPausedWhileListenerListening ,
          hostUri: uri,
          hostPosition: calcPos,
          hostPlaying: playing,
          firstPlay: playing || firstPlay, 
          hostConnected: true,
        };
      });
    };

    // TODO: error handling
    this.eventListener.onerror = console.error;
  };


  async componentDidUpdate(_prevProps, prevState) {
    const {playerStore} = this.context
    // multiple calls to set state is still performant because react batches setState
    if (this.state.hostConnected) {

      console.log("stutter",~~(this.state.hostPosition), ~~playerStore.position.value,~~ (this.state.hostPosition - playerStore.position.value), playerStore.playing)
      // // if hostPosition and listenerPosition are far apart then seek to host Position
      if (Math.abs(this.state.hostPosition - playerStore.position.value) > 200 && playerStore.playing) {
            // set new timers
            this.h_p0 = this.state.hostPosition
            this.h_t0 = performance.now()
            // seek
            playerStore.seek(this.state.hostPosition, this.h_t0)
      }


      // if host is paused           but is player is playing then pause
      if (!this.state.hostPlaying && playerStore.playing) {
        this.context.playerStore.pause()
      }

      // local var for if listener should play.
      // since state doesn't change within function set a var and change it 
      let shouldListenerPlay = this.state.listenerPlaying

      // if  host starts playing then set tick
      if (this.state.hostPlaying && !this.hostTick) {
        console.log(this.state.hostPausedWhileListenerListening)
        // if listener is also playing then 
        if (this.state.hostPausedWhileListenerListening) {
          this.context.playerStore.resume()
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
        this.context.playerStore.pause()
        playerStore.playing = false
        this.hostTick = undefined
        this.listenerTick = undefined
      }

      if (this.state.hostUri !== playerStore.data.track_window.current_track.uri) {
        this.context.playerStore.newTrack(this.state.hostUri, this.state.hostPosition)
      }
    }
  }

  connect = async () => {
    console.log("once");
    await this.context.playerStore.initializePlayer("Pogify Listener")
    this.setListenerListeners();
    this.setState({
      spotConnected: true,
    });
  };

  componentWillUnmount() {
    if (this.eventListener) {
      this.eventListener.close();
    }
    if (this.context.playerStore.player) {
      this.context.playerStore.player.disconnect();
    }
    this.forceUpdateAutorunDisposer()
  }

  initializePlayer = () => {
    window.spotifyReady = true;
    this.context.playerStore.player = this.context.playerStore.initializePlayer("Pogify Listener");
    this.setState({ loading: false });
  };

  componentDidMount() {
    if (window.spotifyReady) {
      this.initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = this.initializePlayer;
    }
    autorun((reaction)=>{
      if (this.context.playerStore.playing) {
        this.setState({
          playImmediate: true
        })
        reaction.dispose()

      }
    })

    this.forceUpdateAutorunDisposer = autorun(()=>{
      if (this.context.playerStore.playing) {}
      this.forceUpdate()
    })
  }

  changeVolume = (e) => {
    this.context.playerStore.player.setVolume(e.target.value);
    this.setState({
      volume: e.target.value,
    });
  };

  render() {
    if (this.state.loading) {
      return (
        <Layout>
          <div>Loading...</div>
        </Layout>
      );
    }
    if (!window.localStorage.getItem("spotify:refresh_token")) {
      return (
        <Layout>
          <button onClick={this.connect}>Login with Spotify</button>
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

    if (!this.state.hostConnected  || !this.state.firstPlay) {
      return (
        <Layout>
          <h2 style={{marginTop: 0}}>Waiting for Host...</h2>{" "}
          <p>Session Code: {this.props.sessionId}</p>
          <input type="checkbox" name="playImmediate" id="playImmediate" value={this.state.playImmediate} onChange={()=>{this.setState({playImmediate: !this.state.playImmediate})}} />
          <label htmlFor="playImmediate">Start Playing Music Once Connected to Host?</label>
        </Layout>
      );
    }

    return (
      <Layout>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Player
          >
            <div>
              {!this.state.hostPlaying && "Paused by host"}
              {this.state.hostPlaying && this.state.playImmediate&& <div style={{height:"1.3rem"}}/>}
              {!this.state.playImmediate && "Press Play to Synchronize With Host"}
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
              the host. Controlling Spotify will not work as long as you are
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
