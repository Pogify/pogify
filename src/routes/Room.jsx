import React from "react";
import { Layout } from "../layouts";
import { HostPlayer, ListenerPlayer } from "../components";

// NTODO: rebuild this component. its useless in it's current state
/**
 * Room component conditionally renders host player or listener player based on whether or not there exists an active session in localStorage
 */
export class Room extends React.Component {
  state = {
    isHost: undefined,
  };

  componentDidMount() {
    if (window.localStorage.getItem("pogify:expiresAt") < Date.now()) {
      // NTODO: show an expired modal.
      this.setState({
        isHost: null,
      });
    } else {
      this.setState({
        isHost: window.localStorage.getItem("pogify:session"),
      });
    }
  }

  componentWillUnmount() {
    // if session expired clean up.
    if (this.state.expired) {
      window.localStorage.removeItem("pogify:expiresAt");
      window.localStorage.removeItem("pogify:token");
      window.localStorage.removeItem("pogify:session");
    }
  }

  render() {
    if (this.state.isHost !== undefined) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexWrap: "wrap",
            height: "100vh",
          }}
        >
          {this.state.isHost === this.props.match.params.id ? (
            <HostPlayer
              {...this.props}
              sessionId={this.props.match.params.id}
            />
          ) : (
            <ListenerPlayer sessionId={this.props.match.params.id} />
          )}
        </div>
      );
    } else {
      return (
        <Layout>
          <h2>Loading...</h2>
        </Layout>
      );
    }
  }
}
