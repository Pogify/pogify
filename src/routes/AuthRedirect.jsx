import React from "react";
import * as auth from "../utils/spotifyAuth";

/**
 * Component handles redirect after authentication from spotify.
 *
 */
export class AuthRedirect extends React.Component {
  componentDidMount() {
    // Parse url params
    const urlParams = new URLSearchParams(window.location.search);

    // Check that url has param "code"
    if (urlParams.has("code")) {
      // If it has code, get it and use it to get a Spotify access token.
      auth.getToken(urlParams.get("code")).then(() => {
        // Then redirect with a replace.
        // Replace replaces the latest history item so the redirect will not stay in history
        this.props.history.replace(window.sessionStorage.getItem("redirectTo"));
      });
    }
  }
  render() {
    // TODO: currently an empty div but might change to a redirect notification or something
    return <div></div>;
  }
}
