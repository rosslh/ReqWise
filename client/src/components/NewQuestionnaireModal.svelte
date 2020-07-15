<script>
  import { stores, goto } from "@sapper/app";
  const { session } = stores();

  export let close;
  export let projectId;

  import { post } from "../api.js";

  import SubmitButton from "../components/SubmitButton.svelte";

  let title = "";

  const submitNewQuestionnaire = async () => {
    const [result] = await post(
      `/projects/${projectId}/questionnaires`,
      { title },
      $session.user && $session.user.jwt
    );
    goto(`/project/${projectId}/brainstorm/drafts/${result}`);
    close();
  };
</script>

<h3>Create questionnaire</h3>
<form>
  <fieldset>
    <label for="title">Title</label>
    <input type="text" id="title" bind:value={title} />
  </fieldset>
  <fieldset>
    <SubmitButton handler={submitNewQuestionnaire}>Create</SubmitButton>
  </fieldset>
</form>
