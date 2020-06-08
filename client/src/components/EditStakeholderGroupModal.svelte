<script>
  import { put } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();
  import SubmitButton from "../components/SubmitButton.svelte";

  export let updateStakeholderGroup;
  export let close;
  export let group;

  let { name, description } = group;

  $: update = async () => {
    await put(
      `/stakeholders/${group.id}`,
      {
        name,
        description
      },
      $session.user && $session.user.jwt
    );
    await updateStakeholderGroup();
    close();
  };
</script>

<h3>Update stakeholder group</h3>
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
  <SubmitButton className="button-caution" handler={update}>Save</SubmitButton>
</form>
