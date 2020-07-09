<script context="module">
  export async function preload({ path }, session) {
    if (!session.user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
  }
</script>

<script>
  import { get } from "../../api.js";
  import { stores, goto } from "@sapper/app";
  import Notification from "../../components/Notification.svelte";
  import { slide } from "svelte/transition";

  const { session, page } = stores();

  $: pageNumber = Number($page.query.page || 0);

  $: notifications = (async () => {
    const res = await get(
      `/alerts/read?page=${pageNumber}`,
      $session.user && $session.user.jwt
    );
    return res;
  })();

  $: update = async () => {
    notifications = await get(
      `/alerts/read?page=${pageNumber}`,
      $session.user && $session.user.jwt
    );
  };

  $: nextPage = async () => {
    goto(`/notifications/read?page=${pageNumber + 1}`);
  };

  $: previousPage = async () => {
    goto(`/notifications/read?page=${pageNumber - 1}`);
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
    text-align: center;
  }
</style>

<section class="contentWrapper">
  <h1>Read notifications</h1>
  <a
    rel="prefetch"
    href="/notifications"
    class="button button-secondary button-outline">
    View unread
  </a>
</section>
<section class="contentWrapper">
  {#await notifications}
    <!-- loading -->
  {:then result}
    {#each result as notification (notification.id)}
      <div out:slide|local>
        <Notification {notification} {update} context="notifications" />
      </div>
    {/each}
    {#if !result.length}
      <div class="secondary">No more results</div>
    {/if}
    {#if pageNumber && pageNumber > 0}
      <button
        on:click={previousPage}
        class="button button-secondary button-outline">
        Previous page
      </button>
    {/if}
    {#if result.length}
      <button
        on:click={nextPage}
        class="button button-secondary button-outline">
        Next page
      </button>
    {/if}
  {/await}
</section>
