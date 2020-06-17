<script>
  import { get } from "../../../../../api.js";
  import { stores } from "@sapper/app";

  import Reqgroup from "../../../../../components/Reqgroup.svelte";

  const { page, session } = stores();
  const { reqgroupId, id } = $page.params;

  let reqgroup = get(
    `/reqgroups/${reqgroupId}`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    reqgroup = await get(
      `/reqgroups/${reqgroupId}`,
      $session.user && $session.user.jwt
    );
  };
</script>

<style>
  div.backLink {
    padding: 1.5rem 0;
  }
</style>

<section class="contentWrapper">
  <div class="backLink">
    {#await reqgroup}
      <!-- loading -->
    {:then result}
      {#if result.type === 'business'}
        <a href={`/project/${id}/business-requirements`}>
          &larr;&nbsp;Go to business requirements
        </a>
      {:else if result.type === 'quality'}
        <a href={`/project/${id}/quality-attributes`}>
          &larr;&nbsp;Go to quality attributes
        </a>
      {:else}
        <a href={`/project/${id}/features`}>&larr;&nbsp;Go to features</a>
      {/if}
    {/await}
  </div>
  <h2>View requirement group</h2>
  {#await reqgroup}
    <!-- loading -->
  {:then result}
    <Reqgroup reqgroup={result} {update} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
