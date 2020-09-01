import React from "react";
import { playerStore } from "../stores";

/**
 * Component handles redirect after authentication from spotify.
 * Shows Empty div.
 */
export class AuthRedirect extends React.Component {
  componentDidMount() {
    // Parse url params
    const urlParams = new URLSearchParams(window.location.search);

    // Check that url has param "code"
    if (urlParams.has("code")) {
      // If it has code, get it and use it to get a Spotify access token.
      playerStore.getToken(urlParams.get("code")).then(() => {
        // Then redirect with a replace.
        // Replace replaces the latest history item so the redirect will not stay in history
        this.props.history.replace(window.sessionStorage.getItem("redirectTo"));
      });
    } else if (urlParams.has("error")) {
      if (urlParams.get("error") === "access_denied") {
        window.history.go(-2);
      }
    }
  }
  render() {
    return null;
  }
}
