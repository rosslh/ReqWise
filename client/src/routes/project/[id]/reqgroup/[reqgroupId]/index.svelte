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

<section class="contentWrapper">
  <h2>View requirement group</h2>
  {#await reqgroup}
    <!-- loading -->
  {:then result}
    <Reqgroup reqgroup={result} {update} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
