<script>
  export let selectedReqs;
  export let close;
  export let update;

  import Select from "svelte-select";

  import { post } from "../api.js";

  const statusOptions = [
    { value: "proposed", label: "Proposed" },
    { value: "accepted", label: "Accepted" },
    { value: "inProgress", label: "In Progress" },
    { value: "implemented", label: "Implemented" }
  ];

  let status = statusOptions[0];

  const updateRequirements = async () => {
    await Promise.all(
      selectedReqs.map(id =>
        post(`/requirements/${id}/versions`, {
          status: status.value
        })
      )
    );

    await update();
    close();
  };
</script>

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
<button class="button-create" on:click={updateRequirements}>Update</button>
