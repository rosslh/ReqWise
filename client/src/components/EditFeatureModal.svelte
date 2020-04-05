<script>
  import { put } from "../api.js";

  export let featureId;
  export let updateFeature;
  export let close;

  export let feature;
  let { name, pretty_id } = feature;

  $: update = async e => {
    e.preventDefault();
    await put(`/features/${featureId}`, {
      name,
      pretty_id
    });
    updateFeature();
    close();
  };
</script>

<h3>Edit Feature</h3>
<form>
  <fieldset>
    <label for="desc">Description</label>
    <input
      type="text"
      id="desc"
      name="desc"
      class="newReqInput"
      bind:value={name} />
  </fieldset>
  <fieldset class="inline">
    <label for="prettyId">Unique ID</label>
    <input
      type="text"
      id="prettyId"
      name="prettyId"
      class="newReqInput"
      bind:value={pretty_id} />
  </fieldset>
  <button class="button-create" on:click={update}>Save</button>
</form>
