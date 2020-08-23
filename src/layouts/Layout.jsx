import React from "react";
import { Link } from "react-router-dom";
import "../styles/Layout.css";
import {observer} from "mobx-react"
import { useStores } from "../hooks/useStores";


const Layout = ({children}) => {
  let {theme, toggleTheme} = useStores().themeStore
  
  let contentClass = "content";
  if (theme === "dark") {
    contentClass += " darkContent";
  }

  return (
      <div className="layout">
        <div className={contentClass}>{children}</div>
        <footer className="footer">
          © <a href="https://www.pogify.net/">Pogify</a> |{" "}
          <Link to="/tou">Terms of Use</Link> |{" "}
          <Link to="/privacy">Privacy Policy</Link> |{" "}
          <button onClick={toggleTheme} className={"mode-toggle"}>
            Switch to {theme==="light" ? "Light" : "Dark"} Mode!
          </button>
          <br />
          <a href="https://www.spotify.com">Spotify</a> is copyright Spotify AB
          and is not affiliated with Pogify.
        </footer>
      </div>

  )
}
// class Layout extends React.Component {
//   // inject store 
//   static contextType = storesContext

//   render() {

//     return (
//     );
//   }
// }

export default observer(Layout)