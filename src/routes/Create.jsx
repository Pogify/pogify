import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "../layouts";
import { createSession } from "../utils/sessionManager";

export class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSession: "",
    };
    this.create = this.create.bind(this);
  }

  async create() {
    let res = await createSession();
    this.props.history.push("/session/" + res.session);
  }

  componentDidMount() {
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
          <div style={{ textAlign: "center", margin: 5 }}>
            Your Active Session:
            <div>
              <Link
                to={`/session/${this.state.activeSession}`}
                style={{ color: "unset" }}
              >
                {this.state.activeSession}
              </Link>
            </div>
          </div>
        )}
        <button onClick={this.create}>Create New Listening Session</button>
      </Layout>
    );
  }
}
