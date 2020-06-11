<script>
  import { stores } from "@sapper/app";

  import { post } from "../api.js";
  import SubmitButton from "../components/SubmitButton.svelte";

  const { session } = stores();

  export let projectId;
  export let update;
  export let close;

  let name = "";
  let description = "";
  let files;

  const toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  $: addModel = async () => {
    await post(
      `/projects/${projectId}/models`,
      {
        name,
        description,
        file: await toBase64(files.item(0))
      },
      $session.user && $session.user.jwt
    );
    update();
    close();
  };
</script>

<h3>Upload a Model</h3>
<form>
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
  <fieldset>
    <label for="file">File to upload</label>
    <input type="file" id="file" name="file" bind:files />
  </fieldset>
  <SubmitButton handler={addModel}>Add</SubmitButton>
</form>
