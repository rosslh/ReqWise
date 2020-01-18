<script>
  import { post } from "../api.js";
  export let id;
  export let update;
  export let close;
  let newProjectName = "";

  const submitNewProject = async () => {
    await post(`/teams/${id}/projects`, { name: newProjectName });
    await update();
    close();
  };
</script>

<fieldset>
  <label for="projectName">Project name</label>
  <input type="text" bind:value={newProjectName} />
</fieldset>
<button class="button-create" on:click={submitNewProject}>Create</button>
