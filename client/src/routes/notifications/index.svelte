<script context="module">
  export async function preload({ path }, session) {
    if (!session.user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
  }
</script>

<script>
  import { get, put } from "../../api.js";
  import { unreadAlerts } from "../../stores.js";
  import { stores, goto } from "@sapper/app";
  import Notification from "../../components/Notification.svelte";
  import SubmitButton from "../../components/SubmitButton.svelte";
  import { slide } from "svelte/transition";

  const { session, page } = stores();

  $: pageNumber = Number($page.query.page || 0);

  $: notifications = (async () => {
    const res = await get(
      `/alerts?page=${pageNumber}`,
      $session.user && $session.user.jwt
    );
    $unreadAlerts = !!res.length;
    return res;
  })();

  $: update = async () => {
    notifications = await get(
      `/alerts?page=${pageNumber}`,
      $session.user && $session.user.jwt
    );
    $unreadAlerts = !!notifications.length;
  };

  const markAllRead = async () => {
    await put(`/alerts`, { is_read: true }, $session.user && $session.user.jwt); // bulk action
    $unreadAlerts = false;
    await update();
  };

  $: nextPage = async () => {
    goto(`/notifications?page=${pageNumber + 1}`);
  };

  $: previousPage = async () => {
    goto(`/notifications?page=${pageNumber - 1}`);
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
    text-align: center;
  }
</style>

<section class="contentWrapper">
  <h1>Notifications</h1>
  <SubmitButton handler={markAllRead}>Mark as read</SubmitButton>
  <a
    rel="prefetch"
    href="/notifications/read"
    class="button button-secondary button-outline">
    View read
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
