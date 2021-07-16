<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { tradeTokenForCode, redirectToAuth, spotifyAccessToken } from "$lib/spotifyAPI";

  let codeTraded = false;

  $: signedIn = !!$spotifyAccessToken;

  $: if (signedIn) goto("/");

  onMount(() => {
    tradeTokenForCode().then(() => {
      codeTraded = true;
    });
  });
</script>

{#if !codeTraded}
  loading
{:else if signedIn}
  <div>
    Redirecting to home page. click <a href="/" class="underline">here</a> if you aren't redirected
  </div>
{:else}
  <div class="text-center">
    <div class="text-light">
      There was an issue during Spotify sign in. You must grant permissions in order to use <b
        >Pogify.</b
      >
    </div>
    <br />
    <button
      on:click={redirectToAuth}
      class="bg-light text-dark p-4 rounded-lg underline hover:shadow-xl transition-shadow"
      >Try again</button
    >
  </div>
{/if}
