<script>
  import Select from "svelte-select";
  import { get, patch, post } from "../api.js";
  import { toPrettyId } from "../utils.js";
  import { onMount } from "svelte";

  export let id;
  export let update;
  export let close;

  let description = "";
  let rationale = "";
  let pretty_id = "";

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  let priority = priorityOptions[1];

  let original_pretty_id = "";
  let acceptAutomatically = false;

  onMount(async () => {
    const res = await get(`/requirements/${id}`);
    description = res.latest.description;
    original_pretty_id = res.pretty_id;
    pretty_id = res.pretty_id;
    priority = priorityOptions.find(
      option => option.value === res.latest.priority
    );
  });

  const updateRequirement = async () => {
    if (original_pretty_id !== pretty_id) {
      await patch(`/requirements/${id}`, {
        pretty_id
      });
    }
    const data = {
      description,
      priority: priority.value,
      status: acceptAutomatically ? "accepted" : "proposed",
      rationale
    };
    await post(`/requirements/${id}/versions`, data);
    await update();
    close();
  };
</script>

<style>
  .accept {
    color: var(--indigo);
    font-weight: 600;
  }
</style>

<h3>Update Requirement {id}</h3>
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
<fieldset>
  <label for="desc">Reason for change</label>
  <input
    type="text"
    id="rationale"
    name="rationale"
    class="newReqInput"
    bind:value={rationale} />
</fieldset>
<fieldset>
  <input
    id="acceptAutomatically"
    type="checkbox"
    bind:checked={acceptAutomatically} />
  <label class="label-inline" for="acceptAutomatically">
    <span class="accept">Accept</span>
    change without discussing
  </label>
</fieldset>
<button class="button-caution" on:click={updateRequirement}>Save</button>
