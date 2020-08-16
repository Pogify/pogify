import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Layout from "./Layout"

const Button = styled.button`
  border: 1px solid #2C3A3A;
  padding: 10px 30px;
  border-radius: 25px;
  font-size: 1.3rem;
  cursor: pointer;
  margin: 5px;
  transition: background-color 0.5s, color 0.5s;
  :hover {
    background-color: #2C3A3A;
    color: white;
  }
`;

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
            <Button>I am a viewer</Button>
          </Link>
          <Link to="/create">
            <Button style={{ marignLeft: "10px" }}>I am a streamer</Button>
          </Link>
        </div>
      </Layout>
    );
  }
}

export default Home;
