import { extendObservable, action, computed } from "mobx";
import Axios from "axios";
import crypto from "crypto";
import React from "react";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = window.location.origin + "/auth";

export class PlayerStore {
  constructor(messenger) {
    this.messenger = messenger;
    this.tick = undefined;
    extendObservable(this, {
      player: undefined,
      device_id: "",
      access_token: "",
      expires_at: 0,
      error_type: "",
      error_message: "",
      p0: 0,
      t0: performance.now(),
      t1: performance.now(),
      playing: false,
      volume: 0.2,
      uri: "",
      data: {},
      test: "",
    });
  }

  position = computed(() => {
    if (this.playing) {
      return Math.floor(this.p0 + this.t1 - this.t0);
    } else {
      return Math.floor(this.p0);
    }
  });

  resume = action(() => {
    this.player.resume();
    this.playing = true;
    if (!this.tick) {
      this.tick = setInterval(() => {
        this.t1 = performance.now();
      }, 100);
    }
  });
  pause = action(() => {
    this.player.pause();
    this.playing = false;
    clearInterval(this.tick);
    this.tick = undefined;
  });

  togglePlay = action(() => {
    if (this.playing) {
      this.pause();
    } else {
      this.resume();
    }
  });
  setVolume = action((volume) => {
    this.volume = volume;
    this.player.setVolume(volume);
  });

  newTrack = async (uri, pos_ms) => {
    this.prevPlaying = this.playing;
    let res = await Axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.device_id}`,
      {
        uris: [uri],
        position_ms: pos_ms,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.access_token}`,
        },
      }
    );
    return res.data;
  };

  seek = action((pos_ms, t0) => {
    this.player.seek(pos_ms);
    // this.p0 = pos_ms;
    // this.t0 = t0 || performance.now();
  });

  initializePlayer = action((title, connect = true) => {
    return new Promise(async (resolve, reject) => {
      // if player is already connected set name then return
      if (this.player && this.player.setName) {
        await this.player.setName(title);
        resolve();
      }

      // if spotify is not ready then wait till ready then call this function
      if (!window.spotifyReady) {
        window.onSpotifyWebPlaybackSDKReady = () => {
          // set global tracker to true
          window.spotifyReady = true;

          // now call this function
          this.initializePlayer(title)
            .then(() => {
              resolve();
            })
            .catch((e) => {
              reject(e);
            });
        };
      }

      let player = new window.Spotify.Player({
        volume: this.volume,
        name: title,
        getOAuthToken: async (callback) => {
          let token = await this.getOAuthToken();
          callback(token);
        },
      });
      // authentication_error handler
      player.on("initialization_error", reject);
      player.on("authentication_error", ({ message }) => {
        this.error_type = "authentication_error";
        this.error_message = message;
      });
      player.on("account_error", ({ message }) => {
        this.error_type = "account_error";
        this.error_message = message;
      });
      player.on("playback_error", ({ message }) => {
        this.error_type = "authentication_error";
        this.error_message = message;
      });
      player.on("not_ready", () => {
        this.error_type = "not_ready";
        this.error_message = "Player not Ready";
      });

      player.on("player_state_changed", (data) => {
        if (!data) {
          this.data = {};
          return;
        }
        console.log(data);
        this.p0 = data.position;
        this.t0 = performance.now();
        this.uri = data.track_window.current_track.uri;
        if (this.playing !== !data.paused) {
          if (this.playing) {
            this.player.resume();
          } else {
            this.player.pause();
          }
        }

        this.data = data;
      });

      player.on("ready", ({ device_id }) => {
        this.device_id = device_id;
        this.player = undefined;
        this.player = player;
        window.player = this.player;
        if (connect) {
          this.connectToPlayer(device_id).then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });

      player.connect();
    });
  });

  connectToPlayer = async (device_id) => {
    let access_token = await this.getOAuthToken();
    return Axios.put(
      `https://api.spotify.com/v1/me/player`,
      {
        device_ids: [device_id],
        play: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  };

  disconnectPlayer = action(() => {
    this.player.disconnect();
    this.player = undefined;
  });

  getOAuthToken = action(async () => {
    if (this.access_token && Date.now() < this.expires_at) {
      return this.access_token;
    }

    if (!window.localStorage.getItem("spotify:refresh_token")) {
      this.goAuth(window.location.pathname);
      return;
    }

    try {
      // throw new Error("abc");
      await this.refreshAccessToken();
      return this.access_token;
    } catch (e) {
      console.log(e);
      console.log(e.response.data.error_description);
      switch (e.response.data.error_description) {
        case "Refresh Token Revoked":
          break;
        default:
          throw e;
      }
    }
  });

  getToken = action(async (code) => {
    const postData = {
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: window.sessionStorage.getItem("hashKey"),
    };
    const form = new URLSearchParams();
    for (let key in postData) {
      form.append(key, postData[key]);
    }

    const res = await Axios.post(
      "https://accounts.spotify.com/api/token",
      form
    );
    window.localStorage.setItem(
      "spotify:refresh_token",
      res.data.refresh_token
    );
    this.expires_at = Date.now() + res.data.expires_in * 1000;
  });

  refreshAccessToken = action(async () => {
    let postData = {
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: window.localStorage.getItem("spotify:refresh_token"),
    };
    let form = new URLSearchParams();
    for (let key in postData) {
      form.append(key, postData[key]);
    }
    try {
      let res = await Axios.post(
        "https://accounts.spotify.com/api/token",
        form
      );
      window.localStorage.setItem(
        "spotify:refresh_token",
        res.data.refresh_token
      );
      this.access_token = res.data.access_token;
      this.expires_at = Date.now() + res.data.expires_in * 1000;
    } catch (e) {
      // TODO: error handling
      console.log(e);
      if (e.status.match(/5\d\d/)) {
        const ErrorDiv = () => {
          return <div>Soptify Error {e.status}</div>;
        };
      }
    }
  });

  goAuth = async (redirectTo) => {
    window.sessionStorage.setItem("redirectTo", redirectTo);
    let hash = await getVerifierAndChallenge(128);

    window.sessionStorage.setItem("hashKey", hash[0]);
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=streaming%20user-read-email%20user-read-private%20user-modify-playback-state&code_challenge_method=S256&code_challenge=${
      hash[1]
    }`;
  };
}

export async function getVerifierAndChallenge(len) {
  const validChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let array = new Uint8Array(len);
  window.crypto.getRandomValues(array);
  array = array.map((x) => validChars.charCodeAt(x % validChars.length));
  const randomState = String.fromCharCode.apply(null, array);
  const hashedState = await pkce_challenge_from_verifier(randomState);

  return [randomState, hashedState];
}

window.crypto2 = crypto;
function sha256(plain) {
  // returns promise ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.createHash("sha256").update(data).digest();
}

function base64urlencode(a) {
  // Convert the ArrayBuffer to string using Uint8 array.
  // btoa takes chars from 0-255 and base64 encodes.
  // Then convert the base64 encoded to base64url encoded.
  // (replace + with -, replace / with _, trim trailing =)
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function pkce_challenge_from_verifier(v) {
  let hashed = await sha256(v);
  let base64encoded = base64urlencode(hashed);
  return base64encoded;
}
