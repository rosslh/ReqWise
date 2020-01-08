<script>
  import Select from "svelte-select";
  import { get, post } from "../api.js";
  import Modal from "./Modal.svelte";
  let isModalShown = false;

  let newReqText = "";
  let newReqId = "";

  const addReq = async e => {
    e.preventDefault();
    await post(`${uri}/requirements`, { id: "prettyId", description: newReq });
  };

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  const statusOptions = [
    { value: "proposed", label: "Proposed" },
    { value: "accepted", label: "Accepted" },
    { value: "inProgress", label: "In Progress" },
    { value: "implemented", label: "Implemented" }
  ];

  let newReqPriority = priorityOptions[1];
  let newReqStatus = statusOptions[0];
</script>

<style lang="scss">
  input.newReqInput {
    width: 100%;
  }
</style>

{#if isModalShown}
  <Modal bind:isModalShown>
    <h3>Add a Requirement</h3>
    <form>
      <label for="desc">Description</label>
      <input
        type="text"
        id="desc"
        name="desc"
        class="newReqInput"
        bind:value={newReqText} />
      <label for="prettyId">Unique ID</label>
      <input
        type="text"
        id="prettyId"
        name="prettyId"
        class="newReqInput"
        bind:value={newReqId} />
      <label for="priority">Priority</label>
      <Select items={priorityOptions} bind:selectedValue={newReqPriority} />
      <label for="status">Status</label>
      <Select items={statusOptions} bind:selectedValue={newReqStatus} />
      <button
        on:click={() => {
          alert('Create req');
        }}>
        + Add
      </button>
    </form>
  </Modal>
{/if}
<div>
  <button
    on:click={() => {
      isModalShown = true;
    }}>
    + Add
  </button>
</div>
