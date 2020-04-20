<script>
  export let selectedReqs;
  export let close;
  export let update;

  import Select from "svelte-select";

  import { post } from "../api.js";

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  let priority = priorityOptions[1];
  let rationale = "";

  const updateRequirements = async () => {
    await Promise.all(
      selectedReqs.map(id =>
        post(`/requirements/${id}/versions`, {
          priority: priority.value,
          rationale
        })
      )
    );

    await update();
    close();
  };
</script>

<h3>Update Requirements Priorities</h3>
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
<button class="button-create" on:click={updateRequirements}>Update</button>
