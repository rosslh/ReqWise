<script context="module">
  import { get } from "../../../../../api.js";
  export async function preload({ params }, { user }) {
    const currentVersion = await get(
      `/reqgroups/${params.reqgroupId}`,
      user && user.jwt
    );
    return { currentVersion };
  }
</script>

<script>
  import { stores } from "@sapper/app";
  import capitalize from "lodash/capitalize";
  // import { get } from "../../../../../api";
  import { reqgroupTypeLabels } from "../../../../../utils";
  import Reqgroup from "../../../../../components/Reqgroup.svelte";

  const { page, session } = stores();
  const { reqgroupId } = $page.params;

  export let currentVersion;

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
  <h2>{capitalize(reqgroupTypeLabels[currentVersion.type])} history</h2>
</section>
<section class="contentWrapper">
  <h3>Latest version</h3>
  <Reqgroup reqgroup={currentVersion} baselineSourceId={reqgroupId} {update} />
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
