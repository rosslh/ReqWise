<script>
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  export let id;
  export let update;
  export let close;
  let newProjectName = "";

  const submitNewProject = async () => {
    await post(
      `/teams/${id}/projects`,
      { name: newProjectName },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Create project</h3>
<form>
  <fieldset>
    <label for="projectName">Project name</label>
    <input type="text" bind:value={newProjectName} />
  </fieldset>
  <SubmitButton handler={submitNewProject}>Create</SubmitButton>
</form>
