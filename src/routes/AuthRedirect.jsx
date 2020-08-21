import React from "react";
import * as auth from "../utils/SpotifyAuth";
export class AuthRedirect extends React.Component {
  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("code")) {
      auth.getToken(urlParams.get("code")).then(() => {
        this.props.history.replace(window.sessionStorage.getItem("redirectTo"));
      });
    }
  }
  render() {
    return <div></div>;
  }
}
