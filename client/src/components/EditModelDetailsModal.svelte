<script>
  import { put } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let close;
  export let update;
  export let model;

  let { name, description, id } = model;

  $: save = async () => {
    await put(
      `/models/${id}`,
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

<h3>Update model details</h3>
<form>
  <fieldset>
    <label for="name">Name</label>
    <input type="text" id="name" bind:value={name} />
  </fieldset>
  <fieldset>
    <label for="desc">Description</label>
    <input type="text" id="desc" bind:value={description} />
  </fieldset>
  <button class="button-caution" on:click|preventDefault={save}>Save</button>
</form>
