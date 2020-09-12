import React from "react";
import { Link } from "react-router-dom";
import styles from "./Layout.module.css";
import { observer } from "mobx-react";
import { themeStore } from "../stores";
import NewTabLink from "../components/utils/NewTabLink.jsx";

/**
 * Default layout component.
 * Center content view with footer
 */
function Layout(props) {
  let { theme, toggleTheme } = themeStore;

  let contentClass = `${styles.content}`;
  const darkMode = theme === "dark";
  if (darkMode) {
    contentClass += ` ${styles.darkContent}`;
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.pogifyLogo}>
          <img
            alt="Pogify Logo"
            className={styles.pogifyLogoImage}
            src="/logo192.png"
          ></img>
          <p className={styles.pogifyLogoText}>POGIFY</p>
        </Link>
        <div className={styles.themeContainer}>
          <p className={styles.themeText}>Theme</p>
          <div className={styles.themeSwitchContainer}>
            <input
              type="checkbox"
              name="Theme Switch"
              id="themeSwitchCheckbox"
              className={styles.themeSwitchCheckbox}
              tabIndex="0"
              onChange={toggleTheme}
              checked={!darkMode}
            />
            <label
              className={styles.themeSwitchLabel}
              htmlFor="themeSwitchCheckbox"
            >
              <span className={styles.themeSwitchInner}></span>
              <span className={styles.themeSwitch}>
                <img
                  className={
                    darkMode
                      ? styles.themeSwitchIconDark
                      : styles.themeSwitchIconLight
                  }
                  src={darkMode ? "/moon.svg" : "/sun.svg"}
                  alt=""
                />
              </span>
            </label>
          </div>
        </div>
      </header>
      <br />
      <div className={contentClass}>{props.children}</div>
      <br />
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <NewTabLink href="/tos">Terms of Use</NewTabLink>
          <NewTabLink href="/privacy">Privacy Policy</NewTabLink>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/Pogify/pogify"
          >
            GitHub
          </a>
        </div>
        <p>
          <a href="https://www.youtube.com">Youtube</a> is copyright Google Inc.
          and is not affiliated with Pogify.
        </p>
      </footer>
    </div>
  );
}

export default observer(Layout);
