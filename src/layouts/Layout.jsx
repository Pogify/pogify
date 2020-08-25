import React from "react";
import { Link } from "react-router-dom";
import "../styles/Layout.css";
import {observer} from "mobx-react"
import { useStores } from "../hooks/useStores";


const Layout = ({children}) => {
  let {theme/*, toggleTheme*/} = useStores().themeStore
  
  let contentClass = "content";
  const darkMode = theme === "dark"
  if (darkMode) {
    contentClass += " darkContent";
  }

  return (
      <div className="layout">
        <div className={contentClass}>{children}</div>
        <footer className="footer">
          <div className="footer-links">
            <Link to="/tou">Terms of Use</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <a href="https://github.com/Pogify/pogify">GitHub</a>
          </div>
          <p><a href="https://www.spotify.com">Spotify</a> is copyright Spotify AB and is not affiliated with Pogify</p>
        </footer>
      </div>

  )
}

export default observer(Layout)