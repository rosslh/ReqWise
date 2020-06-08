<script>
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  export let id;
  export let update;
  export let close;

  let name = "";
  let description = "";

  $: addGroup = async () => {
    await post(
      `/projects/${id}/stakeholders`,
      {
        name,
        description
      },
      $session.user && $session.user.jwt
    );
    update();
    close();
  };
</script>

<h3>Add a Stakeholder Group</h3>
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
    <textarea
      type="text"
      id="desc"
      name="desc"
      class="newReqInput"
      bind:value={description} />
  </fieldset>
  <SubmitButton handler={addGroup}>Add</SubmitButton>
</form>
