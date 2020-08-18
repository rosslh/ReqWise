<script>
  import { get } from "../api.js";
  import { stores } from "@sapper/app";
  import Notification from "./Notification.svelte";
  export let id;

  const { session } = stores();

  $: notifications = get(
    `/reqversions/${id}/history`,
    $session.user && $session.user.jwt
  );
</script>

{#await notifications}
  <!-- loading -->
{:then result}
  {#if result.length}
    <h5>Activity</h5>
  {/if}
  {#each result as notification (notification.id)}
    <Notification {notification} context="reqversion" compact={true} />
  {/each}
{/await}
