<script context="module">
  import { get } from "../../../../../api.js";
  export async function preload({ params }, { user }) {
    const requirement = await get(
      `/requirements/${params.reqId}`,
      user && user.jwt
    );
    return { requirement };
  }
</script>

<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  export let requirement;
</script>

{#if $page.path.split('/').length > 5}
  <div class="contentWrapper">
    <div class="backLink">
      <a
        rel="prefetch"
        href={`/project/${requirement.project_id}/requirement/${requirement.id}`}>
        &larr;&nbsp;Go to requirement
      </a>
    </div>
  </div>
{/if}
<slot />
