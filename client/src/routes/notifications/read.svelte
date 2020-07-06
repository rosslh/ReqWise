<script context="module">
  export async function preload({ path }, session) {
    if (!session.user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
  }
</script>

<script>
  import { get } from "../../api.js";
  import { slide } from "svelte/transition";
  import { stores } from "@sapper/app";
  import Notification from "../../components/Notification.svelte";

  const { session, page } = stores();

  let notifications = get(`/alerts/read`, $session.user && $session.user.jwt);

  const update = async () => {
    notifications = await get(
      `/alerts/read`,
      $session.user && $session.user.jwt
    );
  };
</script>

<section class="contentWrapper">
  <h1>Notifications</h1>
  <a href={`/notifications`} class="button button-secondary button-outline">
    View unread
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
