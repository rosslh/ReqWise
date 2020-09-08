<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api";
  import Userclass from "../../../../../components/Userclass.svelte";

  const { page, session } = stores();
  const { userclassId, id: projectId } = $page.params;

  let currentVersion = get(
    `/userclasses/${userclassId}`,
    $session.user && $session.user.jwt
  );

  let oldVersions = get(
    `/userclasses/${userclassId}/history`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    currentVersion = await get(
      `/userclasses/${userclassId}`,
      $session.user && $session.user.jwt
    );
    oldVersions = get(
      `/userclasses/${userclassId}/history`,
      $session.user && $session.user.jwt
    );
  };
</script>

<section class="contentWrapper">
  <h2>User class history</h2>
</section>
<section class="contentWrapper">
  <h3>Latest version</h3>
  {#await currentVersion}
    <!-- loading -->
  {:then userclass}
    <Userclass
      {userclass}
      baselineSourceId={userclassId}
      {projectId}
      {update} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
<section class="contentWrapper">
  <h3>Reviewed versions</h3>
  {#await oldVersions}
    <!-- loading -->
  {:then result}
    {#each result as userclass (userclass.id)}
      <Userclass
        {userclass}
        baselineSourceId={userclassId}
        {projectId}
        {update} />
    {/each}
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
