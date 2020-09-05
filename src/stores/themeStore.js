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
    const themeQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const systemDefault = themeQuery.matches
      ? "dark"
      : // if no match media then default to light
      "light";
    // get previous stored theme setting
    let savedTheme = window.localStorage.getItem("theme");

    // validate saved theme
    savedTheme = AvailableThemes.includes(savedTheme) ? savedTheme : undefined;

    if (typeof themeQuery.addEventListener === "function") {
      themeQuery.addEventListener("change", (e) => {
        if (typeof savedTheme === "undefined") {
          if (e.matches) {
            this.setTheme("dark", false)
          } else {
            this.setTheme("light", false)
          }
        }
      })
    }

    extendObservable(this, {
      theme: savedTheme || systemDefault,
    });
    document.documentElement.classList.add("theme-" + this.theme)
  }

  /**
   * set theme to string
   *
   * @param {string} theme theme to set
   * @param {boolean} save save the theme
   */
  setTheme = action((theme, save = true) => {
    // set theme in localStorage (only if not default)
    if (save === true)
      window.localStorage.setItem("theme", theme);
    // validate theme then set it
    if (AvailableThemes.includes(theme)) {
      this.theme = theme;
      AvailableThemes.forEach(theme => document.documentElement.classList.remove("theme-" + theme))
      AvailableThemes.forEach(theme => document.body.classList.remove("theme-" + theme))
      document.documentElement.classList.add("theme-" + theme);
      document.body.classList.add("theme-" + theme);
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
