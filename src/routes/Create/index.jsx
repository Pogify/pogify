import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../layouts";
import { createSession } from "../../utils/sessionManager";

import styles from "./index.module.css";

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
    // TODO: handle errors
    let res = await createSession();
    // redirect on successful session creation
    this.props.history.push("/session/" + res.session);
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
        {Boolean(this.state.activeSession) && (
          <div className={`textAlignCenter ${styles.previousSessions}`}>
            Your Active Session:
            <div>
              <Link
                to={`/session/${this.state.activeSession}`}
              // TODO: better link styling, more button-like?
              >
                Resume {this.state.activeSession}
              </Link>
            </div>
          </div>
        )}
        <button onClick={this.create}>Create New Listening Session</button>
      </Layout>
    );
  }
}
