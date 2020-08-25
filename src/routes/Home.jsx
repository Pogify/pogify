import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "../layouts";
import { Donations } from "../components";

export class Home extends React.Component {
  render() {
    return (
      <Layout>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "4.5rem"}}>
          <img alt="Pogify Logo" src="/logo192.png" style={{height: "100%", marginRight: "20px"}}></img>
          <h1 style={{textAlign: "center", fontSize: "3.5rem", fontWeight: "normal"}}>POGIFY</h1>
        </div>
        <p style={{textAlign: "center", fontSize: "1rem", margin: "2rem 0"}}>Listen to music with your live audience without getting DMCA-striked!</p>
        <div style={{display: "flex", justifyContent: "space-around", width: "100%"}}>
        <Link to="/session">
            <button>
              Join a Session
            </button>
          </Link>
          <Link to="/create">
            <button>
              Start a session
            </button>
          </Link>
        </div>
        {/*<div style={{padding: "10px", backgroundColor: "#FFE8B3", display: "flex", borderRadius: 10, alignItems: "center"}}>
          <p>Do you like what we're doing? Help us out with a donation to keep our dev servers running! Even just one dollar will help.</p>
          <Donations />
    </div>*/}
        
      </Layout>
    );
  }
}
