import React from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout"

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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link to="/session">
            <button>I am a viewer</button>
          </Link>
          <Link style={{ marignLeft: "10px" }} to="/create">
            <button style={{ marginLeft: 10}}>I am a streamer</button>
          </Link>
        </div>
      </Layout>
    );
  }
}

export default Home;
