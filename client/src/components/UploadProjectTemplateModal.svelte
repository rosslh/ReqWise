<script>
  export let update;
  export let close;
  export let teamId;

  import { stores } from "@sapper/app";
  const { session } = stores();

  import { toBase64, validateFileSize } from "../utils.js";
  import { post } from "../api.js";
  import SubmitButton from "./SubmitButton.svelte";

  let files = [];

  const submit = async () => {
    if (files.length && !validateFileSize(files[0])) {
      alert("File too large");
      return;
    }
    await post(
      `/teams/${teamId}/project-templates/uploads`,
      {
        file: files.length ? await toBase64(files.item(0)) : undefined,
      },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Upload template</h3>
<form>
  <fieldset>
    <label for="file">Template file</label>
    <input type="file" id="file" name="file" bind:files accept=".rqw" />
    {#if files.length}
      <p class="finishUploadMessage">Click submit to finish uploading</p>
    {/if}
  </fieldset>
  <SubmitButton handler={submit}>Upload</SubmitButton>
</form>
