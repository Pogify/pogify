import React from "react";
import * as twitchAuth from "../utils/twitchAuth";

/**
 * Component handles redirect after authentication from spotify.
 * Shows Empty div.
 */
export class TwitchAuthRedirect extends React.Component {
  async componentDidMount() {
    // Parse url params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("code")) {
      await twitchAuth.fetchToken(urlParams.get("code"));
      this.props.history.replace(window.sessionStorage.getItem("redirect"));
    }
  }
  render() {
    return null;
  }
}
