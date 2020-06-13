<script>
  import { put } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  export let close;
  export let update;
  export let file;

  let { name, description, id } = file;

  $: save = async () => {
    await put(
      `/files/${id}`,
      {
        name,
        description
      },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Update file details</h3>
<form>
  <fieldset>
    <label for="name">Name</label>
    <input type="text" id="name" bind:value={name} />
  </fieldset>
  <fieldset>
    <label for="desc">Description</label>
    <input type="text" id="desc" bind:value={description} />
  </fieldset>
  <SubmitButton className="button-caution" handler={save}>Save</SubmitButton>
</form>
