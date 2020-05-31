<script>
  import Select from "svelte-select";
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  export let reqgroupId;
  export let update;
  export let close;
  export let isPrioritized;

  let description = "";
  let rationale = "";

  $: addReq = async e => {
    await post(
      `/reqgroups/${reqgroupId}/requirements`,
      {
        description,
        rationale,
        priority: isPrioritized ? priority.value : undefined,
        status: status.value
      },
      $session.user && $session.user.jwt
    );
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
    { value: "accepted", label: "Accepted" }
    // { value: "inProgress", label: "In Progress" },
    // { value: "implemented", label: "Implemented" }
  ];

  let priority = priorityOptions[1];
  let status = statusOptions[0];
</script>

<style>
  .secondary {
    color: var(--secondaryText);
    font-weight: 400;
  }
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
  {#if isPrioritized}
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
  {/if}
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
  <fieldset>
    <label for="desc">
      Reason for requirement
      <span class="secondary">(optional)</span>
    </label>
    <input
      type="text"
      id="rationale"
      name="rationale"
      class="newReqInput"
      placeholder="e.g. Discussed with client"
      bind:value={rationale} />
  </fieldset>
  <SubmitButton handler={addReq}>+ Add</SubmitButton>
</form>
