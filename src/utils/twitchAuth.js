import promiseRetry from "promise-retry";
import axios from "axios";

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
    // res.data;
  });
}
