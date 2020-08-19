import React from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";

class Home extends React.Component {
  render() {
    return (
      <Layout>
        <h1
          style={{
            textAlign: "center",
            fontSize: "5em",
            letterSpacing: "7px",
            margin: 0,
            fontWeight: "bold",
          }}
        >
          POGIFY
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            marginTop: 12,
          }}
        >
          <Link to="/session">
            <button>
              <u>Join</u> a Session
            </button>
          </Link>
          <Link to="/create">
            <button style={{ marginLeft: 10 }}>
              <u>Start</u> a session
            </button>
          </Link>
        </div>
      </Layout>
    );
  }
}

export default Home;
