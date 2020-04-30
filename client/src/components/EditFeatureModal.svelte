<script>
  import { put } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let reqgroupId;
  export let updateFeature;
  export let close;

  export let reqgroup;
  let { name } = reqgroup;

  $: update = async e => {
    e.preventDefault();
    await put(
      `/reqgroups/${reqgroupId}`,
      {
        name
      },
      $session.user && $session.user.jwt
    );
    updateFeature();
    close();
  };
</script>

<h3>Update Feature</h3>
<form>
  <fieldset>
    <label for="desc">Title</label>
    <input
      type="text"
      id="desc"
      name="desc"
      class="newReqInput"
      bind:value={name} />
  </fieldset>
  <button class="button-caution" on:click={update}>Save</button>
</form>
