import React from "react";
import HostPlayer from "./HostPlayer";
import ListenerPlayer from "./ListenerPlayer";

const io = window.io;
export class Room extends React.Component {
  state = {
    isHost: false,
  };

  componentDidMount() {
    console.log("room mount");

    this.socket = io("/" + this.props.match.params.id);
    console.log("room mount");
    this.socket.on("IS_HOST", (isHost) => {
      console.log("ishost", isHost);
      this.setState({
        isHost,
      });
    });
    this.socket.emit("IS_HOST");
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  render() {
    if (this.socket) {
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
          {this.state.isHost ? (
            <HostPlayer {...this.props} socket={this.socket} />
          ) : (
            <ListenerPlayer
              sessionId={this.props.match.params.id}
              socket={this.socket}
            />
          )}
        </div>
      );
    } else {
      return <div>loading</div>;
    }
  }
}
