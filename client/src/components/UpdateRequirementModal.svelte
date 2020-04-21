<script>
  import Select from "svelte-select";
  import { get, patch, post } from "../api.js";
  import { toPrettyId } from "../utils.js";
  import { onMount } from "svelte";
  import Skeleton from "./Skeleton.svelte";

  export let id;
  export let update;
  export let close;

  let description;
  let priority;
  let rationale;
  let pretty_id;

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  let original_pretty_id = "";
  let repropose = true;

  onMount(async () => {
    const res = await get(`/requirements/${id}`);
    description = res.latestVersion.description;
    original_pretty_id = res.pretty_id;
    pretty_id = res.pretty_id;
    priority = priorityOptions.find(
      option => option.value === res.latestVersion.priority
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
      status: repropose ? "proposed" : undefined,
      rationale
    };
    await post(`/requirements/${id}/versions`, data);
    await update();
    close();
  };
</script>

<style>
  .proposed {
    color: var(--red);
    font-weight: 600;
  }
</style>

<h3>Update Requirement</h3>
<fieldset>
  <label for="desc">Description</label>
  {#if description || description === ''}
    <input
      type="text"
      id="desc"
      name="desc"
      class="newReqInput"
      bind:value={description} />
  {:else}
    <Skeleton noPadding />
  {/if}
</fieldset>
<fieldset class="inline">
  <label for="prettyId">Unique ID</label>
  {#if pretty_id || pretty_id === ''}
    <input
      type="text"
      id="prettyId"
      name="prettyId"
      class="newReqInput solidPlaceholder"
      bind:value={pretty_id} />
  {:else}
    <Skeleton noPadding inline />
  {/if}
</fieldset>
<fieldset class="inline">
  <label for="priority">Priority</label>
  <div class="selectWrapper">
    {#if priority || priority === ''}
      <Select
        inputAttributes={{ id: 'priority' }}
        isClearable={false}
        isSearchable={false}
        items={priorityOptions}
        bind:selectedValue={priority} />
    {:else}
      <Skeleton noPadding inline />
    {/if}
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
  <input id="repropose" type="checkbox" bind:checked={repropose} />
  <label class="label-inline" for="repropose">
    Change status to
    <span class="proposed">Proposed</span>
  </label>
</fieldset>
<button class="button-caution" on:click={updateRequirement}>Save</button>
