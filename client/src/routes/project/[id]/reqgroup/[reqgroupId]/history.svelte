<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api";
  import Reqgroup from "../../../../../components/Reqgroup.svelte";

  const { page, session } = stores();
  const { reqgroupId } = $page.params;

  let currentVersion = get(
    `/reqgroups/${reqgroupId}`,
    $session.user && $session.user.jwt
  );

  let oldVersions = get(
    `/reqgroups/${reqgroupId}/history`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    currentVersion = await get(
      `/reqgroups/${reqgroupId}`,
      $session.user && $session.user.jwt
    );
    oldVersions = get(
      `/reqgroups/${reqgroupId}/history`,
      $session.user && $session.user.jwt
    );
  };
</script>

<section class="contentWrapper">
  <h2>Requirement group history</h2>
</section>
<section class="contentWrapper">
  <h3>Latest version</h3>
  {#await currentVersion}
    <!-- loading -->
  {:then result}
    <Reqgroup reqgroup={result} baselineSourceId={reqgroupId} {update} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
<section class="contentWrapper">
  <h3>Reviewed versions</h3>
  {#await oldVersions}
    <!-- loading -->
  {:then result}
    {#each result as reqgroup (reqgroup.id)}
      <Reqgroup {reqgroup} baselineSourceId={reqgroupId} {update} />
    {/each}
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
