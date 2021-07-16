<script lang="ts">
  import logo from "$assets/logo512.png";

  import { theme } from "$stores/theme";
  $: isDarkTheme = $theme === "dark";
</script>

<div class="flex justify-between items-center">
  <a href="/" class="flex items-center">
    <img src={logo} alt="pogify" class="inline w-14 h-14 mr-4" />
    <h1 class="inline text-3xl uppercase text-light">pogify</h1>
  </a>

  <label class="text-light font-bold" name="themeSelector">
    Dark?
    <input
      type="checkbox"
      name="theme"
      id="themeSelector"
      checked={isDarkTheme}
      on:change={() => ($theme = isDarkTheme ? "light" : "dark")}
    />
  </label>
</div>
