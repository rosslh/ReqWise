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

  const { session } = stores();

  let notifications = get(`/alerts`, $session.user && $session.user.jwt);

  $: {
    if (Array.isArray(notifications)) {
      // promise fulfilled
      $unreadAlerts = !!notifications.length;
    }
  }

  const update = async () => {
    notifications = await get(`/alerts`, $session.user && $session.user.jwt);
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
    href={`/notifications/read`}
    class="button button-secondary button-outline">
    View read
  </a>
</section>
<section class="contentWrapper">
  {#await notifications}
    <!-- loading -->
  {:then result}
    {#each result as notification}
      <Notification {notification} {update} />
    {/each}
  {/await}
</section>
