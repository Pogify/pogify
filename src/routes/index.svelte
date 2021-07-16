<script lang="ts">
  import { goto } from "$app/navigation";

  import logo from "$assets/logo512.png";
  import { redirectToAuth, spotifyAccessToken } from "$lib/spotifyAPI";

  import CreateSession from "./_createSession.svelte"

  $: signedIn = !!$spotifyAccessToken;

  let sessionCode = "";

  const onGo = () => {
    goto(`/session/${sessionCode}`);
  };
</script>

<section
  class="flex flex-col items-center rounded-xl shadow-2xl bg-light dark:bg-dark dark:text-white p-[30px] py-[60px] sm:px-[80px] text-dark my-10"
>
  <div class="flex align-center">
    <img src={logo} alt="Pogify" height={70} width={70} />
    <div class="text-4xl sm:text-6xl  ml-3" style="line-height: 70px">POGIFY</div>
  </div>
  <br />
  <div class="text-center">
    Listen to music with your live audience without gettting DMCA striked!
  </div>
  <br />
  {#if signedIn}
    <div>
      <div class="text-center">
        <div>
          <form on:submit|preventDefault={onGo} class="whitespace-nowrap">
            <label for="sessionCode" class="block mb-2">Join a Session</label>
            <input
              type="text"
              minlength="5"
              maxlength="5"
              required
              name="sessionCode"
              id="sessionCode"
              bind:value={sessionCode}
              class="text-center border border-dark rounded-full p-1 pr-0 border-r-0 rounded-r-none outline-none dark:bg-dark dark:border-light"
              placeholder="Enter Session Code"
            />
            <button
              type="submit"
              class="border border-dark rounded-full p-1 pl-0 pr-2 ml-[-5px] border-l-0 rounded-l-none dark:border-light"
              >Go</button
            >
          </form>
        </div>
        <br />
        <div>&mdash; or &mdash;</div>
        <br />
        <CreateSession />
      </div>
    </div>
  {:else}
    <div>
      To get started, sign in to Spotify
      <button type="button" on:click={redirectToAuth}>Click here to Sign in</button>
    </div>
  {/if}
</section>
