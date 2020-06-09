<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  import { get } from "../api.js";
  import Skeleton from "../components/Skeleton.svelte";
  import HistoryEntry from "../components/HistoryEntry.svelte";

  export let id;
  const { session } = stores();
  let versions = get(
    `/requirements/${id}/versions`,
    $session.user && $session.user.jwt
  );
</script>

{#await versions}
  <Skeleton rows={2} />
{:then result}
  {#each result as reqversion}
    <HistoryEntry {reqversion} />
  {/each}
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
