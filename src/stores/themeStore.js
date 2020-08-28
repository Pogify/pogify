import { action, extendObservable } from "mobx";

/**
 * Available themes
 */
const AvailableThemes = ["light", "dark"];

/**
 * Theme Store manages Themes
 */
export class ThemeStore {
  constructor(messenger) {
    this.messenger = messenger;
    // get system default
    let systemDefault = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : // if no match media then default to light
      "light";
    // get previous stored theme setting
    let savedTheme = window.localStorage.getItem("theme");

    // validate saved theme
    savedTheme = AvailableThemes.includes(savedTheme) ? savedTheme : undefined;

    extendObservable(this, {
      theme: savedTheme || systemDefault,
    });
    document.documentElement.classList.add("theme-" + this.theme)
  }

  /**
   * set theme to string
   *
   * @param {string} theme theme to set
   */
  setTheme = action((theme) => {
    // set theme in localStorage
    window.localStorage.setItem("theme", theme);
    // validate theme then set it
    if (AvailableThemes.includes(theme)) {
      this.theme = theme;
      AvailableThemes.forEach(theme => document.documentElement.classList.remove("theme-" + theme))
      document.documentElement.classList.add("theme-" + theme)
    }
    // if theme not in available themes then do nothing
  });

  /**
   * Toggles theme between light and dark only
   */
  toggleTheme = action(() => {
    if (this.theme === "light") {
      this.setTheme("dark")
    } else {
      this.setTheme("light")
    }
  });
}
