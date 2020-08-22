import React from "react";
import { Link } from "react-router-dom";
import "../styles/Layout.css";
export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      darkMode: 'false'
    }
    this.toggleDarkMode = this.toggleDarkMode.bind(this);
  }
  componentDidMount() {
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    this.setState({darkMode : storedDarkMode})
  }

  toggleDarkMode() {
    const newDarkMode = !(this.state.darkMode);
    this.setState({darkMode : newDarkMode})
    localStorage.setItem('darkMode', newDarkMode);
  }

  render() {
    let darkMode = this.state.darkMode;
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            transition: 'background 0.5s, color 0.5s',
            background: darkMode ? '#222222' : 'white',
            color: darkMode ? 'white' : '#222222',
            padding: "2rem",
            borderRadius: "12.5px",
            boxShadow: "0px 3px 15px rgba(0,0,0,0.2)",
            maxWidth: "90%",
            maxHeight: "80%",
            overflow: "auto",
          }}
        >
          {this.props.children}
        </div>

        <p
          style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            textAlign: "center"
          }}
        >
          &nbsp;
        ©{" "}
          <a href="https://www.pogify.net/" style={{ color: "white" }}>
            Pogify
        </a>{" "}
        |{" "}
          <Link to="/tos" style={{ color: "white" }}>
            Terms of Service
        </Link>{" "}
        |{" "}
          <Link to="/privacy" style={{ color: "white" }}>
            Privacy Policy
        </Link>{" "}
        |{" "}
          <a href="#" onClick={this.toggleDarkMode} style={{ color: "white" }}>Switch to {darkMode ? 'Light' : 'Dark'} Mode!</a>
          <br />
          <a href="https://www.spotify.com" style={{ color: "white" }}>Spotify</a> is copyright Spotify AB and is not affiliated with Pogify.
      </p>

      </div>
    );
  }
};

// Layout.propTypes = {
//   children: PropTypes.element.isRequired
// };
