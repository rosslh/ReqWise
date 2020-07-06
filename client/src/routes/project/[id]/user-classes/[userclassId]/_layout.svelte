<script context="module">
  import { get } from "../../../../../api.js";
  export async function preload({ params }, { user }) {
    const userclass = await get(
      `/userclasses/${params.userclassId}`,
      user && user.jwt
    );
    return { userclass };
  }
</script>

<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  export let userclass;
</script>

{#if $page.path.split('/').length > 5}
  <div class="contentWrapper">
    <div class="backLink">
      <a
        rel="prefetch"
        href={`/project/${userclass.project_id}/user-classes/${userclass.id}`}>
        &larr;&nbsp;Go to user class
      </a>
    </div>
  </div>
{/if}
<slot />
