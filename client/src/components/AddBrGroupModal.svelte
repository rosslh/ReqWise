<script>
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let id;
  export let update;
  export let close;

  $: addReqGroup = async e => {
    e.preventDefault();
    await post(
      `/projects/${id}/reqgroups`,
      {
        name: type,
        type: "business"
      },
      $session.user && $session.user.jwt
    );
    update();
    close();
  };

  let type = "";
</script>

<h3>Add a group of business requirements</h3>
<form>
  <fieldset>
    <label for="type">Business Requirement Type</label>
    <input type="text" bind:value={type} id="type" />
  </fieldset>
  <button class="button-create" on:click={addReqGroup}>+ Add</button>
</form>
