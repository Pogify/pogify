import promiseRetry from "promise-retry";
import axios from "axios";
import { observable } from "mobx";

var twitchToken = observable({
  access_token: "",
  refresh_token: window.localStorage.getItem("twitch:refresh_token") ?? "",
  expires_in: 0,
  expires_at: 0,
  scope: [],
  id_token: "",
  token_type: "",
});

export function authTwitch(redirectTo) {
  window.sessionStorage.setItem(
    "redirect",
    redirectTo ?? window.location.pathname
  );

  window.location.href = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${
    process.env.REACT_APP_TWITCH_CLIENT_ID
  }&redirect_uri=${encodeURI(
    window.location.origin + "/auth/twitch"
  )}&scope=openid`;
}
window.authTwitch = authTwitch;

export function fetchToken(code) {
  return promiseRetry(async () => {
    let res = await axios.get("http://localhost:8081/v1/auth/twitch", {
      params: {
        code,
      },
    });

    for (const [key, value] of Object.entries(res.data)) {
      twitchToken[key] = value;
    }
    twitchToken.expires_at = Date.now() + res.data.expires_in * 1000;
  });
}
