import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../layouts";
import { createSession } from "../../utils/sessionManager";
import { ErrorModal } from "../../modals";
import styles from "./index.module.css";
import { modalStore } from "../../stores";

/**
 * Create session component.
 * One button to create.
 * Shows any active session in localStorage
 */
export class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSession: "",
    };
    this.create = this.create.bind(this);
  }

  // waits to create session
  async create() {
    try {
      let res = await createSession();
      // redirect on successful session creation
      this.props.history.push("/session/" + res.session);
    } catch (e) {
      modalStore.queue(
        <ErrorModal
          errorCode="Failed to create Session"
          errorMessage="There was some problem and we were unable to create a session. You can close this modal and try again."
        >
          <div>{e.name}</div>
          <div>{e.message}</div>
          <div>{e.stack}</div>
        </ErrorModal>
      );
    }
  }

  componentDidMount() {
    // if active session show it
    if (window.localStorage.getItem("pogify:expiresAt") > Date.now()) {
      this.setState({
        activeSession: window.localStorage.getItem("pogify:session"),
      });
    }
  }

  render() {
    return (
      <Layout>
        <div className={styles.buttonStack}>
          {Boolean(this.state.activeSession) && (
            <>
              <Link
                className={styles.fullWidth}
                to={`/session/${this.state.activeSession}`}
              >
                <button className={`textAlignCenter ${styles.fullWidth}`}>
                  Continue Active Session:
                  <div>
                    <u>
                      <b>{this.state.activeSession}</b>
                    </u>
                  </div>
                </button>
              </Link>
              <div>
                <h3>or</h3>
              </div>
            </>
          )}
          <button onClick={this.create}>Create New Listening Session</button>
        </div>
      </Layout>
    );
  }
}
