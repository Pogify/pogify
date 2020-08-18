import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "./Layout";

export class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSession: "",
    };
    this.create = this.create.bind(this);
  }

  async create() {
    this.backoff = 1;
    try {
      let { data } = await axios.post(
        "https://us-central1-pogify-database.cloudfunctions.net/startSession"
      );

      window.localStorage.setItem("pogify:token", data.token);
      window.localStorage.setItem(
        "pogify:expiresAt",
        data.expiresIn * 1000 + Date.now()
      );
      window.localStorage.setItem("pogify:session", data.session);
      this.props.history.push("/session/" + data.session);
    } catch (e) {
      // backoff retry implementation
    }
  }

  componentDidMount() {
    if (window.localStorage.getItem("expiresAt") < Date.now()) {
      this.setState({
        activeSession: window.localStorage.getItem("session"),
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
