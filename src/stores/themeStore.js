import { action, extendObservable } from "mobx";

const AvailableThemes = ["light", "dark"];

export class ThemeStore {
  theme = "light";

  constructor() {
    // get system default
    let systemDefault = window.matchMedia("(prefers-color-scheme: dark)")
      ? "dark"
      : "light";
    // get previous stored theme setting
    let savedTheme = window.localStorage.getItem("theme");

    // validate saved theme
    savedTheme = AvailableThemes.includes(savedTheme) ? savedTheme : undefined;
    console.log();
    extendObservable(this, {
      theme: savedTheme || systemDefault,
    });
  }

  setTheme = action((theme) => {
    window.localStorage.setItem("theme", theme);
    this.theme = theme;
  });

  toggleTheme = action(() => {
    if (this.theme === "light") {
      this.theme = "dark";
    } else {
      this.theme = "light";
    }
    window.localStorage.setItem("theme", this.theme);
  });
}
