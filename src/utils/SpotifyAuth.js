import axios from "axios";
import crypto from "crypto";
export const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;

let redirectURL = window.location.origin + "/auth";
export async function getToken(code) {
  let postData = {
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectURL,
    code_verifier: window.sessionStorage.getItem("hashKey"),
  };
  let form = new URLSearchParams();
  for (let key in postData) {
    form.append(key, postData[key]);
  }

  let res = await axios.post("https://accounts.spotify.com/api/token", form);
  // set items in sessionStorage
  window.sessionStorage.setItem("refresh_token", res.data.refresh_token);
  window.sessionStorage.setItem(
    "expires_at",
    Date.now() + res.data.expires_in * 1000
  );
  window.sessionStorage.setItem("access_token", res.data.access_token);

  // remove the code used to get access token
  window.sessionStorage.removeItem("code");

  return res.data;
}

export async function refreshToken(token) {
  let postData = {
    client_id: CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: token,
  };
  let form = new URLSearchParams();
  for (let key in postData) {
    form.append(key, postData[key]);
  }

  let res = await axios.post("https://accounts.spotify.com/api/token", form);
  window.sessionStorage.setItem("refresh_token", res.data.refresh_token);
  window.sessionStorage.setItem(
    "expires_at",
    Date.now() + res.data.expires_in * 1000
  );
  window.sessionStorage.setItem("access_token", res.data.access_token);
  return res.data;
}

export async function goAuth(redirectTo) {
  window.sessionStorage.setItem("redirectTo", redirectTo);
  let hash = await getVerifierAndChallenge(128);

  window.sessionStorage.setItem("hashKey", hash[0]);
  window.sessionStorage.setItem("hashResult", hash[1]);

  window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectURL
  )}&scope=streaming%20user-read-email%20user-read-private%20user-modify-playback-state&code_challenge_method=S256&code_challenge=${
    hash[1]
  }`;
}

export function getPlayer(title) {
  let player = new window.Spotify.Player({
    volume: 0.2,
    name: title,
    // TODO: refactor so its cleaner
    getOAuthToken: (callback) => {
      let token = window.sessionStorage.getItem("access_token");
      let rToken = window.sessionStorage.getItem("refresh_token");
      let expire = window.sessionStorage.getItem("expires_at");
      if (Date.now() > expire && rToken) {
        return refreshToken(rToken)
          .then((data) => {
            // set new tokens
            window.sessionStorage.setItem("access_token", data.access_token);
            window.sessionStorage.setItem(
              "expires_at",
              Date.now() + data.expires_in * 1000
            );
            window.sessionStorage.setItem("refresh_token", data.refresh_token);

            callback(data.access_token);
          })
          .catch((e) => {
            if ((e.error_description = "Refresh Token Revoked")) {
              window.sessionStorage.removeItem("refresh_token");
              window.sessionStorage.removeItem("access_token");
              goAuth(window.location.pathname);
            }
          });
      }

      if (token) {
        return callback(token);
      }
      let code = window.sessionStorage.getItem("code");
      if (code) {
        getToken(code).then((data) => {
          console.log(data);
          this.setState({
            loggedIn: true,
          });
          callback(data.access_token);
        });
      } else {
        goAuth(window.location.pathname);
      }
    },
  });
  player.on("player_state_changed", console.log);
  player.on("initialization_error", ({ message }) => {
    console.error("Failed to initialize", message);
  });
  player.on("authentication_error", ({ message }) => {
    console.error("Failed to authenticate", message);
  });
  player.on("account_error", ({ message }) => {
    console.error("Failed to validate Spotify account", message);
  });
  player.on("playback_error", ({ message }) => {
    console.error("Failed to perform playback", message);
  });
  return player;
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
