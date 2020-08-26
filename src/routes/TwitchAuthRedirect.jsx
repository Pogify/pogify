import React from "react";
import * as auth from "../utils/twitchAuth";

/**
 * Component handles redirect after authentication from Twitch.
 *
 */
export class TwitchAuthRedirect extends React.Component {
  componentDidMount() {
    if (window.location.search != "") {
      // twitch sign in didn't work
      let error = new URLSearchParams(window.location.search.substr(1));
      alert(error.get("error_description"));
    } else if (window.location.hash == "") {
      // first visit
      auth.goAuth(window.location.origin + "/twitch");
    } else {
      // successfully signed in with twitch
      let params = new URLSearchParams(window.location.hash.substr(1));
      let twitchToken = params.get("access_token");
      window.sessionStorage.twitchToken = twitchToken;
      // when making a session, send it in the payload
      // fb function can create a session with the username
      window.location.href = "/create";
    }
  }
  render() {
    // TODO: currently an empty div but might change to a redirect notification or something
    return <div></div>;
  }
}
