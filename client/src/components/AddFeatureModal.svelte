<script>
  import { post } from "../api.js";
  import { toPrettyId } from "../utils.js";

  export let id;
  export let update;
  export let close;

  let description = "";
  let pretty_id = "";
  $: idFromName = toPrettyId(description);

  $: addFeature = async e => {
    e.preventDefault();
    await post(`/projects/${id}/features`, {
      name: description,
      pretty_id: pretty_id || idFromName
    });
    update();
    close();
  };
</script>

<h3>Add a Feature</h3>
<form>
  <fieldset>
    <label for="desc">Description</label>
    <input
      type="text"
      id="desc"
      name="desc"
      class="newReqInput"
      bind:value={description} />
  </fieldset>
  <fieldset class="inline">
    <label for="prettyId">Unique ID</label>
    <input
      type="text"
      id="prettyId"
      name="prettyId"
      class="newReqInput solidPlaceholder"
      placeholder={idFromName}
      bind:value={pretty_id} />
  </fieldset>
  <button class="button-create" on:click={addFeature}>+ Add</button>
</form>
