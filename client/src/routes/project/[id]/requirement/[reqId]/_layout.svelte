<script context="module">
  import { get } from "../../../../../api.js";
  export async function preload({ params, path }, { user }) {
    if (!user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
    const requirement = await get(
      `/requirements/${params.reqId}`,
      user && user.jwt
    );
    return { requirement };
  }
</script>

<script>
  export let requirement;
</script>

<style>
  div.backLink {
    padding: 1.5rem 0;
  }
</style>

<div class="contentWrapper">
  <div class="backLink">
    <a
      href={`/project/${requirement.project_id}/reqgroup/${requirement.reqgroup_id}`}>
      &larr;&nbsp;Go to requirement group
    </a>
  </div>
</div>
<slot />
