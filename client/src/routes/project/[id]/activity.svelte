<script>
  import { get } from "../../../api.js";
  import { stores } from "@sapper/app";
  import Notification from "../../../components/Notification.svelte";

  const { session, page } = stores();

  let notifications = get(
    `/projects/${$page.params.id}/activity`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    notifications = await get(
      `/projects/${$page.params.id}/activity`,
      $session.user && $session.user.jwt
    );
  };
</script>

<section class="contentWrapper">
  <h2>Activity</h2>
  {#await notifications}
    <!-- loading -->
  {:then result}
    {#each result as notification}
      <Notification {notification} {update} context="activity" />
    {/each}
  {/await}
</section>
