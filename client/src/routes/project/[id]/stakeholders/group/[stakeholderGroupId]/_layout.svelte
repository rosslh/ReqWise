<script context="module">
  import { get } from "../../../../../../api.js";
  export async function preload({ params }, { user }) {
    const stakeholderGroup = await get(
      `/stakeholders/${params.stakeholderGroupId}`,
      user && user.jwt
    );
    return { stakeholderGroup };
  }
</script>

<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  export let stakeholderGroup;
</script>

{#if $page.path.split('/').length > 6}
  <div class="contentWrapper">
    <div class="backLink">
      <a
        rel="prefetch"
        href={`/project/${stakeholderGroup.project_id}/stakeholders/group/${stakeholderGroup.id}`}>
        &larr;&nbsp;Go to stakeholder group
      </a>
    </div>
  </div>
{/if}
<slot />
