import React from "react";
import HostPlayer from "./HostPlayer";
import ListenerPlayer from "./ListenerPlayer";

export class Room extends React.Component {
  state = {
    isHost: undefined,
  };

  componentDidMount() {
    if (window.localStorage.getItem("pogify:expiresAt") < Date.now()) {
      // TODO: show a expired modal.
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
      return <h2>Loading...</h2>;
    }
  }
}
