<script context="module">
  export async function preload({ params }, { user }) {
    const reqgroup = await get(
      `/reqgroups/${params.reqgroupId}`,
      user && user.jwt
    );
    return { reqgroup };
  }
</script>

<script>
  import { get } from "../../../../../api.js";
  import { reqgroupTypeLabels } from "../../../../../utils.js";
  import { stores } from "@sapper/app";

  import Reqgroup from "../../../../../components/Reqgroup.svelte";

  const { page, session } = stores();
  const { reqgroupId } = $page.params;

  export let reqgroup;

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
    View {reqgroupTypeLabels[reqgroup.type]}
    <span class="reqgroupPpuid">#{reqgroup.ppuid}</span>
  </h2>
  <Reqgroup {reqgroup} {update} />
</section>
