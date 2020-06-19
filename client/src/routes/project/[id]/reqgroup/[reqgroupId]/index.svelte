<script>
  import { get } from "../../../../../api.js";
  import { stores } from "@sapper/app";

  import Reqgroup from "../../../../../components/Reqgroup.svelte";

  const { page, session } = stores();
  const { reqgroupId } = $page.params;

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
  .reqgroupPpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 1rem;
  }
</style>

<section class="contentWrapper">
  <h2>
    View requirement group
    {#await reqgroup}
      <!-- loading -->
    {:then result}
      <span class="reqgroupPpuid">#{result.ppuid}</span>
    {/await}
  </h2>
  {#await reqgroup}
    <!-- loading -->
  {:then result}
    <Reqgroup reqgroup={result} {update} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
