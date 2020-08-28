import React from "react";
import { Player } from ".";
import { Layout } from "../layouts";
import { Donations } from "./Donations";
import { storesContext } from "../contexts";
import { autorun } from "mobx"
import PoweredBySpotify from "./utils/PoweredBySpotify";

/**
 * ListenerPlayer handles logic for listeners 
 */
export default class ListenerPlayer extends React.Component {
  static contextType = storesContext
  state = {
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

  /**
   * Sets event listeners from host
   */
  setListenerListeners = () => {
    // subscribe to events on backend
    this.eventListener = new EventSource(
      process.env.REACT_APP_SUB + "/sub/" + this.props.sessionId + ".b1"
    );

    // update state on open
    this.eventListener.onopen = () => {
      this.setState({
        subConnected: true,
      });
    };

    // message Handler
    this.eventListener.onmessage = (event) => {
      console.log(event.data);
      let { timestamp, uri, position, playing } = JSON.parse(event.data);
      // if there is a hostUri before but this 
      if (this.state.hostUri && !uri) {
        // NTODO: have a separate state for disconnect
        this.setState({
          hostConnected: false,
        });
        // NTODO: replace with modal
        alert("Host disconnected. Playback Paused");
        return;
      } else if (!uri) {
        // if first event is empty then post waiting for host
        this.setState({
          hostConnected: false,
        });
        return;
      }
      // set stamp for when event received
      let t0 = performance.now()
      // set state callback for more accuate "time stamping"
      this.setState(({lastTimestamp,hostPausedWhileListenerListening,firstPlay}) => {
        // if the incoming timestamp is older than the current timestamp, it is stale. ignore it
        if (timestamp < lastTimestamp) {
          return {};
        }

        // if host is playing calculate position based on the elapsed time relative to host's timestamp.
        let calcPos = playing ? position + Date.now() - timestamp + performance.now() - t0: position;


        return {
          lastTimestamp: timestamp,
          // this value should only be set when host pauses. if playing then inherit from last state.
          hostPausedWhileListenerListening: !playing ? this.context.playerStore.playing : hostPausedWhileListenerListening,
          hostUri: uri,
          hostPosition: calcPos,
          hostPlaying: playing,
          firstPlay: playing || firstPlay,
          hostConnected: true,
        };
      });
    };

    // NTODO: error handling
    this.eventListener.onerror = console.error;
  };


  /**
   * Handles logic for when host sends update. 
   * NTODO: Probably should move this to eventListener.onmessage
   */
  async componentDidUpdate(_prevProps, prevState) {
    const { playerStore } = this.context
    // multiple calls to set state is still performant because react batches setState
    if (this.state.hostConnected) {

      console.log("stutter", ~~(this.state.hostPosition), ~~playerStore.position.value, ~~(this.state.hostPosition - playerStore.position.value), playerStore.playing)
      // // if hostPosition and listenerPosition are far apart then seek to host Position
      if (Math.abs(this.state.hostPosition - playerStore.position.value) > 200 && playerStore.playing) {
            // set new stamps
            this.h_p0 = this.state.hostPosition
            this.h_t0 = performance.now()
            // seek
            playerStore.seek(this.state.hostPosition, this.h_t0)
      }


      // if host is paused           but is player is playing then pause
      if (!this.state.hostPlaying && playerStore.playing) {
        this.context.playerStore.pause()
      }
      // if  host starts playing then set tick
      if (this.state.hostPlaying && !this.hostTick) {
        // if listener is also playing then play with host
        if (this.state.hostPausedWhileListenerListening) {
          this.context.playerStore.resume()
        }
        // set new stamps
        this.h_t0 = performance.now()
        this.h_p0 = this.state.hostPosition
        // tick to track time
        // increasing will increase latency but will decrease calls
        this.hostTick = setInterval(()=>{
          window.requestAnimationFrame((time)=>{
            this.setState({
              hostPosition: time - this.h_t0 + this.h_p0
            })
          })
        }, 100)
      } else if (!this.state.hostPlaying) {
        // if host pauses stop tick and pause listener
        clearInterval(this.hostTick)
        this.context.playerStore.pause()
        playerStore.playing = false
        this.hostTick = undefined
      }

      // if the host's uri is different from player's then then new track
      if (this.state.hostUri !== playerStore.data.track_window.current_track.uri) {
        this.context.playerStore.newTrack(this.state.hostUri, this.state.hostPosition)
      }
    }
  }

  /**
   * Initialize player as listener
   */
  connect = async () => {
    this.setState({loading: true})
    
    console.log("once");
    // NTODO: listener title based on session code?
    await this.context.playerStore.initializePlayer("Pogify Listener", false)
    // set listener event listeners
    this.setListenerListeners();

    this.setState({loading:false})
  };

  componentWillUnmount() {
    // close connection to sub server
    if (this.eventListener) {
      this.eventListener.close();
    }
    // disconnect current player
    if (this.context.playerStore.player) {
      this.context.playerStore.player.disconnect();
    }
    // dispose auto run 
    this.forceUpdateAutorunDisposer()
  }

  componentDidMount() {
    // autorun to trigger when playerstore is first playing.
    // made it like this to allow client to click play button on player 
    autorun((reaction)=>{
      if (this.context.playerStore.playing) {
        this.setState({
          playImmediate: true
        })
        reaction.dispose()
      }
    })

    // force update when playing changes
    this.forceUpdateAutorunDisposer = autorun(()=>{
      if (this.context.playerStore.playing) {}
      this.forceUpdate()
    })
  }

  render() {
    // if loading
    if (this.state.loading) {
      return (
        <Layout>
          <div>Loading...</div>
        </Layout>
      );
    }

    // if theres not a refresh token
    if (!window.localStorage.getItem("spotify:refresh_token")) {
      return (
        <Layout>
          <button onClick={this.connect}>Login with Spotify</button>
        </Layout>
      );
    }

    // if any are false show join
    if (!this.state.spotConnected || !this.state.subConnected) {
      return (
        <Layout>
          <button onClick={this.connect}>Join Session</button>
        </Layout>
      );
    }

    // waiting for host view. 
    if (!this.state.hostConnected  || !this.state.firstPlay) {
      return (
        <Layout>
          <h2 style={{ marginTop: 0 }}>Waiting for Host...</h2>{" "}
          <p>Session Code: {this.props.sessionId}</p>
          {/* button to start play immediately  */}
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
              {this.state.hostPlaying && this.state.playImmediate && <div style={{ height: "1.3rem" }} />}
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
            <PoweredBySpotify />
            <Donations />
          </div>
        </div>
      </Layout>
    );
  }
}
