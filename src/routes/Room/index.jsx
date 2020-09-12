import React from "react";
import { Helmet } from "react-helmet";
import { Layout } from "../../layouts";
import { HostPlayer, ListenerPlayer } from "../../components";

import styles from "./index.module.css";

// TODO: rebuild this component. its useless in it's current state
/**
 * Room component conditionally renders host player or listener player based on whether or not there exists an active session in localStorage
 */
export class Room extends React.Component {
  state = {
    isHost: undefined,
  };

  componentDidMount() {
    if (window.localStorage.getItem("pogify:expiresAt") < Date.now()) {
      // TODO: show an expired modal.
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
        <Layout>
          <div className={styles.roomWrapper}>
            {this.state.isHost === this.props.match.params.id ? (
              <>
                <Helmet>
                  <title>
                    Hosting session {this.props.match.params.id} - Pogify
                  </title>
                </Helmet>
                <HostPlayer
                  {...this.props}
                  sessionId={this.props.match.params.id}
                />
              </>
            ) : (
              <>
                <Helmet>
                  <title>
                    Listening to session {this.props.match.params.id} - Pogify
                  </title>
                </Helmet>
                <ListenerPlayer sessionId={this.props.match.params.id} />
              </>
            )}
          </div>
        </Layout>
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
