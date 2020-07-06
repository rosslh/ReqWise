<script context="module">
  import { get } from "../../../../../api.js";
  export async function preload({ params }, { user }) {
    const reqgroup = await get(
      `/reqgroups/${params.reqgroupId}`,
      user && user.jwt
    );
    return { reqgroup };
  }
</script>

<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  export let reqgroup;
</script>

{#if $page.path.split('/').length > 5}
  <div class="contentWrapper">
    <div class="backLink">
      <a
        rel="prefetch"
        href={`/project/${reqgroup.project_id}/reqgroup/${reqgroup.id}`}>
        &larr;&nbsp;Go to requirement group
      </a>
    </div>
  </div>
{/if}
<slot />
