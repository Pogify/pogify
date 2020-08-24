import React from "react";
import { Link } from "react-router-dom";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../styles/Layout.css";
import {observer} from "mobx-react"
import { useStores } from "../hooks/useStores";


const Layout = ({children}) => {
  let {theme, toggleTheme} = useStores().themeStore
  
  let contentClass = "content";
  const darkMode = theme === "dark"
  if (darkMode) {
    contentClass += " darkContent";
  }

  return (
      <div className="layout">
        <button onClick={toggleTheme} className={"mode-toggle"}><FontAwesomeIcon icon={darkMode ? faSun : faMoon} size="3x" style={{ color: darkMode ? '#ffffff' : '#222222' }}/></button>
        <div className={contentClass}>{children}</div>
        <footer className="footer">
          © <a href="https://www.pogify.net/">Pogify</a> |&nbsp;
          <Link to="/tou">Terms of Use</Link> |&nbsp;
          <Link to="/privacy">Privacy Policy</Link>
          <br/>
          <a href="https://www.spotify.com">Spotify</a> is copyright Spotify AB
          and is not affiliated with Pogify.
        </footer>
      </div>

  )
}

export default observer(Layout)