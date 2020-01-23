<script>
  import Select from "svelte-select";
  import { post } from "../api.js";
  import { toPrettyId } from "../utils.js";

  export let uri;
  export let update;
  export let close;

  let description = "";
  let pretty_id = "";
  $: idFromName = toPrettyId(description);

  $: addReq = async e => {
    e.preventDefault();
    await post(`${uri}/requirements`, {
      pretty_id: pretty_id || idFromName,
      description,
      priority: priority.value,
      status: status.value
    });
    await update();
    close();
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

  let priority = priorityOptions[1];
  let status = statusOptions[0];
</script>

<style>

</style>

<h3>Add a Requirement</h3>
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
  <fieldset class="inline">
    <label for="priority">Priority</label>
    <div class="selectWrapper">
      <Select
        inputAttributes={{ id: 'priority' }}
        isClearable={false}
        isSearchable={false}
        items={priorityOptions}
        bind:selectedValue={priority} />
    </div>
  </fieldset>
  <fieldset class="inline">
    <label for="status">Status</label>
    <div class="selectWrapper">
      <Select
        inputAttributes={{ id: 'status' }}
        isClearable={false}
        isSearchable={false}
        items={statusOptions}
        bind:selectedValue={status} />
    </div>
  </fieldset>
  <button class="button-create" on:click={addReq}>+ Add</button>
</form>
