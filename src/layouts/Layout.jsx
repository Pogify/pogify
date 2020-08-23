import React from "react";
import { Link } from "react-router-dom";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../styles/Layout.css";

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      darkMode: 'false'
    }
    this.toggleDarkMode = this.toggleDarkMode.bind(this)
    this.updateDarkMode = this.updateDarkMode.bind(this)
  }
  componentDidMount() {
    let storedDarkMode = false;
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (localStorage.getItem('darkMode') === null) {
      console.log('darkmodenotexist')
      storedDarkMode = darkQuery.matches === 'true';
    } else {
      storedDarkMode = localStorage.getItem('darkMode');
    }

    darkQuery.addEventListener('change', this.updateDarkMode);
    this.setState({ darkMode: storedDarkMode })
  }

  updateDarkMode(event) {
    if (event.matches && this.state.darkMode === true) return;
    if (!event.matches && this.state.darkMode === false) return;
    this.toggleDarkMode();
  }

  toggleDarkMode() {
    const newDarkMode = !(this.state.darkMode);
    this.setState({ darkMode: newDarkMode })
    localStorage.setItem('darkMode', newDarkMode);
  }

  render() {
    let darkMode = this.state.darkMode;

    let contentClass = 'content';
    if (darkMode) {
      contentClass += ' darkContent';
    }

    return (
      <div className="layout">
        <button onClick={this.toggleDarkMode} className={"mode-toggle"} id={"colourToggle"}>{darkMode ? <FontAwesomeIcon icon={faSun} size="5x" style={{ color: '#222222' }}/> : <FontAwesomeIcon icon={faMoon} size="5x"/>}</button>
        <div className={contentClass}>
          {this.props.children}
        </div>
        <footer className="footer">
          ©{" "}
          <a href="https://www.pogify.net/">Pogify</a> |&nbsp;
          <Link to="/tou">Terms of Use</Link> |&nbsp;
          <Link to="/privacy">Privacy Policy</Link>
          <br/>
          <a href="https://www.spotify.com">Spotify</a> is copyright Spotify AB and is not affiliated with Pogify.
        </footer>

      </div >
    );
  }
};
