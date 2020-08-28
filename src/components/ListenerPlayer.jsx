import React from "react";
import { playerStore, modalStore } from "../stores";
import { autorun } from "mobx";
import { Layout } from "../layouts";

import { Player } from ".";
import WarningModal from "../modals/WarningModal";
import PoweredBySpotify from "./utils/PoweredBySpotify";
import Donations from "./utils/Donations";

/**
 * ListenerPlayer handles logic for listeners
 */
export default class ListenerPlayer extends React.Component {
  state = {
    device_id: "",
    loading: false,
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
    firstPlay: false,
    synced: true,
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
    this.eventListener.onmessage = async (event) => {
      console.log(event.data);
      let { timestamp, uri, position, playing } = JSON.parse(event.data);
      // if message timestamp is less than previously received timestamp it is stale. don't act on it
      if (this.state.lastTimestamp > timestamp) return;

      // if there is a hostUri before but this
      if (this.state.hostUri && !uri) {
        // TODO: have a separate state for disconnect
        this.setState({
          hostConnected: false,
        });
        modalStore.queue(<WarningModal title="Host disconnected." content="Playback has been paused" />)
        return;
      } else if (!uri) {
        // if first event is empty then post waiting for host
        this.setState({
          hostConnected: false,
        });
        return;
      }

      // calculate hosts current position based on hosts timestamp and time now on client
      let calcPos = playing ? position + Date.now() - timestamp : position;

      let wasPlaying = playerStore.playing;

      // if listener player is not in synced state with host then pass player updates and only update state
      if (this.state.synced) {
        await this.syncListener(uri, calcPos, playing);
      }

      this.setState({
        lastTimestamp: timestamp,
        // this value should only be set when host pauses. if playing then inherit from last state.
        hostPausedWhileListenerListening:
          wasPlaying && !playing
            ? wasPlaying
            : this.state.hostPausedWhileListenerListening,
        hostUri: uri,
        hostPosition: calcPos,
        updateTimestamp: Date.now(),
        hostPlaying: playing,
        firstPlay: playing || this.state.firstPlay,
        hostConnected: true,
      });
    };

    // synchronization checker
    playerStore.player.on("player_state_changed", (data) => {
      const {
        hostPosition,
        hostUri,
        hostPlaying,
        hostConnected,
        updateTimestamp,

        playImmediate,
      } = this.state;

      let calcPos = hostPlaying
        ? hostPosition + Date.now() - updateTimestamp
        : hostPosition;

      if (
        hostConnected &&
        playImmediate &&
        (hostUri !== data.track_window.current_track.uri ||
          hostPlaying !== !data.paused ||
          Math.abs(calcPos - data.position) > 2000)
      ) {
        this.setState({
          synced: false,
        });
      } else {
        this.setState({
          synced: true,
        });
      }
    });

    // TODO: error handling
    this.eventListener.onerror = console.error;
  };

  /**
   * Initialize player as listener
   */
  connect = async () => {
    this.setState({ loading: true });

    console.log("once");
    // TODO: listener title based on session code?
    await playerStore.initializePlayer("Pogify Listener");
    // set listener event listeners
    this.setListenerListeners();

    this.setState({ loading: false, spotConnected: true });
  };

  /**
   * Method syncs listener to provided params
   *
   * @param {string} uri spotify track uri
   * @param {number} position position in milliseconds
   * @param {boolean} playing playing state
   */
  async syncListener(uri, position, playing) {
    if (uri !== playerStore.uri) {
      await playerStore.newTrack(uri, position);
    }
    if (
      !this.state.hostPlaying &&
      playing &&
      this.state.hostPausedWhileListenerListening
    ) {
      // if host goes from pause to play and listener was listening when host paused, then resume and seek
      playerStore.resume();
      playerStore.seek(position);
    } else if (!playing) {
      // if host pauses, pause
      playerStore.pause();
    } else {
      // if host is still playing then only seek
      playerStore.seek(position);
    }
  }

  componentDidMount() {
    // autorun to trigger when playerstore is first playing.
    // made it like this to allow client to click play button on player
    autorun((reaction) => {
      if (playerStore.playing) {
        this.setState({
          playImmediate: true,
        });
        reaction.dispose();
      }
    });

    // autorun then playerStore starts playing. resync to host
    this.forceUpdateAutorunDisposer = autorun((reaction) => {
      const { hostPosition, updateTimestamp } = this.state;

      if (playerStore.playing) {
        console.log("autorun playing");
        playerStore.seek(hostPosition + Date.now() - updateTimestamp);
        reaction.dispose();
      }
    });
  }
  componentWillUnmount() {
    // close connection to sub server
    if (this.eventListener) {
      this.eventListener.close();
    }
    // disconnect current player
    if (playerStore.player) {
      playerStore.player.disconnect();
    }
    // dispose auto run
    this.forceUpdateAutorunDisposer();
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
    if (!this.state.hostConnected || !this.state.firstPlay) {
      return (
        <Layout>
          <h2 style={{ marginTop: 0 }}>Waiting for Host...</h2>{" "}
          <p>Session Code: {this.props.sessionId}</p>
          {/* TODO: button to start play immediately
              BODY have music play immediately on first connect. 
            
          */}
          <input
            type="checkbox"
            name="playImmediate"
            id="playImmediate"
            value={this.state.playImmediate}
            onChange={() => {
              this.setState({ playImmediate: !this.state.playImmediate });
            }}
          />
          <label htmlFor="playImmediate">
            Start Playing Music Once Connected to Host?
          </label>
        </Layout>
      );
    }

    return (
      <Layout>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Player isHost={false}>
            <div>
              {!this.state.hostPlaying && "Paused by host"}
              {this.state.hostPlaying && this.state.playImmediate && (
                <div style={{ height: "1.3rem" }} />
              )}
              {!this.state.playImmediate &&
                "Press Play to Synchronize With Host"}
              {/* TODO: implement a resync button that will sync listener back to host. 
                    BODY calling onmessage handler with last received update seems like the way to do it.
                */}
              {!this.state.synced && <div>Not synced with host</div>}
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
