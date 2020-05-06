<script>
  import { stores } from "@sapper/app";
  const { session } = stores();
  import Select from "svelte-select";
  import { get, post } from "../api.js";
  import { onMount } from "svelte";
  import Skeleton from "./Skeleton.svelte";

  export let id;
  export let update;
  export let close;
  export let isPrioritized;

  let description;
  let priority;
  let rationale;

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  let repropose = true;

  onMount(async () => {
    const res = await get(
      `/requirements/${id}`,
      $session.user && $session.user.jwt
    );
    description = res.latestVersion.description;
    priority = priorityOptions.find(
      option => option.value === res.latestVersion.priority
    );
  });

  const updateRequirement = async () => {
    const data = {
      description,
      priority: priority.value,
      status: repropose ? "proposed" : undefined,
      rationale
    };
    await post(
      `/requirements/${id}/versions`,
      data,
      $session.user && $session.user.jwt
    );
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
{#if isPrioritized}
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
{/if}
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
