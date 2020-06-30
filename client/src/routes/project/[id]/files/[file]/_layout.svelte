<script context="module">
  import { get } from "../../../../../api.js";
  export async function preload({ params }, { user }) {
    const file = await get(`/files/${params.file}`, user && user.jwt);
    return { file };
  }
</script>

<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  export let file;
</script>

{#if $page.path.split('/').length > 5}
  <div class="contentWrapper">
    <div class="backLink">
      <a href={`/project/${file.project_id}/files/${file.id}`}>
        &larr;&nbsp;Go to file
      </a>
    </div>
  </div>
{/if}
<slot />
