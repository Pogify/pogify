<script lang="ts">
  import {Circle} from "svelte-loading-spinners"
  import {theme} from "$stores/theme"

  let isCreating = false

</script>

{#if isCreating}
  <div class="flex items-center gap-x-3">
    <Circle size={35} color={$theme === "light" ? "#1a1917" : "white"} />
    <div>
      Creating New Session
    </div>
  </div>
{:else}
  <button type="button" 
    on:click={()=>isCreating=true} class="bg-blue-400 dark:bg-indigo-400 text-light p-3 rounded-lg hover:shadow-xl transition-shadow dark:hover:ring-2 dark:hover:ring-indigo-100">Host a Session</button>
{/if}

