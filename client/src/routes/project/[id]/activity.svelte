<script>
  import { get } from "../../../api.js";
  import { stores, goto } from "@sapper/app";
  import Notification from "../../../components/Notification.svelte";

  const { session, page } = stores();

  $: pageNumber = Number($page.query.page || 0);

  $: notifications = get(
    `/projects/${$page.params.id}/activity?page=${pageNumber}`,
    $session.user && $session.user.jwt
  );

  $: update = async () => {
    notifications = await get(
      `/projects/${$page.params.id}/activity?page=${pageNumber}`,
      $session.user && $session.user.jwt
    );
  };

  $: nextPage = async () => {
    goto(`${$page.path}?page=${pageNumber + 1}`);
  };

  $: previousPage = async () => {
    goto(`${$page.path}?page=${pageNumber - 1}`);
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
