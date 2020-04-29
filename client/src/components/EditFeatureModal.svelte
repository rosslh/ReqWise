<script>
  import { put } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let featureId;
  export let updateFeature;
  export let close;

  export let feature;
  let { name } = feature;

  $: update = async e => {
    e.preventDefault();
    await put(
      `/features/${featureId}`,
      {
        name
      },
      $session.jwt
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
