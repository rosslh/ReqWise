<script>
  import { post } from "../api.js";

  export let id;
  export let update;
  export let close;

  let description = "";

  $: addFeature = async e => {
    e.preventDefault();
    await post(`/projects/${id}/features`, {
      name: description
    });
    update();
    close();
  };
</script>

<h3>Add a Feature</h3>
<form>
  <fieldset>
    <label for="desc">Title</label>
    <input
      type="text"
      id="desc"
      name="desc"
      class="newReqInput"
      bind:value={description} />
  </fieldset>
  <button class="button-create" on:click={addFeature}>+ Add</button>
</form>
