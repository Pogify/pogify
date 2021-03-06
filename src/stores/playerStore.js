import React from "react";
import { extendObservable, action, runInAction, autorun, computed } from "mobx";
import promiseRetry from "promise-retry";
import debounce from "lodash/debounce";
import difference from "lodash/difference";
import Axios from "axios";
import crypto from "crypto";
import * as Sentry from "@sentry/react";

import { modalStore } from ".";
import WarningModal from "../modals/WarningModal";
import ErrorModal from "../modals/ErrorModal";
import { fromPromise } from "mobx-utils";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = window.location.origin + "/auth";

/**
 * PlayerStore manages state and logic for spotify playback sdk.
 */
export class PlayerStore {
  constructor(messenger) {
    this.newTrackRetry = 0;
    this.messenger = messenger;
    this.disposeTimeAutorun = undefined;
    this.disposeVolumeAutorun = undefined;
    extendObservable(this, {
      // Spotify playback sdk object
      player: undefined,
      // Device id of Spotify playback sdk
      device_id: "",
      // Access token to spotify
      access_token: "",
      // when access_token expires
      expires_at: 0,
      // if user's connected device is the player generated by Pogify
      // *isn't* whether or not player is initialized
      device_connected: false,

      // error stuff
      error_type: "",
      error_message: "",
      // position
      position: -1000,
      // Whether player is playing
      playing: false,
      // volume
      volume: window.localStorage.getItem("pogify:volume") || 0.2,
      muted: false,
      // uri for current track
      uri: "",
      // track window
      track_window: [],
      // WebPlaybackState Object
      data: {},
      // Flag to display the "Login to Spotify" if needed
      needsRefreshToken: false,
      // When pausing or playing, don't spam the API
      tryingToChangeState: false,
      diff: 0,
    });

    // set initial stamps
    // used for computation don't need to track
    this.last = Date.now();
    this.lastPos = 0;

    // continuously poll for player state.
    // and only update necessary properties.
    this.poll = setInterval(this.updateState, 200);
  }

  updateState = action(async () => {
    if (this.defer) return;
    // only update if player exists
    if (this.player) {
      // get the latest data
      let data = await this.player.getCurrentState();
      // set the latest volume
      this.volume = (await this.player.getVolume()) || 0;
      runInAction(() => {
        // if the data is null, then set empty object
        this.data = data ?? {};
        if (data && data.position) {
          runInAction(() => {
            // only update position if it changed
            if (this.position !== data.position) {
              this.position = data.position;
            }
            // only update uri if it changed
            let uri = data.track_window.current_track.uri;
            if (this.uri !== uri) {
              this.uri = data.track_window.current_track.uri;
            }

            let track_window = [
              ...data.track_window.previous_tracks.map((e) => e.uri),
              uri,
              ...data.track_window.next_tracks.map((e) => e.uri),
            ];

            // only update track window if it changed
            if (difference(track_window, this.track_window).length) {
              this.track_window.replace(track_window);
            }

            // only update playing if changed
            if (this.playing === data.paused) {
              this.playing = !data.paused;
            }

            // the difference between the last position interval and time elapsed
            let diff = Math.abs(
              Date.now() - this.last - (data.position - this.lastPos)
            );
            // only update it if it changed
            if (this.diff !== diff) {
              this.diff = diff;
            }
            // set device connected
            this.device_connected = true;
          });
          // set new stamps
          this.lastPos = data.position;
          this.last = Date.now();
        } else {
          // set device not connected
          this.device_connected = false;
        }
      });
    }
  });

  trackOffset = computed(() => {
    return this.track_window.indexOf(this.uri);
  });

  /**
   * Resume player.
   * Should be called here instead of calling directly to spotify player object
   * @param {boolean} parked whether the player stopped from ending a song
   */
  resume = (parked) => {
    // if already trying to play then just return the currently pending promise
    if (
      this.resumeAttemptPromise &&
      this.resumeAttemptPromise.state === "pending"
    )
      return this.resumeAttemptPromise;

    // TODO: make it a single action
    // playing promise
    this.resumeAttemptPromise = fromPromise(
      promiseRetry(
        async (retry, n) => {
          console.log("resume attempt number", n);
          this.attemptingResume = true;
          // resume player
          await this.player.resume();
          // update state
          await this.updateState();
          // check state
          if (this.playing) {
            // return async
            return;
          } else {
            // if not playing then try again
            retry();
          }
        },
        {
          minTimeout: 100,
          factor: 1.5,
        }
      )
    );
    return this.resumeAttemptPromise;
  };
  /**
   * Pause player.
   * Should be called here instead of calling directly to spotify player object
   * @param {boolean} parked whether the player stopped from ending a song
   */
  pause = (parked) => {
    // if already trying to pause then return pending promise
    if (
      this.pauseAttemptPromise &&
      this.pauseAttemptPromise.state === "pending"
    )
      return this.pauseAttemptPromise;

    // TODO: make it a single action
    // pausing promise
    this.pauseAttemptPromise = fromPromise(
      promiseRetry(
        async (retry, n) => {
          console.log("pause attempt number", n);
          // pause player
          await this.player.pause();
          // force update state
          await this.updateState();
          // check paused
          if (!this.playing) {
            // if paused then resolve promise
            return;
          } else {
            // if not paused then retry
            retry();
          }
        },
        {
          minTimeout: 100,
          factor: 1.5,
        }
      )
    );
    return this.pauseAttemptPromise;
  };

