import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "../layouts";
import { Donations } from "../components";

export class Home extends React.Component {
  render() {
    return (
      <Layout>
        <h1 style={{textAlign: "center", fontSize: "5rem", letterSpacing: "5px", margin: 0}}>POGIFY</h1>
        <h2 style={{textAlign: "center", marginTop: 0}}>What is Pogify?</h2>
        <p style={{textAlign: "center"}}>Pogify is a website that allows you to listen to music with<br /> your live audience without getting DMCA-striked!</p>
        <div style={{display: "flex", justifyContent: "space-evenly", marginTop: 24}}>
        <Link to="/session">
            <button style={{marginRight: 120 }}>
              Join a Session
            </button>
          </Link>
          <Link to="/create">
            <button>
              Start a session
            </button>
          </Link>
        </div>
      </Layout>
    );
  }
}
