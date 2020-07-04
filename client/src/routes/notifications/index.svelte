<script context="module">
  export async function preload({ path }, session) {
    if (!session.user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
  }
</script>

<script>
  import { get } from "../../api.js";
  import { stores } from "@sapper/app";
  import Notification from "../../components/Notification.svelte";

  const { session } = stores();

  const notifications = get(`/alerts`, $session.user && $session.user.jwt);
</script>

<div class="contentWrapper">
  <h1>Notifications</h1>
  {#await notifications}
    <!-- loading -->
  {:then result}
    {#each result as notification}
      <Notification {notification} />
    {/each}
  {/await}
</div>