  /**
   * Toggle playback.
   * Should call here instead of calling directly to spotify player object.
   */
  togglePlay = () => {
    if (this.playing) {
      return this.pause();
    } else {
      return this.resume();
    }
  };

  setMute = action(() => {
    if (this.muted === false) {
      this.muted = this.volume;
      this.setVolume(0, true);
    } else {
      this.setVolume(this.muted);
    }
  });

  debouncedVolumeChange = debounce((volume) => {
    window.localStorage.setItem("pogify:volume", volume);
  }, 100);

  /**
   * Sets volume
   */
  setVolume = action((volume, muting = false) => {
    this.volume = volume;
    this.player.setVolume(volume);
    this.debouncedVolumeChange(volume);
    if (muting === false) this.muted = false;
  });

  /**
   * Sets new track.
   *
   * @param {string} uri track uri
   * @param {number} pos_ms millisecond position
   */
  newTrack = async (uri, pos_ms, playing, track_window) => {
    let t0 = Date.now();
    return promiseRetry(
      async (retry) => {
        try {
          await Axios.put(
            `https://api.spotify.com/v1/me/player/play?device_id=${this.device_id}`,
            {
              // [uri] for backwards compatibility
              uris: track_window || [uri],
              offset: {
                uri: uri,
              },
              position_ms: playing ? pos_ms + Date.now() - t0 : pos_ms,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`,
              },
            }
          );
          await this.updateState();
          return new Promise((resolve, reject) => {
            autorun(async (r) => {
              // check that player uri equal to the requested uri
              if (this.uri === uri) {
                // dispose autorun when is the same
                r.dispose();
                if (playing) {
                  // if the track should be playing then resume
                  await this.resume();
                } else {
                  // if the track should be paused then pause after new track
                  await this.pause();
                }
                // once play/pause resolves resolve newTrack
                resolve();
              }
            });
          });
        } catch (e) {
          // TODO: More Robust Error Handling
          // BODY Spotify throws more errors than whats handled here.
          if (e.response) {
            switch (e.response.status) {
              case 429:
                let retryAfter =
                  (e.response.headers["retry-after"] || 1) * 1000;

                setInterval(() => {
                  retry();
                }, retryAfter);
                return;
              case 403:
                let reason = e.response.data.reason;

                switch (reason) {
                  case "RATE_LIMITED":
                    modalStore.queue(
                      <WarningModal title="Spotify API has rate limited Pogify. Performance may be effected." />,
                      2000
                    );
                    return;
                  case "NO_SPECIFIC_TRACK":
                    modalStore.queue(
                      <WarningModal
                        title="Pogify was not able to play this track"
                        content={`Host started a track: ${uri}, but Pogify was not able to play it on your account, probably due to your country's licencing limitations.`}
                      />
                    );
                    return;
                  default:
                }
                break;
              default:
                modalStore.queue(
                  <WarningModal title="An unknown error occured on Spotify's end." />,
                  2000
                );
            }
            return retry();
          }
          throw e;
        }
      },
      {
        retries: 5,
      }
    );
  };

  skipTrack = async (num = 1) => {
    if (num > 0) {
      for (let i = 0; i < num; i++) {
        await this.player.nextTrack();
      }
    } else if (num === 0) {
      return;
    } else if (num < 0) {
      for (let i = 0; i > num; i--) {
        await this.player.previousTrack();
      }
    }
  };

  /**
   * Seeks to a location.
   * Call this instead of using seek on spotify playback object
   *
   * @param {number} pos_ms millisecond position
   */

  debouncedSeek = debounce((pos_ms) => {
    // seek spotify playback sdk
    this.player.seek(pos_ms);
    // once seek runs stop deferring updates
    this.defer = false;
  }, 50);

  seek = action((pos_ms) => {
    // when seeking defer update
    this.defer = true;
    // hot update position
    this.position = pos_ms;

    // send seek to debounced seek
    return this.debouncedSeek(pos_ms);
  });

  /**
   * Initialize spotify playback object
   *
   * @param {string} title
   * @param {boolean} connect optional. Whether or not to connect spotify to pogify device
   */
  initializePlayer = action((title, connect = true) => {
    if (this.initializeWaiting) clearTimeout(this.initializeWaiting);
    this.initializeWaiting = setTimeout(() => {
      Sentry.captureMessage("Spotify Initialize timeout");
      modalStore.queue(
        <WarningModal
          key="LongSpotifyWait"
          title="It seems like its taking a while to connect to Spotify."
          content="You can keep waiting or refresh and try again"
        />
      );
    }, 15000);
    return new Promise(async (resolve, reject) => {
      // if player is already connected update name and whether its host, then return
      if (this.player && this.player.setName) {
        await this.player.setName(title);
        return resolve();
      }
      // if spotify is not ready then wait till ready then call this function
      if (!window.spotifyReady) {
        window.onSpotifyWebPlaybackSDKReady = () => {
          // set global tracker to true
          window.spotifyReady = true;

          // now call this function
          this.initializePlayer(title)
            .then((device_id) => {
              resolve(device_id);
            })
            .catch((e) => {
              reject(e);
            });
        };
        return;
      }

      // make spotify playback sdk object
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
        modalStore.queue(
          <ErrorModal
            errorCode="Spotify Authentication Error"
            errorMessage={`${message}. Refresh and try again.`}
          />
        );
        this.error_type = "authentication_error";
        this.error_message = message;
      });

      // TODO: proper error handling
      player.on("account_error", ({ message }) => {
        modalStore.queue(
          <ErrorModal
            errorCode="Spotify Account Error"
            errorMessage={`${message} Refresh and try again.`}
          />
        );
        this.error_type = "account_error";
        this.error_message = message;
      });
      player.on("playback_error", ({ message }) => {
        modalStore.queue(
          <ErrorModal
            errorCode="Spotify Playback Error"
            errorMessage={`${message} Refresh and try again.`}
          />
        );
        this.error_type = "authentication_error";
        this.error_message = message;
      });
      player.on("not_ready", () => {
        modalStore.queue(
          <ErrorModal
            errorCode="Spotify Not Ready Error"
            errorMessage="Spotify is not ready. Refresh and try again."
          />
        );
        this.error_type = "not_ready";
        this.error_message = "Player not Ready";
      });

      // ready callback
      player.on("ready", ({ device_id }) => {
        // set device id
        this.device_id = device_id;
        // clear player object if it already exists
        this.player = player;
        // if there is a long wait modal then close it
        if (
          modalStore.current &&
          modalStore.current.key === "LongSpotifyWait"
        ) {
          modalStore.closeModal();
        }

        // clear the long wait timeout
        clearTimeout(this.initializeWaiting);
        // if connect is true call connect to player
        if (connect) {
          resolve(device_id);
          // this.connectToPlayer(device_id).then(() => {
          //   resolve();
          // });
          // TODO: error handling
        } else {
          resolve();
        }
      });

      // start connecting player
      player.connect();
    });
  });

  connectToPlayer = async (device_id, play = false) => {
    // get current access token
    // TODO: error handling
    let access_token;
    try {
      access_token = await this.getOAuthToken();
    } catch (e) {
      return e;
    }
    // call connect to device endpoint
    try {
      return await Axios.put(
        `https://api.spotify.com/v1/me/player`,
        {
          device_ids: [device_id],
          play: play,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
    } catch (e) {
      console.log(e.response);
      if (
        e.response &&
        e.response.status === 403 &&
        e.response.data.error.reason === "PREMIUM_REQUIRED"
      ) {
        modalStore.queue(
          <WarningModal
            title="Premium required to use Pogify"
            content="It seems that you don't have Spotify Premium. You need premium to use Pogify. This is a limitation of Spotify."
          />
        );
      }
    }
  };

  /**
   * Disconnect player
   */
  disconnectPlayer = action(() => {
    this.player.disconnect();
    this.player = undefined;
  });

  /**
   * Get spotify OAuth token
   */
  getOAuthToken = action(async () => {
    // if there is an access token already and it hasn't expired then return that
    if (this.access_token && Date.now() < this.expires_at) {
      return this.access_token;
    }

    // if localStorage doesn't have an access token then go get it
    if (!window.localStorage.getItem("spotify:refresh_token")) {
      this.goAuth(window.location.pathname);
      return;
    }

    // if there is a refresh token and access token expired then get a new token
    //  TODO: error handling
    try {
      await this.refreshAccessToken();
    } catch (e) {
      return e;
    }
    // return access token
    return this.access_token;
  });

  /**
   * Gets access token based on authorization code in spotify auth callback.
   * Used by AuthRedirect component.
   *
   * @param {string} code authorization code
   */
  getToken = action(async (code) => {
    // url params
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

    // go get token
    // TODO: error handling
    const res = await Axios.post(
      "https://accounts.spotify.com/api/token",
      form
    );
    window.localStorage.setItem(
      "spotify:refresh_token",
      res.data.refresh_token
    );

    // set expire_at
    this.expires_at = Date.now() + res.data.expires_in * 1000;
  });

  /**
   * Refreshes access token in state using refresh token in localStorage
   */
  refreshAccessToken = action(async () => {
    // url params
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
      // send request
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
      console.log(e.response.data);
      if (e.response.data.error_description === "Refresh token revoked") {
        window.localStorage.removeItem("spotify:refresh_token");
        runInAction(() => (this.needsRefreshToken = true));
        throw new Error("Bad refresh token");
      }
    }
  });

  /**
   * redirects to spotify auth endpoint
   *
   * @param {string} redirectTo where to return to after auth
   */
  goAuth = async (redirectTo) => {
    // save redirect path in sessionStorage
    window.sessionStorage.setItem("redirectTo", redirectTo);
    // create hash key and hash for PKCE
    let hash = await getVerifierAndChallenge(128);

    // set hashkey in sessionStorage
    window.sessionStorage.setItem("hashKey", hash[0]);
    // redirect to spotify
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
  const randomState = String.fromCharCode(...array);
  const hashedState = await pkce_challenge_from_verifier(randomState);

  return [randomState, hashedState];
}

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

// Text-encoder polyfill

if (typeof window.TextEncoder === "undefined") {
  window.TextEncoder = function TextEncoder() {};
  window.TextEncoder.prototype.encode = function encode(str) {
    var Len = str.length,
      resPos = -1;
    // The Uint8Array's length must be at least 3x the length of the string because an invalid UTF-16
    //  takes up the equivelent space of 3 UTF-8 characters to encode it properly. However, Array's
    //  have an auto expanding length and 1.5x should be just the right balance for most uses.
    var resArr =
      typeof Uint8Array === "undefined"
        ? new Array(Len * 1.5)
        : new Uint8Array(Len * 3);
    for (var point = 0, nextcode = 0, i = 0; i !== Len; ) {
      point = str.charCodeAt(i);
      i += 1;
      if (point >= 0xd800 && point <= 0xdbff) {
        if (i === Len) {
          resArr[(resPos += 1)] = 0xef /*0b11101111*/;
          resArr[(resPos += 1)] = 0xbf /*0b10111111*/;
          resArr[(resPos += 1)] = 0xbd /*0b10111101*/;
          break;
        }
        // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        nextcode = str.charCodeAt(i);
        if (nextcode >= 0xdc00 && nextcode <= 0xdfff) {
          point = (point - 0xd800) * 0x400 + nextcode - 0xdc00 + 0x10000;
          i += 1;
          if (point > 0xffff) {
            resArr[(resPos += 1)] = (0x1e /*0b11110*/ << 3) | (point >>> 18);
            resArr[(resPos += 1)] =
              (0x2 /*0b10*/ << 6) | ((point >>> 12) & 0x3f) /*0b00111111*/;
            resArr[(resPos += 1)] =
              (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/;
            resArr[(resPos += 1)] =
              (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
            continue;
          }
        } else {
          resArr[(resPos += 1)] = 0xef /*0b11101111*/;
          resArr[(resPos += 1)] = 0xbf /*0b10111111*/;
          resArr[(resPos += 1)] = 0xbd /*0b10111101*/;
          continue;
        }
      }
      if (point <= 0x007f) {
        resArr[(resPos += 1)] = (0x0 /*0b0*/ << 7) | point;
      } else if (point <= 0x07ff) {
        resArr[(resPos += 1)] = (0x6 /*0b110*/ << 5) | (point >>> 6);
        resArr[(resPos += 1)] =
          (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
      } else {
        resArr[(resPos += 1)] = (0xe /*0b1110*/ << 4) | (point >>> 12);
        resArr[(resPos += 1)] =
          (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/;
        resArr[(resPos += 1)] =
          (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
      }
    }
    if (typeof Uint8Array !== "undefined")
      return resArr.subarray(0, resPos + 1);
    // else // IE 6-9
    resArr.length = resPos + 1; // trim off extra weight
    return resArr;
  };
  window.TextEncoder.prototype.toString = function () {
    return "[object TextEncoder]";
  };
  try {
    // Object.defineProperty only works on DOM prototypes in IE8
    Object.defineProperty(window.TextEncoder.prototype, "encoding", {
      get: function () {
        if (window.TextEncoder.prototype.isPrototypeOf(this)) return "utf-8";
        else throw TypeError("Illegal invocation");
      },
    });
  } catch (e) {
    /*IE6-8 fallback*/ window.TextEncoder.prototype.encoding = "utf-8";
  }
  if (typeof Symbol !== "undefined")
    window.TextEncoder.prototype[Symbol.toStringTag] = "TextEncoder";
}
