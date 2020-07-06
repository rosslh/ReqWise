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
  import { stores } from "@sapper/app";
  import Notification from "../../components/Notification.svelte";
  import SubmitButton from "../../components/SubmitButton.svelte";
  import { slide } from "svelte/transition";

  const { session } = stores();

  let notifications = (async () => {
    const res = await get(`/alerts`, $session.user && $session.user.jwt);
    $unreadAlerts = !!res.length;
    return res;
  })();

  const update = async () => {
    notifications = await get(`/alerts`, $session.user && $session.user.jwt);
    $unreadAlerts = !!notifications.length;
  };

  const markAllRead = async () => {
    await put(`/alerts`, { is_read: true }, $session.user && $session.user.jwt); // bulk action
    $unreadAlerts = false;
    await update();
  };
</script>

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
        <Notification {notification} {update} />
      </div>
    {/each}
  {/await}
</section>
