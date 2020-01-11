<script>
  import Select from "svelte-select";
  import { get, post } from "../api.js";
  import Modal from "./Modal.svelte";

  export let id;
  export let update;

  let isModalShown = false;

  let description = "";
  let pretty_id = "";

  $: addTeam = async e => {
    e.preventDefault();
    await post(`/projects/${id}/features`, {
      name: description,
      pretty_id
    });
    update();
    isModalShown = false;
  };
</script>

<style>

</style>

{#if isModalShown}
  <Modal bind:isModalShown>
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
          class="newReqInput"
          bind:value={pretty_id} />
      </fieldset>
      <button class="button-create" on:click={addTeam}>+ Add</button>
    </form>
  </Modal>
{/if}
<div>
  <button
    class="button-create"
    on:click={() => {
      isModalShown = true;
    }}>
    + Add Feature
  </button>
</div>
