<script>
  import { stores } from "@sapper/app";

  import { post, put } from "../api.js";
  import { toBase64, validateFileSize } from "../utils.js";
  import SubmitButton from "../components/SubmitButton.svelte";

  const { session } = stores();

  export let projectId;
  export let update;
  export let close;
  export let file;

  let name = file ? file.name : "";
  let description = file ? file.description : "";
  let files;

  $: addFile = async () => {
    if (!files || !files.length) {
      alert("No file selected");
      return;
    } else if (!validateFileSize(files[0])) {
      alert("File too large (1.5 MB maximum)");
      return;
    }
    if (file) {
      await put(
        `/files/${file.id}`,
        {
          name,
          description,
          file: await toBase64(files.item(0)),
          fileName: files[0].name,
        },
        $session.user && $session.user.jwt
      );
      update();
      close();
    } else {
      await post(
        `/projects/${projectId}/files`,
        {
          name,
          description,
          file: await toBase64(files.item(0)),
          fileName: files[0].name,
        },
        $session.user && $session.user.jwt
      );
      update();
      close();
    }
  };
</script>

<h3>Upload a {file ? 'new version' : 'file'}</h3>
<form>
  {#if !file}
    <fieldset>
      <label for="name">Title</label>
      <input
        type="text"
        id="name"
        name="name"
        class="newReqInput"
        bind:value={name} />
    </fieldset>
    <fieldset>
      <label for="desc">Description</label>
      <input
        type="text"
        id="desc"
        name="desc"
        class="newReqInput"
        bind:value={description} />
    </fieldset>
  {/if}
  <fieldset>
    <label for="file">File to upload</label>
    <input type="file" id="file" name="file" bind:files />
  </fieldset>
  <SubmitButton handler={addFile}>Upload</SubmitButton>
</form>
