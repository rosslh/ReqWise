<script>
  import { del, get } from "../../../api.js";
  import { stores, goto } from "@sapper/app";
  import { onMount } from "svelte";
  const { page } = stores();
  const { id } = $page.params;

  let team_id = null;

  onMount(async () => {
    ({ team_id } = await get(`/projects/${id}`));
  });

  const deleteProject = async () => {
    await del(`/projects/${id}`).then(r => {
      goto(`/team/${team_id}`);
    });
  };
</script>

<section class="contentWrapper">
  <h2>Danger Zone</h2>
  <button on:click={deleteProject} class="button-danger">Delete project</button>
</section>
