import React from "react";
import { storesContext } from "../contexts";

/**
 * Component handles redirect after authentication from spotify.
 * Shows Empty div.
 */
export class AuthRedirect extends React.Component {
  static contextType = storesContext
  componentDidMount() {
    // Parse url params
    const urlParams = new URLSearchParams(window.location.search);

    // Check that url has param "code"
    if (urlParams.has("code")) {
      // If it has code, get it and use it to get a Spotify access token.
      this.context.playerStore.getToken(urlParams.get("code")).then(()=>{
        // Then redirect with a replace.
        // Replace replaces the latest history item so the redirect will not stay in history
        this.props.history.replace(window.sessionStorage.getItem("redirectTo"));
      })
      
    }
  }
  render() {
    // NTODO: currently an empty div but might change to a redirect notification or something
    return <div></div>;
  }
}
