<script lang="ts" context="module">
  import { browser } from "$app/env";
  import { initialize as initializeSpotify } from "$lib/spotifyAPI";
  import { get } from "svelte/store";
  import { appInitialized } from "$stores/initialized";

  export const load: import('@sveltejs/kit').Load = async () => {
    if (browser && !get(appInitialized)) {
      try {
        await initializeSpotify();
      } finally {
        appInitialized.set(true);
      }
    }
    return {};
  };
</script>

<script lang="ts">
  import "../app.postcss";
  import Footer from "./__layout/_footer.svelte";
  import Header from "./__layout/_header.svelte";
  import {Circle} from "svelte-loading-spinners"

  import { theme } from "$stores/theme";
  $: isDarkTheme = $theme === "dark";
</script>

<div class:dark={isDarkTheme}>
  <div
    class="min-h-screen transition-all duration-300 text-dark dark:text-light bg-gradient-to-br from-purple-400 to-purple-500 dark:bg-gradient-to-br dark:from-purple-900 dark:to-indigo-700"
  >
    <div class="flex justify-between flex-col min-h-screen max-w-2xl mx-auto p-6 ">
      <Header />

      {#if $appInitialized}
        <slot />  
      {:else}
        <div class="mx-auto">
          <Circle color="white" />
        </div>
      {/if}

      <Footer />
    </div>
  </div>
</div>
