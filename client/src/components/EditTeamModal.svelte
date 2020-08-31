<script>
  import { stores } from "@sapper/app";
  import { put } from "../api.js";
  export let name;
  export let description;
  export let teamId;
  export let update;
  export let close;

  const { session } = stores();

  import SubmitButton from "./SubmitButton.svelte";

  $: updateTeam = async () => {
    await put(
      `/teams/${teamId}`,
      { name, description },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Edit team</h3>
<form>
  <fieldset>
    <label for="name">Team name</label>
    <input id="name" type="text" bind:value={name} />
  </fieldset>
  <fieldset>
    <label for="description">Description</label>
    <input id="description" type="text" bind:value={description} />
  </fieldset>
  <SubmitButton handler={updateTeam}>Update</SubmitButton>
</form>
