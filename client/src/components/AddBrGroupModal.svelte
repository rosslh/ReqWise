<script>
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  import SubmitButton from "../components/SubmitButton.svelte";

  const { session } = stores();

  export let id;
  export let update;
  export let close;

  $: addReqGroup = async () => {
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
  <SubmitButton id="addReqGroupModalButton" handler={addReqGroup}>
    Add
  </SubmitButton>
</form>
