<script>
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  import Select from "svelte-select";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  export let id;
  export let update;
  export let projects;
  export let close;

  let options = projects.map(project => ({
    label: project.name,
    value: project.id
  }));

  let selectedOption;

  const submitNewProject = async () => {
    await post(
      `/teams/${id}/project-templates`,
      { projectId: selectedOption.value },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Create template from project</h3>
<form>
  <fieldset>
    <label for="project">Project name</label>
    <Select
      inputAttributes={{ id: 'project' }}
      items={options}
      bind:selectedValue={selectedOption} />
  </fieldset>
  <SubmitButton handler={submitNewProject}>Create</SubmitButton>
</form>
