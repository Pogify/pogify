import React from "react";
import { Link } from "react-router-dom";
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
        <div className={contentClass}>{children}</div>
        <footer className="footer">
          © <a href="https://www.pogify.net/">Pogify</a> |&nbsp;
          <Link to="/tou">Terms of Use</Link> |&nbsp;
          <Link to="/privacy">Privacy Policy</Link> |&nbsp;
          <button onClick={toggleTheme} className={"mode-toggle"}>{darkMode ? "Switch to light mode!" : "Switch to dark mode!"}</button>
          <br/>
          <a href="https://www.spotify.com">Spotify</a> is copyright Spotify AB
          and is not affiliated with Pogify.
        </footer>
      </div>

  )
}

export default observer(Layout)